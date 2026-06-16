import { apiCall } from './client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: string; // ISO timestamp
}

export interface ChatParticipant {
  id: string;
  name: string;
  subtitle: string;
  initials: string;
}

export interface ContactRequestMessage {
  id: string;
  contactRequestId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  messages: ContactRequestMessage[];
  lastMessageTime: string;
  unreadCount: number;
}

// Coach: Get sent contact requests (their outgoing conversations)
export async function getCoachConversations(): Promise<Conversation[]> {
  const requests = await apiCall<any[]>('/coach/recruiting/contact-requests', {
    method: 'GET',
  });

  // Transform contact requests into conversations
  return Promise.all(
    requests.map(async req => {
      const messages = await getCoachConversationThread(req.id);
      const lastMsg = messages[messages.length - 1];

      return {
        id: req.id,
        participant: {
          id: req.athleteId,
          name: req.athleteName,
          subtitle: `Class of ${req.athleteGradYear}`,
          initials: req.athleteName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase(),
        },
        messages,
        lastMessageTime: lastMsg?.createdAt || req.createdAt,
        unreadCount: 0, // Backend will track this if needed
      };
    })
  );
}

// Athlete: Get received contact requests (inbox)
export async function getAthleteConversations(): Promise<Conversation[]> {
  const requests = await apiCall<any[]>('/athlete/inbox/contact-requests', {
    method: 'GET',
  });

  // Transform inbox requests into conversations
  return Promise.all(
    requests.map(async req => {
      const messages = await getAthleteConversationThread(req.id);
      const lastMsg = messages[messages.length - 1];

      return {
        id: req.id,
        participant: {
          id: req.coachId,
          name: req.coachName,
          subtitle: req.coachUniversity || 'Coach',
          initials: req.coachName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase(),
        },
        messages,
        lastMessageTime: lastMsg?.createdAt || req.createdAt,
        unreadCount: req.unreadCount || 0,
      };
    })
  );
}

export async function getConversations(role: 'ATHLETE' | 'COACH'): Promise<Conversation[]> {
  if (role === 'COACH') {
    return getCoachConversations();
  } else {
    return getAthleteConversations();
  }
}

// Coach: Get conversation thread with athlete
export async function getCoachConversationThread(contactRequestId: string): Promise<ContactRequestMessage[]> {
  return apiCall<ContactRequestMessage[]>(
    `/coach/recruiting/contact-requests/${contactRequestId}/messages`,
    {
      method: 'GET',
    }
  );
}

// Athlete: Get conversation thread with coach
export async function getAthleteConversationThread(contactRequestId: string): Promise<ContactRequestMessage[]> {
  return apiCall<ContactRequestMessage[]>(
    `/athlete/inbox/contact-requests/${contactRequestId}/messages`,
    {
      method: 'GET',
    }
  );
}

// Coach: Send message in conversation
export async function sendCoachMessage(contactRequestId: string, text: string): Promise<ContactRequestMessage> {
  return apiCall<ContactRequestMessage>(
    `/coach/recruiting/contact-requests/${contactRequestId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ messageText: text }),
    }
  );
}

// Athlete: Reply to coach message
export async function sendAthleteMessage(contactRequestId: string, text: string): Promise<ContactRequestMessage> {
  return apiCall<ContactRequestMessage>(
    `/athlete/inbox/contact-requests/${contactRequestId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ messageText: text }),
    }
  );
}

// Coach: Initiate contact with athlete
export async function initiateCoachContact(athleteId: string, initialMessage: string): Promise<any> {
  return apiCall<any>('/coach/recruiting/contact-requests', {
    method: 'POST',
    body: JSON.stringify({
      athleteId,
      initialMessage,
    }),
  });
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
