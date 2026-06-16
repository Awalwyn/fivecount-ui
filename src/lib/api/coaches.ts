import { apiCall } from './client';

export interface CoachProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  program: string;
  position: string;
  email: string;
  verificationStatus: string;
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

export async function getCoachProfile(): Promise<CoachProfile> {
  return apiCall<CoachProfile>('/api/coach/profile');
}

export async function createCoachProfile(data: Omit<CoachProfile, 'id' | 'userId' | 'verificationStatus' | 'createdAt' | 'updatedAt'>): Promise<CoachProfile> {
  return apiCall<CoachProfile>('/api/coach/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCoachProfile(data: Partial<Omit<CoachProfile, 'id' | 'userId' | 'verificationStatus' | 'createdAt' | 'updatedAt'>>): Promise<CoachProfile> {
  return apiCall<CoachProfile>('/api/coach/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function checkProfileCompleteness(): Promise<ProfileCompletenessResponse> {
  return apiCall<ProfileCompletenessResponse>('/api/coach/profile/complete');
}
