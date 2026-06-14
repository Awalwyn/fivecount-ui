import { apiCall } from './client';

export interface ContactRequest {
  id: string;
  athleteId: string;
  coachId: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export async function sendContactRequest(
  athleteId: string,
  coachMessage: string
): Promise<ContactRequest> {
  return apiCall<ContactRequest>('/api/contact-requests', {
    method: 'POST',
    body: JSON.stringify({
      athleteId,
      coachMessage,
    }),
  });
}
