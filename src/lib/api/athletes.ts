import { apiCall } from './client';
import { EventType } from './competitions';

export type CommitStatus = 'OPEN' | 'VERBALLY_COMMITTED' | 'SIGNED' | 'NOT_RECRUITING';

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
  commitStatus?: CommitStatus;
  eventStats?: Record<string, any>; // Stats from API
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
  profilePictureUrl?: string;
  instagramHandle?: string;
  commitStatus?: CommitStatus;
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

/**
 * Get athlete profile by ID without authentication (public endpoint)
 * Used for public-facing profile pages
 */
export async function getPublicAthleteProfile(id: string): Promise<AthleteProfile> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('API base URL not configured');
  }

  const response = await fetch(`${apiBaseUrl}/athletes/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch athlete profile: ${response.status}`);
  }
  return response.json();
}

/**
 * Search athletes by filters (public endpoint)
 */
export interface AthleteSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  gradYear: number;
  clubName: string;
  city: string;
  state: string;
  topEvents: Array<{
    event: EventType;
    averageScore: number;
  }>;
}

export async function searchAthletes(
  gradYear?: number,
  state?: string,
  event?: EventType,
  page = 0,
  pageSize = 20
): Promise<{
  content: AthleteSearchResult[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  const params = new URLSearchParams();
  if (gradYear) params.append('gradYear', gradYear.toString());
  if (state) params.append('state', state);
  if (event) params.append('event', event);
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('API base URL not configured');
  }

  const response = await fetch(`${apiBaseUrl}/athletes/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }
  return response.json();
}
