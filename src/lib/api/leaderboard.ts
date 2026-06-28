import { buildApiUrl } from './url';

export interface LeaderboardEntry {
  rank: number;
  athleteId: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  score: number;
}

/**
 * Get top athletes by all-around score for the past week
 */
export async function getWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch(buildApiUrl('/leaderboard/weekly/all-around'));
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.status}`);
  }
  return response.json();
}
