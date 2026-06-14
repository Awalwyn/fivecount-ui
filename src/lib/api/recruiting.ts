import { isDemoMode, apiCall } from './client';

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

const MOCK_PROSPECTS: Prospect[] = [
  { id: 'p1', athleteId: 'athlete-6', name: 'Chris Johnson', gradYear: 2025, clubName: 'Midwest Elite', state: 'IL', allAroundAvg: 86.1, topEvent: 'PH', stage: 'OFFERED', lastActivity: '2h ago' },
  { id: 'p2', athleteId: 'athlete-1', name: 'Marcus Chen', gradYear: 2025, clubName: 'Golden State Gymnastics', state: 'CA', allAroundAvg: 85.45, topEvent: 'VT', stage: 'IN_TALKS', lastActivity: '1d ago' },
  { id: 'p3', athleteId: 'athlete-5', name: 'Tyler Martinez', gradYear: 2025, clubName: 'Arizona Heat', state: 'AZ', allAroundAvg: 84.2, topEvent: 'FX', stage: 'CONTACTED', lastActivity: '3d ago' },
  { id: 'p4', athleteId: 'athlete-7', name: 'Brandon Lee', gradYear: 2026, clubName: 'Pacific Coast Academy', state: 'CA', allAroundAvg: 83.75, topEvent: 'HB', stage: 'WATCHING', lastActivity: '5d ago' },
  { id: 'p5', athleteId: 'athlete-2', name: 'Jake Williams', gradYear: 2026, clubName: 'Texas Elite', state: 'TX', allAroundAvg: 84.9, topEvent: 'SR', stage: 'COMMITTED', lastActivity: '1w ago' },
  { id: 'p6', athleteId: 'athlete-3', name: 'Ryan Rodriguez', gradYear: 2025, clubName: 'Florida Stars', state: 'FL', allAroundAvg: 84.5, topEvent: 'AA', stage: 'WATCHING', lastActivity: '6d ago' },
  { id: 'p7', athleteId: 'athlete-8', name: 'Derek Thompson', gradYear: 2027, clubName: 'East Coast Gymnastics', state: 'MA', allAroundAvg: 81.9, topEvent: 'VT', stage: 'CONTACTED', lastActivity: '4d ago' },
  { id: 'p8', athleteId: 'athlete-4', name: 'Jordan Kim', gradYear: 2027, clubName: 'Rocky Mountain Gymnastics', state: 'CO', allAroundAvg: 82.1, topEvent: 'HB', stage: 'IN_TALKS', lastActivity: '2d ago' },
];

const MOCK_ROSTER: RosterAthlete[] = [
  { id: 'r1', name: 'Eli Foster', gradYear: 2024, classYear: 'Freshman', allAroundAvg: 84.8, topEvent: 'PH', topEventScore: 14.6, status: 'ENROLLED' },
  { id: 'r2', name: 'Nathan Brooks', gradYear: 2024, classYear: 'Freshman', allAroundAvg: 83.9, topEvent: 'SR', topEventScore: 14.4, status: 'ENROLLED' },
  { id: 'r3', name: 'Jake Williams', gradYear: 2026, classYear: 'Incoming', allAroundAvg: 84.9, topEvent: 'SR', topEventScore: 14.7, status: 'COMMITTED' },
  { id: 'r4', name: 'Sam Patterson', gradYear: 2025, classYear: 'Incoming', allAroundAvg: 85.3, topEvent: 'FX', topEventScore: 14.8, status: 'SIGNED' },
  { id: 'r5', name: 'Owen Mitchell', gradYear: 2023, classYear: 'Sophomore', allAroundAvg: 85.6, topEvent: 'HB', topEventScore: 14.9, status: 'ENROLLED' },
  { id: 'r6', name: 'Lucas Reed', gradYear: 2022, classYear: 'Junior', allAroundAvg: 86.2, topEvent: 'VT', topEventScore: 15.0, status: 'ENROLLED' },
];

const MOCK_ACTIVITY: CoachActivity[] = [
  { id: 'a1', type: 'NEW_SCORE', athleteName: 'Chris Johnson', detail: 'posted a new AA score of 86.45 at Winter Cup', time: '2h ago' },
  { id: 'a2', type: 'REPLY', athleteName: 'Marcus Chen', detail: 'replied to your message', time: '4h ago' },
  { id: 'a3', type: 'NEW_POST', athleteName: 'Tyler Martinez', detail: 'shared a new floor routine highlight', time: '1d ago' },
  { id: 'a4', type: 'COMMIT', athleteName: 'Jake Williams', detail: 'committed to your program', time: '1w ago' },
  { id: 'a5', type: 'PROFILE_VIEW', athleteName: 'Brandon Lee', detail: 'viewed your program profile', time: '1w ago' },
];

export async function getProspects(): Promise<Prospect[]> {
  if (isDemoMode()) return MOCK_PROSPECTS;
  return apiCall<Prospect[]>('/recruiting/prospects');
}

export async function getRoster(): Promise<RosterAthlete[]> {
  if (isDemoMode()) return MOCK_ROSTER;
  return apiCall<RosterAthlete[]>('/recruiting/roster');
}

export async function getCoachActivity(): Promise<CoachActivity[]> {
  if (isDemoMode()) return MOCK_ACTIVITY;
  return apiCall<CoachActivity[]>('/recruiting/activity');
}

export function getTeamStats(roster: RosterAthlete[]): TeamStat[] {
  const avgAA = roster.length
    ? (roster.reduce((sum, r) => sum + r.allAroundAvg, 0) / roster.length).toFixed(2)
    : '0';
  const topAA = roster.length ? Math.max(...roster.map((r) => r.allAroundAvg)).toFixed(2) : '0';
  const incoming = roster.filter((r) => r.status === 'COMMITTED' || r.status === 'SIGNED').length;
  return [
    { label: 'Roster Size', value: String(roster.length), sub: 'active + incoming' },
    { label: 'Team AA Avg', value: avgAA, sub: 'all-around' },
    { label: 'Top AA', value: topAA, sub: 'team high' },
    { label: 'Incoming', value: String(incoming), sub: 'committed/signed' },
  ];
}
