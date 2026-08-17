import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth';
import { isAwsConfigured } from '../aws-config';

export type AdminUser = {
  uid: string;
  email: string;
  isAdmin: boolean;
};

interface AdminAuthContextValue {
  adminUser: AdminUser | null;
  loading: boolean;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
  sendResetCode: (email: string) => Promise<void>;
  confirmReset: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// ── Demo fallback admin (only when AWS is NOT configured) ─────────────────────
const DEMO_ADMIN = { uid: 'admin-demo', email: 'admin@sendsmiles.com', isAdmin: true };
const DEMO_CREDENTIALS = { email: 'admin@sendsmiles.com', password: 'Admin@1234' };

async function checkCognitoAdminGroup(): Promise<boolean> {
  try {
    const session = await fetchAuthSession();
    const payload = session.tokens?.idToken?.payload as any;
    const groups: string[] = payload?.['cognito:groups'] || [];
    return groups.includes('Admin');
  } catch {
    return false;
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    (async () => {
      if (!isAwsConfigured) {
        // Demo mode: check localStorage for persisted demo session
        const stored = localStorage.getItem('admin_demo_session');
        if (stored === 'true') setAdminUser(DEMO_ADMIN);
        setLoading(false);
        return;
      }
      try {
        const user = await getCurrentUser();
        const isAdmin = await checkCognitoAdminGroup();
        if (isAdmin) {
          setAdminUser({ uid: user.userId, email: user.signInDetails?.loginId || '', isAdmin: true });
        } else {
          setAdminUser({ uid: user.userId, email: user.signInDetails?.loginId || '', isAdmin: false });
        }
      } catch {
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signInAdmin = async (email: string, password: string) => {
    if (!isAwsConfigured) {
      // Demo fallback
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        localStorage.setItem('admin_demo_session', 'true');
        setAdminUser(DEMO_ADMIN);
        return;
      }
      throw new Error('Invalid credentials. Use admin@sendsmiles.com / Admin@1234 in demo mode.');
    }

    const result = await signIn({ username: email, password });
    if (!result.isSignedIn) {
      throw new Error('Sign-in requires additional steps. Please try again.');
    }
    const user = await getCurrentUser();
    const isAdmin = await checkCognitoAdminGroup();
    setAdminUser({ uid: user.userId, email: user.signInDetails?.loginId || email, isAdmin });
  };

  const signOutAdmin = async () => {
    if (!isAwsConfigured) {
      localStorage.removeItem('admin_demo_session');
      setAdminUser(null);
      return;
    }
    await signOut();
    setAdminUser(null);
  };

  const sendResetCode = async (email: string) => {
    if (!isAwsConfigured) {
      // Demo: just succeed silently
      return;
    }
    await resetPassword({ username: email });
  };

  const confirmReset = async (email: string, code: string, newPassword: string) => {
    if (!isAwsConfigured) return;
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, signInAdmin, signOutAdmin, sendResetCode, confirmReset }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
