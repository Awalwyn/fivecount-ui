import { apiCall } from './client';

// Pipeline Stages
export const PIPELINE_STAGES = {
  WATCHING: 'WATCHING',
  CONTACTED: 'CONTACTED',
  IN_TALKS: 'IN_TALKS',
  OFFERED: 'OFFERED',
  COMMITTED: 'COMMITTED',
} as const;

export type PipelineStage = typeof PIPELINE_STAGES[keyof typeof PIPELINE_STAGES];

// Activity Types
export const ACTIVITY_TYPES = {
  NEW_SCORE: 'NEW_SCORE',
  NEW_POST: 'NEW_POST',
  REPLY: 'REPLY',
  PROFILE_VIEW: 'PROFILE_VIEW',
  COMMIT: 'COMMIT',
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

// Recruiting Status (athlete's own status)
export const RECRUITING_STATUSES = {
  OPEN_TO_RECRUITING: 'OPEN_TO_RECRUITING',
  VERBALLY_COMMITTED: 'VERBALLY_COMMITTED',
  SIGNED: 'SIGNED',
  NOT_RECRUITING: 'NOT_RECRUITING',
} as const;

export type RecruitingStatus = typeof RECRUITING_STATUSES[keyof typeof RECRUITING_STATUSES];

// Event Types
export const EVENT_TYPES = {
  FLOOR: 'FLOOR',
  POMMEL_HORSE: 'POMMEL_HORSE',
  RINGS: 'RINGS',
  VAULT: 'VAULT',
  PARALLEL_BARS: 'PARALLEL_BARS',
  HIGH_BAR: 'HIGH_BAR',
  ALL_AROUND: 'ALL_AROUND',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// Spring Page response shape from backend
interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// Types
export interface Prospect {
  id: string;
  athleteId: string;
  name: string;
  gradYear: number;
  state: string;
  topEvent: string;
  topEventScore: number;
  allAroundAvg: number;
  gpa?: number;
  stage: PipelineStage;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface RosterAthlete {
  id: string;
  firstName: string;
  lastName: string;
  gradYear: number;
  state: string;
  recruitingStatus: RecruitingStatus;
  topEvents: Array<{ event: string; averageScore: number }>;
}

export interface CoachStats {
  watching: number;
  contacted: number;
  inTalks: number;
  offered: number;
  committed: number;
  total: number;
}

export interface CoachActivity {
  type: ActivityType;
  athleteName: string;
  athleteId: string;
  detail: string;
  createdAt: string;
}

export interface TeamStat {
  label: string;
  value: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

// API Functions
export async function getProspects(
  limit: number = 50,
  offset: number = 0
): Promise<PaginatedResponse<Prospect>> {
  const page = Math.floor(offset / limit);
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', limit.toString());

  const response = await apiCall<SpringPage<Prospect>>(
    `/api/coach/prospects?${params}`
  );
  return {
    data: response.content,
    total: response.totalElements,
    hasMore: response.number < response.totalPages - 1,
  };
}

export async function updateProspectStage(
  prospectId: string,
  newStage: PipelineStage
): Promise<Prospect> {
  return apiCall<Prospect>(
    `/api/coach/prospects/${prospectId}/stage?stage=${newStage}`,
    {
      method: 'PUT',
    }
  );
}

export async function addProspect(athleteId: string): Promise<Prospect> {
  return apiCall<Prospect>('/api/coach/prospects', {
    method: 'POST',
    body: JSON.stringify({ athleteId }),
  });
}

export async function removeProspect(prospectId: string): Promise<void> {
  return apiCall<void>(`/api/coach/prospects/${prospectId}`, {
    method: 'DELETE',
  });
}

export async function getRoster(
  limit: number = 25,
  offset: number = 0
): Promise<PaginatedResponse<RosterAthlete>> {
  const page = Math.floor(offset / limit);
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', limit.toString());

  const response = await apiCall<SpringPage<RosterAthlete>>(
    `/api/coach/roster/committed?${params}`
  );
  return {
    data: response.content,
    total: response.totalElements,
    hasMore: response.number < response.totalPages - 1,
  };
}

export async function getCoachStats(): Promise<CoachStats> {
  return apiCall<CoachStats>('/api/coach/dashboard/stats');
}

export async function getCoachActivity(
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedResponse<CoachActivity>> {
  const page = Math.floor(offset / limit);
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', limit.toString());

  const response = await apiCall<SpringPage<CoachActivity>>(
    `/api/coach/dashboard/activity?${params}`
  );
  return {
    data: response.content,
    total: response.totalElements,
    hasMore: response.number < response.totalPages - 1,
  };
}

// Client-side computation for team stats from roster
export function getTeamStats(roster: RosterAthlete[]): TeamStat[] {
  const totalCommitted = roster.length;
  const verballyCommitted = roster.filter(
    (r) => r.recruitingStatus === 'VERBALLY_COMMITTED'
  ).length;
  const signed = roster.filter((r) => r.recruitingStatus === 'SIGNED').length;
  const notRecruiting = roster.filter(
    (r) => r.recruitingStatus === 'NOT_RECRUITING'
  ).length;

  return [
    { label: 'Total Committed', value: totalCommitted },
    { label: 'Verbally Committed', value: verballyCommitted },
    { label: 'Signed', value: signed },
    { label: 'Not Recruiting', value: notRecruiting },
  ];
}
