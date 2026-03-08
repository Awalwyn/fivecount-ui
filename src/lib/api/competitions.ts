import { apiCall } from './client';

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
  return apiCall<CompetitionResult[]>(`/athletes/${athleteId}/meets`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCompetitionResults(
  athleteId: string
): Promise<CompetitionResult[]> {
  return apiCall<CompetitionResult[]>(`/athletes/${athleteId}/results`);
}

export async function updateCompetitionResult(
  athleteId: string,
  resultId: string,
  data: Partial<CompetitionResult>
): Promise<CompetitionResult> {
  return apiCall<CompetitionResult>(`/athletes/${athleteId}/results/${resultId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCompetitionResult(
  athleteId: string,
  resultId: string
): Promise<void> {
  await apiCall(`/athletes/${athleteId}/results/${resultId}`, {
    method: 'DELETE',
  });
}
