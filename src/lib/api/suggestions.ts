import { apiCall } from './client';

export interface SuggestedAthlete {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  gradYear?: number;
  clubName?: string;
  state?: string;
  skillLevel?: number;
  topEvent?: string;
}

/**
 * Get suggested athletes to follow based on skill level and events
 */
export async function getSuggestedAthletes(userId: string): Promise<SuggestedAthlete[]> {
  const response = await apiCall<SuggestedAthlete[]>(
    `/athletes/${userId}/suggestions`,
    { method: 'GET' }
  );
  return response;
}
