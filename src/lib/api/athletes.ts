import { apiCall } from './client';

export interface AthleteProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gradYear: number;
  clubName: string;
  city: string;
  state: string;
  bio: string;
  profilePictureUrl?: string;
  instagramHandle?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createAthleteProfile(data: {
  firstName: string;
  lastName: string;
  gradYear: number;
  clubName: string;
  city: string;
  state: string;
  bio: string;
}): Promise<AthleteProfile> {
  return apiCall<AthleteProfile>('/athletes/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAthleteProfile(id: string): Promise<AthleteProfile> {
  return apiCall<AthleteProfile>(`/athletes/${id}`);
}

export async function updateAthleteProfile(
  id: string,
  data: Partial<AthleteProfile>
): Promise<AthleteProfile> {
  return apiCall<AthleteProfile>(`/athletes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getAthleteByUserId(userId: string): Promise<AthleteProfile> {
  return apiCall<AthleteProfile>(`/athletes/user/${userId}`);
}
