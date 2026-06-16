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

// Types
export interface EventScore {
  name: EventType;
  score: number;
}

export interface Prospect {
  athleteId: string;
  athleteName: string;
  gradYear: number;
  state: string;
  topEvent: EventScore;
  allAroundAvg: number;
  stage: PipelineStage;
  lastActivityAt: string;
}

export interface RosterAthlete {
  athleteId: string;
  athleteName: string;
  gradYear: number;
  recruitingStatus: RecruitingStatus;
  topEvent: EventScore;
  allAroundAvg: number;
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
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  return apiCall<PaginatedResponse<Prospect>>(`/api/coach/prospects?${params}`);
}

export async function updateProspectStage(
  athleteId: string,
  newStage: PipelineStage
): Promise<Prospect> {
  return apiCall<Prospect>(`/api/coach/prospects/${athleteId}/stage`, {
    method: 'PUT',
    body: JSON.stringify({ stage: newStage }),
  });
}

export async function addProspect(athleteId: string): Promise<Prospect> {
  return apiCall<Prospect>('/api/coach/prospects', {
    method: 'POST',
    body: JSON.stringify({ athleteId }),
  });
}

export async function removeProspect(athleteId: string): Promise<void> {
  return apiCall<void>(`/api/coach/prospects/${athleteId}`, {
    method: 'DELETE',
  });
}

export async function getRoster(
  limit: number = 25,
  offset: number = 0
): Promise<PaginatedResponse<RosterAthlete>> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  return apiCall<PaginatedResponse<RosterAthlete>>(`/api/coach/roster/committed?${params}`);
}

export async function getCoachStats(): Promise<CoachStats> {
  return apiCall<CoachStats>('/api/coach/dashboard/stats');
}

export async function getCoachActivity(
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedResponse<CoachActivity>> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  return apiCall<PaginatedResponse<CoachActivity>>(`/api/coach/dashboard/activity?${params}`);
}

// Client-side computation for team stats from roster
export function getTeamStats(roster: RosterAthlete[]): TeamStat[] {
  const totalCommitted = roster.length;
  const verballyCommitted = roster.filter((r) => r.recruitingStatus === 'VERBALLY_COMMITTED').length;
  const signed = roster.filter((r) => r.recruitingStatus === 'SIGNED').length;
  const notRecruiting = roster.filter((r) => r.recruitingStatus === 'NOT_RECRUITING').length;

  return [
    { label: 'Total Committed', value: totalCommitted },
    { label: 'Verbally Committed', value: verballyCommitted },
    { label: 'Signed', value: signed },
    { label: 'Not Recruiting', value: notRecruiting },
  ];
}
