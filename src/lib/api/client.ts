import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Check if running in demo mode (no Supabase configured)
export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

async function getAuthToken(): Promise<string> {
  if (isDemoMode()) {
    return 'demo-token';
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    throw new Error('Not authenticated');
  }

  return session.access_token;
}

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (isDemoMode()) {
    console.log('[Demo Mode] API call to:', endpoint);
    return null as T;
  }

  try {
    const supabase = createClient();
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (response.status === 401) {
      await supabase.auth.signOut();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    return response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('API call failed');
  }
}
