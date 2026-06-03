import { apiCall, isDemoMode } from './client';

export type EventType =
  | 'ALL_AROUND'
  | 'FLOOR'
  | 'POMMEL_HORSE'
  | 'RINGS'
  | 'VAULT'
  | 'PARALLEL_BARS'
  | 'HIGH_BAR';

export interface CompetitionResult {
  id: string;
  athleteId: string;
  meetName: string;
  meetDate: string;
  location: string;
  eventType: EventType;
  score: number;
  createdAt: string;
  updatedAt: string;
}

// Mock competition results for demo mode
const MOCK_RESULTS: CompetitionResult[] = [
  {
    id: 'result-1',
    athleteId: 'demo-user-123',
    meetName: 'Winter Classic',
    meetDate: '2024-01-15',
    location: 'Denver, CO',
    eventType: 'FLOOR',
    score: 14.200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'result-2',
    athleteId: 'demo-user-123',
    meetName: 'Winter Classic',
    meetDate: '2024-01-15',
    location: 'Denver, CO',
    eventType: 'POMMEL_HORSE',
    score: 13.850,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'result-3',
    athleteId: 'demo-user-123',
    meetName: 'Winter Classic',
    meetDate: '2024-01-15',
    location: 'Denver, CO',
    eventType: 'RINGS',
    score: 14.100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'result-4',
    athleteId: 'demo-user-123',
    meetName: 'Winter Classic',
    meetDate: '2024-01-15',
    location: 'Denver, CO',
    eventType: 'VAULT',
    score: 14.500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'result-5',
    athleteId: 'demo-user-123',
    meetName: 'Winter Classic',
    meetDate: '2024-01-15',
    location: 'Denver, CO',
    eventType: 'PARALLEL_BARS',
    score: 14.050,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'result-6',
    athleteId: 'demo-user-123',
    meetName: 'Winter Classic',
    meetDate: '2024-01-15',
    location: 'Denver, CO',
    eventType: 'HIGH_BAR',
    score: 13.950,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'result-7',
    athleteId: 'demo-user-123',
    meetName: 'Regional Championships',
    meetDate: '2024-01-20',
    location: 'Phoenix, AZ',
    eventType: 'VAULT',
    score: 14.650,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function addCompetitionResult(
  athleteId: string,
  data: {
    meetName: string;
    meetDate: string;
    location: string;
    eventType: EventType;
    score: number;
  }
): Promise<CompetitionResult> {
  if (isDemoMode()) {
    return {
      id: `result-${Date.now()}`,
      athleteId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return apiCall<CompetitionResult>(`/athletes/${athleteId}/results`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addMeet(
  athleteId: string,
  data: {
    meetName: string;
    meetDate: string;
    meetLocation?: string;
    floor?: number | null;
    pommelHorse?: number | null;
    rings?: number | null;
    vault?: number | null;
    parallelBars?: number | null;
    highBar?: number | null;
  }
): Promise<CompetitionResult[]> {
  if (isDemoMode()) {
    const results: CompetitionResult[] = [];
    const events = [
      { key: 'floor', type: 'FLOOR' as EventType },
      { key: 'pommelHorse', type: 'POMMEL_HORSE' as EventType },
      { key: 'rings', type: 'RINGS' as EventType },
      { key: 'vault', type: 'VAULT' as EventType },
      { key: 'parallelBars', type: 'PARALLEL_BARS' as EventType },
      { key: 'highBar', type: 'HIGH_BAR' as EventType },
    ];
    for (const event of events) {
      const score = data[event.key as keyof typeof data] as number | null | undefined;
      if (score != null) {
        results.push({
          id: `result-${Date.now()}-${event.key}`,
          athleteId,
          meetName: data.meetName,
          meetDate: data.meetDate,
          location: data.meetLocation || '',
          eventType: event.type,
          score,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return results;
  }
  return apiCall<CompetitionResult[]>(`/athletes/${athleteId}/meets`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCompetitionResults(
  athleteId: string
): Promise<CompetitionResult[]> {
  if (isDemoMode()) {
    return MOCK_RESULTS.filter(r => r.athleteId === athleteId);
  }
  return apiCall<CompetitionResult[]>(`/athletes/${athleteId}/results`);
}

export async function updateCompetitionResult(
  athleteId: string,
  resultId: string,
  data: Partial<CompetitionResult>
): Promise<CompetitionResult> {
  if (isDemoMode()) {
    const existing = MOCK_RESULTS.find(r => r.id === resultId);
    return { ...existing, ...data, updatedAt: new Date().toISOString() } as CompetitionResult;
  }
  return apiCall<CompetitionResult>(`/athletes/${athleteId}/results/${resultId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCompetitionResult(
  athleteId: string,
  resultId: string
): Promise<void> {
  if (isDemoMode()) {
    console.log('[Demo Mode] Delete result:', resultId);
    return;
  }
  await apiCall(`/athletes/${athleteId}/results/${resultId}`, {
    method: 'DELETE',
  });
}
