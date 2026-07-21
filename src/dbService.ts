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

// Authentication simulation states
const listeners: ((user: any) => void)[] = [];
let localUser: any = null;

try {
  const storedSession = localStorage.getItem('rakhi_crate_session');
  if (storedSession) {
    localUser = JSON.parse(storedSession);
  } else {
    localUser = { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' };
  }
} catch (e) {
  console.error('Error loading stored session:', e);
}

const notifyListeners = (user: any) => {
  localUser = user;
  if (user) {
    localStorage.setItem('rakhi_crate_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('rakhi_crate_session');
  }
  listeners.forEach(cb => cb(user));
};

const getLocalRegisteredUsers = (): any[] => {
  try {
    const raw = localStorage.getItem('rakhi_crate_users');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalRegisteredUsers = (users: any[]) => {
  localStorage.setItem('rakhi_crate_users', JSON.stringify(users));
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
    const guestUser = { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' };
    notifyListeners(guestUser);
    return guestUser;
  },

  async signInWithEmail(email: string, password: string): Promise<any> {
    if (isFirebaseConfigured && auth) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        return credential.user;
      } catch (error: any) {
        throw new Error(error.message || 'Firebase authentication failed');
      }
    }

    // Local Sandbox auth
    const users = getLocalRegisteredUsers();
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      throw new Error('User not found. Please check your credentials or create a new account.');
    }
    if (matched.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const sessionUser = { uid: matched.uid, isAnonymous: false, email: matched.email };
    notifyListeners(sessionUser);
    return sessionUser;
  },

  async signUpWithEmail(email: string, password: string): Promise<any> {
    if (isFirebaseConfigured && auth) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        return credential.user;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to create user account on Firebase');
      }
    }

    // Local Sandbox auth
    const users = getLocalRegisteredUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      uid: 'user-' + Math.random().toString(36).substr(2, 9),
      email: email,
      password: password
    };
    users.push(newUser);
    saveLocalRegisteredUsers(users);

    const sessionUser = { uid: newUser.uid, isAnonymous: false, email: newUser.email };
    notifyListeners(sessionUser);
    return sessionUser;
  },

  async signOut(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    // Set back to a clean guest account
    const guestUser = { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' };
    notifyListeners(guestUser);
  },

  onAuthStateChanged(callback: (user: any) => void): () => void {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (user) => {
        if (user) {
          callback(user);
        } else {
          // If no user on firebase auth, fallback to local session or default guest
          const stored = localStorage.getItem('rakhi_crate_session');
          if (stored) {
            callback(JSON.parse(stored));
          } else {
            callback({ uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' });
          }
        }
      });
    }
    
    // Local session observer
    listeners.push(callback);
    // Fire immediately with active local user
    callback(localUser || { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' });
    
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) {
        listeners.splice(idx, 1);
      }
    };
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
