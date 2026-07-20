import { db, auth, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { Order, CartItem } from './types';

const ORDERS_COLLECTION = 'orders';
const CART_COLLECTION = 'carts';

// Helper to get local storage orders as fallback
const getLocalOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem('rakhi_crate_orders');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local orders:', e);
    return [];
  }
};

const saveLocalOrders = (orders: Order[]) => {
  localStorage.setItem('rakhi_crate_orders', JSON.stringify(orders));
};

const getLocalCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem('rakhi_crate_cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local cart:', e);
    return [];
  }
};

const saveLocalCart = (cart: CartItem[]) => {
  localStorage.setItem('rakhi_crate_cart', JSON.stringify(cart));
};

export const dbService = {
  // Authentication
  async signInAnonymously(): Promise<any> {
    if (isFirebaseConfigured && auth) {
      try {
        const credential = await signInAnonymously(auth);
        return credential.user;
      } catch (error) {
        console.error('Firebase Auth failed, continuing in demo mode:', error);
      }
    }
    return { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' };
  },

  async signOut(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
  },

  onAuthStateChanged(callback: (user: any) => void): () => void {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (user) => {
        if (user) {
          callback(user);
        } else {
          callback({ uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' });
        }
      });
    }
    // Simulate immediately
    callback({ uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' });
    return () => {};
  },

  // Orders
  async saveOrder(order: Order): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
        console.log(`Order ${order.id} synchronized with Firestore!`);
        return;
      } catch (error) {
        console.error('Failed to save order to Firestore, saving locally:', error);
      }
    }
    // Fallback
    const current = getLocalOrders();
    const updated = [...current.filter(o => o.id !== order.id), order];
    saveLocalOrders(updated);
  },

  async getOrders(): Promise<Order[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, ORDERS_COLLECTION));
        const querySnapshot = await getDocs(q);
        const fetched: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push(doc.data() as Order);
        });
        if (fetched.length > 0) {
          return fetched;
        }
      } catch (error) {
        console.error('Failed to fetch orders from Firestore, using local storage:', error);
      }
    }
    return getLocalOrders();
  },

  subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, ORDERS_COLLECTION));
        return onSnapshot(q, (snapshot) => {
          const updatedOrders: Order[] = [];
          snapshot.forEach((doc) => {
            updatedOrders.push(doc.data() as Order);
          });
          callback(updatedOrders);
        }, (error) => {
          console.error('Firestore listener error:', error);
          callback(getLocalOrders());
        });
      } catch (e) {
        console.error('Failed to setup Firestore listener:', e);
      }
    }
    
    // Fallback polling/immediate callback
    callback(getLocalOrders());
    
    // Simulate real-time updates occasionally checking localStorage
    const interval = setInterval(() => {
      callback(getLocalOrders());
    }, 3000);

    return () => clearInterval(interval);
  },

  // Cart persistence
  async saveCart(cart: CartItem[], userId: string = 'anonymous'): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, CART_COLLECTION, userId), { cart, updatedAt: new Date().toISOString() });
        return;
      } catch (error) {
        console.error('Failed to save cart to Firestore:', error);
      }
    }
    saveLocalCart(cart);
  },

  async getCart(userId: string = 'anonymous'): Promise<CartItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, CART_COLLECTION, userId);
        const querySnapshot = await getDocs(collection(db, CART_COLLECTION));
        let fetched: CartItem[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.id === userId) {
            fetched = doc.data().cart as CartItem[];
          }
        });
        if (fetched.length > 0) {
          return fetched;
        }
      } catch (error) {
        console.error('Failed to fetch cart from Firestore:', error);
      }
    }
    return getLocalCart();
  }
};
