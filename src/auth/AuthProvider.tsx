import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUserRecord {
  id: string;
  user_id: string;
  role: AdminRole;
  is_active: boolean;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: AdminRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Authoritative Database Role Verification from public.admin_users
  const checkAdminRole = async (currentUser: User | null): Promise<{ isAdmin: boolean; role: AdminRole | null }> => {
    if (!currentUser) {
      return { isAdmin: false, role: null };
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, user_id, role, is_active')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error verifying admin status:', error);
        return { isAdmin: false, role: null };
      }

      const adminData = data as AdminUserRecord | null;
      if (adminData && adminData.is_active) {
        return { isAdmin: true, role: adminData.role };
      }

      return { isAdmin: false, role: null };
    } catch (err) {
      console.error('Unexpected error during admin check:', err);
      return { isAdmin: false, role: null };
    }
  };

  const refreshAdminStatus = async () => {
    if (user) {
      const result = await checkAdminRole(user);
      setIsAdmin(result.isAdmin);
      setAdminRole(result.role);
    } else {
      setIsAdmin(false);
      setAdminRole(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Initial getSession call
    supabase.auth.getSession().then(async ({ data: { session: initSession } }) => {
      if (!isMounted) return;

      const initUser = initSession?.user ?? null;
      setSession(initSession);
      setUser(initUser);

      if (initUser) {
        const { isAdmin: adminStatus, role } = await checkAdminRole(initUser);
        if (isMounted) {
          setIsAdmin(adminStatus);
          setAdminRole(role);
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setIsAdmin(false);
          setAdminRole(null);
          setLoading(false);
        }
      }
    });

    // 2. Realtime auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!isMounted) return;

        const currentUser = currentSession?.user ?? null;
        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          // If auth state changes (e.g. sign in, token refresh), verify role against public.admin_users
          const { isAdmin: adminStatus, role } = await checkAdminRole(currentUser);
          if (isMounted) {
            setIsAdmin(adminStatus);
            setAdminRole(role);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setIsAdmin(false);
            setAdminRole(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      if (data.user) {
        const { isAdmin: adminStatus, role } = await checkAdminRole(data.user);
        setIsAdmin(adminStatus);
        setAdminRole(role);
      }

      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setAdminRole(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo<AuthContextType>(() => ({
    session,
    user,
    loading,
    isAdmin,
    adminRole,
    signIn,
    signOut,
    refreshAdminStatus,
  }), [session, user, loading, isAdmin, adminRole]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
