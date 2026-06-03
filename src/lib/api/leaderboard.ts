const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  if (!API_BASE_URL) {
    throw new Error('API base URL not configured');
  }

  const response = await fetch(`${API_BASE_URL}/api/leaderboard/weekly/all-around`);
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.status}`);
  }
  return response.json();
}
