import { apiCall } from './client';

export interface CoachProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  program: string;
  position: string;
  email: string;
  bio?: string;
  city?: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCompletenessResponse {
  complete: boolean;
  missingFields: string[];
}

export async function getCoachProfile(userId: string): Promise<CoachProfile> {
  return apiCall<CoachProfile>(`/api/coaches/profile/user/${userId}`);
}

export async function createCoachProfile(data: Omit<CoachProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CoachProfile> {
  return apiCall<CoachProfile>('/api/coaches/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCoachProfile(id: string, data: Partial<Omit<CoachProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<CoachProfile> {
  return apiCall<CoachProfile>(`/api/coaches/profile/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function checkProfileCompleteness(): Promise<ProfileCompletenessResponse> {
  return apiCall<ProfileCompletenessResponse>('/api/coaches/profile/complete', {
    method: 'GET',
  });
}
