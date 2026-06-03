const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface TrendingMeet {
  id?: string;
  name: string;
  date: string;
  location?: string;
  athleteCount?: number;
}

/**
 * Get trending meets - recent meets sorted by activity
 */
export async function getTrendingMeets(): Promise<TrendingMeet[]> {
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  const response = await fetch(`${API_BASE_URL}/api/meets/trending`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trending meets: ${response.status}`);
  }
  return response.json();
}
