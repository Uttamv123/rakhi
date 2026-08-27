import {
  signIn,
  signUp,
  signOut as amplifySignOut,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { isAwsConfigured, awsConfig, getDynamoClient } from './aws-config';
import { Order, CartItem, WishlistItem } from './types';

const TABLE_NAME = awsConfig.dynamoTableName;

// ─── Newsletter ───────────────────────────────────────────────────────────────

const getLocalNewsletterEmails = (): string[] => {
  try {
    const raw = localStorage.getItem('rakhi_newsletter_emails');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveLocalNewsletterEmail = (email: string) => {
  const existing = getLocalNewsletterEmails();
  if (!existing.includes(email.toLowerCase())) {
    existing.push(email.toLowerCase());
    localStorage.setItem('rakhi_newsletter_emails', JSON.stringify(existing));
  }
};

// ─── Local Storage Helpers ───────────────────────────────────────────────────

const getLocalOrders = (userId?: string): Order[] => {
  try {
    const raw = localStorage.getItem('rakhi_crate_orders');
    const all: Order[] = raw ? JSON.parse(raw) : [];
    if (!userId) return all;
    // Return only orders belonging to this user
    return all.filter(o => o.userId === userId);
  } catch (e) {
    console.error('Error reading local orders:', e);
    return [];
  }
};

const saveLocalOrders = (orders: Order[]) => {
  // Merge with existing orders from other users so we don't overwrite them
  try {
    const raw = localStorage.getItem('rakhi_crate_orders');
    const all: Order[] = raw ? JSON.parse(raw) : [];
    const updatedIds = new Set(orders.map(o => o.id));
    const otherUsersOrders = all.filter(o => !updatedIds.has(o.id));
    localStorage.setItem('rakhi_crate_orders', JSON.stringify([...otherUsersOrders, ...orders]));
  } catch (e) {
    localStorage.setItem('rakhi_crate_orders', JSON.stringify(orders));
  }
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

const getLocalWishlist = (): WishlistItem[] => {
  try {
    const raw = localStorage.getItem('rakhi_crate_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local wishlist:', e);
    return [];
  }
};

const saveLocalWishlist = (wishlist: WishlistItem[]) => {
  localStorage.setItem('rakhi_crate_wishlist', JSON.stringify(wishlist));
};

// ─── Local Auth Simulation (Demo Mode) ──────────────────────────────────────

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
  localUser = { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' };
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

// ─── Helper: Get current user ID ────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  if (!isAwsConfigured) {
    return localUser?.uid || 'demo-user-123';
  }
  try {
    const user = await getCurrentUser();
    return user.userId;
  } catch {
    return localUser?.uid || 'demo-user-123';
  }
}

// ─── Exported Service ────────────────────────────────────────────────────────

export const dbService = {
  // ─── Authentication ──────────────────────────────────────────────────────

  async signInAnonymously(): Promise<any> {
    if (isAwsConfigured) {
      // With AWS configured, return a guest user (Identity Pool handles unauthenticated access)
      const guestUser = { uid: 'guest-' + Date.now(), isAnonymous: true, email: '' };
      notifyListeners(guestUser);
      return guestUser;
    }
    const guestUser = { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' };
    notifyListeners(guestUser);
    return guestUser;
  },

  async signInWithEmail(email: string, password: string): Promise<any> {
    if (isAwsConfigured) {
      try {
        const result = await signIn({ username: email, password });
        if (result.isSignedIn) {
          const user = await getCurrentUser();
          const sessionUser = { uid: user.userId, isAnonymous: false, email: email };
          notifyListeners(sessionUser);
          return sessionUser;
        }
        // If sign-in requires next step (e.g., MFA, confirm sign up)
        if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
          throw new Error('Please verify your email before signing in. Check your inbox for a verification code.');
        }
        throw new Error('Sign-in requires additional steps. Please try again.');
      } catch (error: any) {
        if (error.name === 'UserNotFoundException' || error.name === 'UserNotFoundError') {
          throw new Error('User not found. Please check your credentials or create a new account.');
        }
        if (error.name === 'NotAuthorizedException') {
          throw new Error('Incorrect password. Please try again.');
        }
        if (error.name === 'UserNotConfirmedException') {
          throw new Error('Please verify your email before signing in. Check your inbox for a verification code.');
        }
        // Re-throw if it's already a user-friendly message
        if (error.message && !error.name?.includes('Exception')) {
          throw error;
        }
        throw new Error(error.message || 'Authentication failed. Please try again.');
      }
    }

    // Local Sandbox auth
    const users = getLocalRegisteredUsers();
    const matched = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
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
    if (isAwsConfigured) {
      try {
        const result = await signUp({
          username: email,
          password,
          options: {
            userAttributes: { email },
          },
        });
        // User needs to confirm sign up with verification code
        const pendingUser = { uid: result.userId || email, isAnonymous: false, email, needsConfirmation: true };
        notifyListeners(pendingUser);
        return pendingUser;
      } catch (error: any) {
        if (error.name === 'UsernameExistsException') {
          throw new Error('An account with this email address already exists.');
        }
        throw new Error(error.message || 'Failed to create user account.');
      }
    }

    // Local Sandbox auth
    const users = getLocalRegisteredUsers();
    const exists = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      uid: 'user-' + Math.random().toString(36).substr(2, 9),
      email: email,
      password: password,
    };
    users.push(newUser);
    saveLocalRegisteredUsers(users);

    const sessionUser = { uid: newUser.uid, isAnonymous: false, email: newUser.email };
    notifyListeners(sessionUser);
    return sessionUser;
  },

  async confirmSignUpCode(email: string, code: string): Promise<any> {
    if (isAwsConfigured) {
      try {
        await confirmSignUp({ username: email, confirmationCode: code });
        return { confirmed: true };
      } catch (error: any) {
        if (error.name === 'CodeMismatchException') {
          throw new Error('Invalid verification code. Please check and try again.');
        }
        if (error.name === 'ExpiredCodeException') {
          throw new Error('Verification code has expired. Please request a new code.');
        }
        throw new Error(error.message || 'Verification failed. Please try again.');
      }
    }
    return { confirmed: true };
  },

  async resetPassword(email: string): Promise<void> {
    if (isAwsConfigured) {
      try {
        await resetPassword({ username: email });
      } catch (error: any) {
        if (error.name === 'UserNotFoundException') {
          throw new Error('No account found for that email address.');
        }
        throw new Error(error.message || 'Failed to send reset code.');
      }
    }
  },

  async confirmResetPassword(email: string, code: string, newPassword: string): Promise<void> {
    if (isAwsConfigured) {
      try {
        await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      } catch (error: any) {
        if (error.name === 'CodeMismatchException') {
          throw new Error('Invalid verification code. Please check and try again.');
        }
        if (error.name === 'ExpiredCodeException') {
          throw new Error('Verification code has expired. Please request a new code.');
        }
        throw new Error(error.message || 'Password reset failed.');
      }
    }
  },

  async signOut(): Promise<void> {
    if (isAwsConfigured) {
      try {
        await amplifySignOut();
      } catch (e) {
        console.error('AWS sign out error:', e);
      }
    }
    const guestUser = { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' };
    notifyListeners(guestUser);
  },

  onAuthStateChanged(callback: (user: any) => void): () => void {
    if (isAwsConfigured) {
      // Check current session immediately
      getCurrentUser()
        .then((user) => {
          callback({ uid: user.userId, isAnonymous: false, email: user.signInDetails?.loginId || '' });
        })
        .catch(() => {
          callback({ uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' });
        });

      // Listen for auth events via Amplify Hub
      const hubListener = Hub.listen('auth', ({ payload }) => {
        switch (payload.event) {
          case 'signedIn':
            getCurrentUser()
              .then((user) => {
                callback({ uid: user.userId, isAnonymous: false, email: user.signInDetails?.loginId || '' });
              })
              .catch(() => {});
            break;
          case 'signedOut':
            callback({ uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' });
            break;
          case 'tokenRefresh_failure':
            callback({ uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' });
            break;
        }
      });

      return () => {
        hubListener();
      };
    }

    // Local session observer
    listeners.push(callback);
    callback(localUser || { uid: 'demo-user-123', isAnonymous: true, email: 'demo@rakhicrate.co.uk' });

    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) {
        listeners.splice(idx, 1);
      }
    };
  },

  // ─── Orders ──────────────────────────────────────────────────────────────

  async saveOrder(order: Order): Promise<void> {
    const userId = await getCurrentUserId();
    const orderWithUser: Order = { ...order, userId };

    if (isAwsConfigured && localUser && !localUser.isAnonymous) {
      const client = await getDynamoClient();
      if (client) {
        try {
          await client.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              userId,
              sk: `ORDER#${orderWithUser.id}`,
              ...orderWithUser,
              createdAt: orderWithUser.createdAt || new Date().toISOString(),
            },
          }));
          console.log(`Order ${orderWithUser.id} saved to DynamoDB!`);
          return;
        } catch (error) {
          console.error('Failed to save order to DynamoDB, saving locally:', error);
        }
      }
    }
    // Local: fetch all orders for this user, upsert, then save back
    const current = getLocalOrders(userId);
    const updated = [...current.filter(o => o.id !== orderWithUser.id), orderWithUser];
    saveLocalOrders(updated);
  },

  async getOrders(): Promise<Order[]> {
    const userId = await getCurrentUserId();
    if (isAwsConfigured && localUser && !localUser.isAnonymous) {
      const client = await getDynamoClient();
      if (client) {
        try {
          const result = await client.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'userId = :uid AND begins_with(sk, :prefix)',
            ExpressionAttributeValues: {
              ':uid': userId,
              ':prefix': 'ORDER#',
            },
          }));
          const orders = (result.Items || []).map((item: any) => {
            const { userId: _uid, sk: _sk, ...orderData } = item;
            return orderData as Order;
          });
          // Sort by createdAt descending
          orders.sort((a: Order, b: Order) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          if (orders.length > 0) {
            return orders;
          }
        } catch (error) {
          console.error('Failed to fetch orders from DynamoDB, using local storage:', error);
        }
      }
    }
    // Filter local orders by current userId
    return getLocalOrders(userId);
  },

  subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    if (isAwsConfigured && localUser && !localUser.isAnonymous) {
      // Initial fetch
      this.getOrders().then(callback).catch(() => callback(getLocalOrders(localUser?.uid)));

      // Poll every 3 seconds
      const interval = setInterval(() => {
        this.getOrders().then(callback).catch(() => callback(getLocalOrders(localUser?.uid)));
      }, 3000);

      return () => clearInterval(interval);
    }

    // Fallback: immediate callback + polling localStorage filtered by userId
    const userId = localUser?.uid;
    callback(getLocalOrders(userId));
    const interval = setInterval(() => {
      callback(getLocalOrders(userId));
    }, 3000);

    return () => clearInterval(interval);
  },

  // ─── Cart ────────────────────────────────────────────────────────────────

  async saveCart(cart: CartItem[], userId: string = 'anonymous'): Promise<void> {
    if (isAwsConfigured && userId !== 'anonymous' && localUser && !localUser.isAnonymous) {
      const client = await getDynamoClient();
      if (client) {
        try {
          await client.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              userId,
              sk: 'CART#current',
              items: cart,
              updatedAt: new Date().toISOString(),
            },
          }));
          return;
        } catch (error) {
          console.error('Failed to save cart to DynamoDB:', error);
        }
      }
    }
    saveLocalCart(cart);
  },

  async getCart(userId: string = 'anonymous'): Promise<CartItem[]> {
    if (isAwsConfigured && userId !== 'anonymous' && localUser && !localUser.isAnonymous) {
      const client = await getDynamoClient();
      if (client) {
        try {
          const result = await client.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { userId, sk: 'CART#current' },
          }));
          if (result.Item?.items) {
            return result.Item.items as CartItem[];
          }
        } catch (error) {
          console.error('Failed to fetch cart from DynamoDB:', error);
        }
      }
    }
    return getLocalCart();
  },

  // ─── Wishlist ────────────────────────────────────────────────────────────

  async saveWishlistItem(userId: string, item: WishlistItem): Promise<void> {
    if (isAwsConfigured && userId !== 'anonymous') {
      const client = await getDynamoClient();
      if (client) {
        try {
          await client.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              userId,
              sk: `WISHLIST#${item.id}`,
              ...item,
            },
          }));
          return;
        } catch (error) {
          console.error('Failed to save wishlist item to DynamoDB:', error);
        }
      }
    }
    // Fallback: save full wishlist to localStorage
    const current = getLocalWishlist();
    const updated = [...current.filter(w => w.id !== item.id), item];
    saveLocalWishlist(updated);
  },

  async removeWishlistItem(userId: string, itemId: string): Promise<void> {
    if (isAwsConfigured && userId !== 'anonymous') {
      const client = await getDynamoClient();
      if (client) {
        try {
          await client.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { userId, sk: `WISHLIST#${itemId}` },
          }));
          return;
        } catch (error) {
          console.error('Failed to remove wishlist item from DynamoDB:', error);
        }
      }
    }
    const current = getLocalWishlist();
    const updated = current.filter(w => w.id !== itemId);
    saveLocalWishlist(updated);
  },

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (isAwsConfigured && userId !== 'anonymous') {
      const client = await getDynamoClient();
      if (client) {
        try {
          const result = await client.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'userId = :uid AND begins_with(sk, :prefix)',
            ExpressionAttributeValues: {
              ':uid': userId,
              ':prefix': 'WISHLIST#',
            },
          }));
          return (result.Items || []).map((item: any) => {
            const { userId: _uid, sk: _sk, ...wishlistData } = item;
            return wishlistData as WishlistItem;
          });
        } catch (error) {
          console.error('Failed to fetch wishlist from DynamoDB:', error);
        }
      }
    }
    return getLocalWishlist();
  },

  // ─── Newsletter ────────────────────────────────────────────────────────────

  async saveNewsletterEmail(email: string): Promise<void> {
    const normalised = email.trim().toLowerCase();
    if (!normalised || !normalised.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
    if (apiBase) {
      // Call the Lambda via API Gateway — no AWS credentials needed in browser
      const res = await fetch(`${apiBase}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalised }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save email');
      }
      return;
    }

    // Fallback if no API configured (local dev without API Gateway)
    saveLocalNewsletterEmail(normalised);
  },

  async getNewsletterEmails(): Promise<string[]> {
    if (isAwsConfigured) {
      const client = await getDynamoClient();
      if (client) {
        try {
          const result = await client.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'userId = :uid AND begins_with(sk, :prefix)',
            ExpressionAttributeValues: {
              ':uid': 'newsletter',
              ':prefix': 'EMAIL#',
            },
          }));
          return (result.Items || []).map((item: any) => item.email as string);
        } catch (error) {
          console.error('Failed to fetch newsletter emails:', error);
        }
      }
    }
    return getLocalNewsletterEmails();
  },
};
