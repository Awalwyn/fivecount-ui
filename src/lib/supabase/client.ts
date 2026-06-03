import { createBrowserClient } from '@supabase/ssr';

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return null in demo mode - callers should check isSupabaseConfigured() first
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
