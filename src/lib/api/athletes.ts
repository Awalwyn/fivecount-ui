import { apiCall, isDemoMode } from './client';
import { EventType } from './competitions';
import type { Post } from './posts';

export type CommitStatus = 'OPEN_TO_RECRUITING' | 'VERBALLY_COMMITTED' | 'SIGNED' | 'NOT_RECRUITING';

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
  posts?: Post[]; // Posts included in profile response
  createdAt: string;
  updatedAt: string;
}

// Mock athlete profile for demo mode
const MOCK_ATHLETE_PROFILE: AthleteProfile = {
  id: 'athlete-demo-123',
  userId: 'demo-user-123',
  firstName: 'Alex',
  lastName: 'Johnson',
  gradYear: 2025,
  clubName: 'Elite Gymnastics Academy',
  city: 'Denver',
  state: 'CO',
  bio: 'Level 10 gymnast with a passion for vault and floor. Working towards NCAA D1 goals.',
  profilePictureUrl: undefined,
  instagramHandle: 'alexj_gymnastics',
  commitStatus: 'OPEN_TO_RECRUITING',
  eventStats: {
    VAULT: { avg: 14.250, high: 14.650, count: 12 },
    FLOOR: { avg: 14.100, high: 14.300, count: 12 },
    POMMEL_HORSE: { avg: 13.750, high: 13.950, count: 12 },
    RINGS: { avg: 14.000, high: 14.200, count: 12 },
    PARALLEL_BARS: { avg: 13.950, high: 14.150, count: 12 },
    HIGH_BAR: { avg: 13.800, high: 14.050, count: 12 },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock search results for demo mode
const MOCK_SEARCH_RESULTS: AthleteSearchResult[] = [
  {
    id: 'athlete-1',
    firstName: 'Sarah',
    lastName: 'Chen',
    gradYear: 2025,
    clubName: 'Golden State Gymnastics',
    city: 'San Francisco',
    state: 'CA',
    topEvents: [
      { event: 'VAULT', averageScore: 14.550 },
      { event: 'FLOOR', averageScore: 14.300 },
    ],
  },
  {
    id: 'athlete-2',
    firstName: 'Marcus',
    lastName: 'Williams',
    gradYear: 2026,
    clubName: 'Texas Elite',
    city: 'Houston',
    state: 'TX',
    topEvents: [
      { event: 'RINGS', averageScore: 14.700 },
      { event: 'PARALLEL_BARS', averageScore: 14.450 },
    ],
  },
  {
    id: 'athlete-3',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    gradYear: 2025,
    clubName: 'Florida Stars',
    city: 'Orlando',
    state: 'FL',
    topEvents: [
      { event: 'ALL_AROUND', averageScore: 84.500 },
      { event: 'VAULT', averageScore: 14.350 },
    ],
  },
  {
    id: 'athlete-4',
    firstName: 'Jordan',
    lastName: 'Kim',
    gradYear: 2027,
    clubName: 'Rocky Mountain Gymnastics',
    city: 'Denver',
    state: 'CO',
    topEvents: [
      { event: 'HIGH_BAR', averageScore: 14.100 },
      { event: 'POMMEL_HORSE', averageScore: 13.900 },
    ],
  },
  {
    id: 'athlete-5',
    firstName: 'Tyler',
    lastName: 'Martinez',
    gradYear: 2025,
    clubName: 'Arizona Heat',
    city: 'Phoenix',
    state: 'AZ',
    topEvents: [
      { event: 'FLOOR', averageScore: 14.450 },
      { event: 'VAULT', averageScore: 14.200 },
    ],
  },
];

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
  if (isDemoMode()) {
    return { ...MOCK_ATHLETE_PROFILE, ...data };
  }
  return apiCall<AthleteProfile>('/athletes/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAthleteProfile(id: string): Promise<AthleteProfile> {
  if (isDemoMode()) {
    return MOCK_ATHLETE_PROFILE;
  }
  return apiCall<AthleteProfile>(`/athletes/${id}`);
}

export async function updateAthleteProfile(
  id: string,
  data: Partial<AthleteProfile>
): Promise<AthleteProfile> {
  if (isDemoMode()) {
    return { ...MOCK_ATHLETE_PROFILE, ...data };
  }
  return apiCall<AthleteProfile>(`/athletes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getAthleteByUserId(userId: string): Promise<AthleteProfile> {
  if (isDemoMode()) {
    return MOCK_ATHLETE_PROFILE;
  }
  return apiCall<AthleteProfile>(`/athletes/user/${userId}`);
}

/**
 * Get athlete profile by ID without authentication (public endpoint)
 * Used for public-facing profile pages
 */
export async function getPublicAthleteProfile(id: string): Promise<AthleteProfile> {
  if (isDemoMode()) {
    return MOCK_ATHLETE_PROFILE;
  }

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
  if (isDemoMode()) {
    let filtered = [...MOCK_SEARCH_RESULTS];
    if (gradYear) filtered = filtered.filter(a => a.gradYear === gradYear);
    if (state) filtered = filtered.filter(a => a.state === state);
    if (event) filtered = filtered.filter(a => a.topEvents.some(e => e.event === event));
    return {
      content: filtered.slice(page * pageSize, (page + 1) * pageSize),
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      currentPage: page,
      pageSize,
    };
  }

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
