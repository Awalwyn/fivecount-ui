import { apiCall } from './client';

export type PipelineStage = 'WATCHING' | 'CONTACTED' | 'IN_TALKS' | 'OFFERED' | 'COMMITTED';

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: 'WATCHING', label: 'Watching' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'IN_TALKS', label: 'In Talks' },
  { id: 'OFFERED', label: 'Offered' },
  { id: 'COMMITTED', label: 'Committed' },
];

export interface Prospect {
  id: string;
  athleteId: string;
  name: string;
  gradYear: number;
  clubName: string;
  state: string;
  allAroundAvg: number;
  topEvent: string;
  stage: PipelineStage;
  lastActivity: string;
}

export interface RosterAthlete {
  id: string;
  name: string;
  gradYear: number;
  classYear: string;
  allAroundAvg: number;
  topEvent: string;
  topEventScore: number;
  status: 'COMMITTED' | 'SIGNED' | 'ENROLLED';
}

export interface TeamStat {
  label: string;
  value: string;
  sub?: string;
}

export interface CoachActivity {
  id: string;
  type: 'NEW_SCORE' | 'NEW_POST' | 'REPLY' | 'PROFILE_VIEW' | 'COMMIT';
  athleteName: string;
  detail: string;
  time: string;
}

// Coach: Get all prospects
export async function getProspects(): Promise<Prospect[]> {
  return apiCall<Prospect[]>('/api/coach/prospects', { method: 'GET' });
}

// Coach: Get prospects by stage
export async function getProspectsByStage(stage: PipelineStage): Promise<Prospect[]> {
  return apiCall<Prospect[]>(`/api/coach/prospects/stage/${stage}`, { method: 'GET' });
}

// Coach: Update prospect stage
export async function updateProspectStage(prospectId: string, stage: PipelineStage): Promise<Prospect> {
  return apiCall<Prospect>(`/api/coach/prospects/${prospectId}/stage`, {
    method: 'PUT',
    body: JSON.stringify({ stage }),
  });
}

// Coach: Add prospect
export async function addProspect(athleteId: string): Promise<Prospect> {
  return apiCall<Prospect>('/api/coach/prospects', {
    method: 'POST',
    body: JSON.stringify({ athleteId }),
  });
}

// Coach: Remove prospect
export async function removeProspect(prospectId: string): Promise<void> {
  await apiCall<void>(`/api/coach/prospects/${prospectId}`, { method: 'DELETE' });
}

// Coach: Get roster (committed athletes)
export async function getRoster(): Promise<RosterAthlete[]> {
  return apiCall<RosterAthlete[]>('/api/coach/roster/committed', { method: 'GET' });
}

// Coach: Get roster count
export async function getRosterCount(): Promise<{ count: number }> {
  return apiCall<{ count: number }>('/api/coach/roster/count', { method: 'GET' });
}

// Coach: Get activity feed
export async function getCoachActivity(): Promise<CoachActivity[]> {
  return apiCall<CoachActivity[]>('/api/coach/dashboard/activity', { method: 'GET' });
}

// Coach: Get dashboard stats
export async function getCoachStats(): Promise<{
  watching: number;
  contacted: number;
  inTalks: number;
  offered: number;
  committed: number;
}> {
  return apiCall<any>('/api/coach/dashboard/stats', { method: 'GET' });
}

// Calculate team stats from roster (local computation)
export function getTeamStats(roster: RosterAthlete[]): TeamStat[] {
  if (roster.length === 0) {
    return [
      { label: 'Roster Size', value: '0', sub: 'active + incoming' },
      { label: 'Team AA Avg', value: '0', sub: 'all-around' },
      { label: 'Top AA', value: '0', sub: 'team high' },
      { label: 'Incoming', value: '0', sub: 'committed/signed' },
    ];
  }

  const avgAA = (roster.reduce((sum, r) => sum + r.allAroundAvg, 0) / roster.length).toFixed(2);
  const topAA = Math.max(...roster.map(r => r.allAroundAvg)).toFixed(2);
  const incoming = roster.filter(r => r.status === 'COMMITTED' || r.status === 'SIGNED').length;

  return [
    { label: 'Roster Size', value: String(roster.length), sub: 'active + incoming' },
    { label: 'Team AA Avg', value: avgAA, sub: 'all-around' },
    { label: 'Top AA', value: topAA, sub: 'team high' },
    { label: 'Incoming', value: String(incoming), sub: 'committed/signed' },
  ];
}
