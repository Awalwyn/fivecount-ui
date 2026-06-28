'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { buildApiUrl } from '@/lib/api/url';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'ATHLETE' | 'COACH';

interface AccountResponse {
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  role: UserRole;
  signUp: (email: string, password: string, role: 'ATHLETE' | 'COACH', metadata?: { firstName: string; lastName: string; username: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('ATHLETE');

  useEffect(() => {
    const supabase = createClient();

    async function registerBackendAccount(nextSession: Session, accountRole: UserRole) {
      const params = new URLSearchParams({
        userId: nextSession.user.id,
        email: nextSession.user.email || '',
        role: accountRole,
      });

      const username = nextSession.user.user_metadata?.username;
      if (typeof username === 'string' && username) {
        params.set('username', username);
      }

      const response = await fetch(buildApiUrl(`/auth/register-supabase?${params.toString()}`), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${nextSession.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete account registration');
      }
    }

    async function syncSession(nextSession: Session | null) {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRole('ATHLETE');
        return;
      }

      const metadataRole = nextSession.user.user_metadata?.role as UserRole | undefined;
      if (metadataRole === 'ATHLETE' || metadataRole === 'COACH') {
        setRole(metadataRole);
      }

      try {
        const response = await fetch(buildApiUrl('/users/me/account'), {
          headers: {
            Authorization: `Bearer ${nextSession.access_token}`,
          },
        });

        if (!response.ok) {
          if (metadataRole === 'ATHLETE' || metadataRole === 'COACH') {
            await registerBackendAccount(nextSession, metadataRole);
            setRole(metadataRole);
          }
          return;
        }

        const account = (await response.json()) as AccountResponse;
        if (
          metadataRole === 'COACH' &&
          account.role === 'ATHLETE'
        ) {
          await registerBackendAccount(nextSession, metadataRole);
          setRole(metadataRole);
          return;
        }

        if (account.role === 'ATHLETE' || account.role === 'COACH') {
          setRole(account.role);
        }
      } catch {
        // Keep the Supabase metadata role if the API is temporarily unavailable.
      }
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSession(session).finally(() => setIsLoading(false));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(email: string, password: string, role: 'ATHLETE' | 'COACH', metadata?: { firstName: string; lastName: string; username: string }) {
    const supabase = createClient();
    // Step 1: Create Supabase auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          role,
        },
      },
    });
    if (error) throw error;

    // Step 2: Call backend to create User record and auto-create profile
    if (data.user) {
      const username = metadata?.username || '';
      const params = new URLSearchParams({
        userId: data.user.id,
        email,
        role,
      });
      if (username) {
        params.set('username', username);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (data.session?.access_token) {
        headers.Authorization = `Bearer ${data.session.access_token}`;
      }

      if (!data.session?.access_token) {
        return;
      }

      const response = await fetch(buildApiUrl(`/auth/register-supabase?${params.toString()}`), {
        method: 'POST',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to create user profile');
      }
    }
  }

  async function signIn(email: string, password: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, role, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
