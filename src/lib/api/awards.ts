import { apiCall } from './client';

export interface Award {
  id: string;
  athleteId: string;
  title: string;
  year: number;
}

export async function getAthletesAwards(athleteId: string): Promise<Award[]> {
  try {
    return await apiCall<Award[]>(`/api/athletes/${athleteId}/awards`);
  } catch {
    return [];
  }
}

export async function createAward(
  athleteId: string,
  award: { title: string; year: number }
): Promise<Award> {
  return apiCall<Award>(`/api/athletes/${athleteId}/awards`, {
    method: 'POST',
    body: JSON.stringify(award),
  });
}

export async function updateAward(
  athleteId: string,
  awardId: string,
  award: { title?: string; year?: number }
): Promise<Award> {
  return apiCall<Award>(`/api/athletes/${athleteId}/awards/${awardId}`, {
    method: 'PUT',
    body: JSON.stringify(award),
  });
}

export async function deleteAward(athleteId: string, awardId: string): Promise<void> {
  return apiCall<void>(`/api/athletes/${athleteId}/awards/${awardId}`, {
    method: 'DELETE',
  });
}
