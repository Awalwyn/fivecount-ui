import { buildApiUrl } from './url';

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
  const response = await fetch(buildApiUrl('/meets/trending'));
  if (!response.ok) {
    throw new Error(`Failed to fetch trending meets: ${response.status}`);
  }
  return response.json();
}
