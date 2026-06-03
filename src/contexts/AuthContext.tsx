'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Mock user for demo mode
const MOCK_USER: User = {
  id: 'demo-user-123',
  email: 'demo@fivecount.app',
  app_metadata: {},
  user_metadata: {
    firstName: 'Alex',
    lastName: 'Johnson',
    username: 'alexj_gymnastics',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const MOCK_SESSION: Session = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: MOCK_USER,
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, role: 'ATHLETE' | 'COACH', metadata?: { firstName: string; lastName: string; username: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = !isSupabaseConfigured();

  useEffect(() => {
    // Demo mode - use mock data
    if (isDemoMode) {
      setSession(MOCK_SESSION);
      setUser(MOCK_USER);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode]);

  async function signUp(email: string, password: string, role: 'ATHLETE' | 'COACH', metadata?: { firstName: string; lastName: string; username: string }) {
    if (isDemoMode) {
      console.log('[Demo Mode] Sign up called with:', { email, role, metadata });
      return;
    }

    const supabase = createClient();
    if (!supabase) throw new Error('Supabase not configured');

    // Step 1: Create Supabase auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;

    // Step 2: Call backend to create User record and auto-create profile
    if (data.user) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) throw new Error('API base URL not configured');

      const response = await fetch(`${apiBaseUrl}/auth/register-supabase?userId=${data.user.id}&email=${email}&role=${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create user profile');
      }
    }
  }

  async function signIn(email: string, password: string) {
    if (isDemoMode) {
      console.log('[Demo Mode] Sign in called with:', email);
      setUser(MOCK_USER);
      setSession(MOCK_SESSION);
      return;
    }

    const supabase = createClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signOut() {
    if (isDemoMode) {
      console.log('[Demo Mode] Sign out called');
      return;
    }

    const supabase = createClient();
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isDemoMode, signUp, signIn, signOut }}>
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
