import { apiCall } from './client';

export interface ChatParticipant {
  id: string;
  name: string;
  subtitle: string;
  initials: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  messages: ChatMessage[];
  lastMessageTime: string;
  unreadCount: number;
}

// Map backend message response to frontend ChatMessage format
function mapBackendMessage(msg: any, conversationId: string): ChatMessage {
  return {
    id: msg.id,
    conversationId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    text: msg.messageText || msg.text,
    sentAt: msg.createdAt || msg.sentAt,
  };
}

// Coach: Get sent contact requests (their outgoing conversations)
export async function getCoachConversations(): Promise<Conversation[]> {
  const requests = await apiCall<any[]>('/api/coach/recruiting/contact-requests', {
    method: 'GET',
  });

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
        lastMessageTime: lastMsg?.sentAt || req.createdAt,
        unreadCount: 0,
      };
    })
  );
}

// Athlete: Get received contact requests (inbox)
export async function getAthleteConversations(): Promise<Conversation[]> {
  const requests = await apiCall<any[]>('/api/athlete/inbox/contact-requests', {
    method: 'GET',
  });

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
        lastMessageTime: lastMsg?.sentAt || req.createdAt,
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
export async function getCoachConversationThread(contactRequestId: string): Promise<ChatMessage[]> {
  const raw = await apiCall<any[]>(
    `/api/coach/recruiting/contact-requests/${contactRequestId}/messages`,
    { method: 'GET' }
  );
  return raw.map(msg => mapBackendMessage(msg, contactRequestId));
}

// Athlete: Get conversation thread with coach
export async function getAthleteConversationThread(contactRequestId: string): Promise<ChatMessage[]> {
  const raw = await apiCall<any[]>(
    `/api/athlete/inbox/contact-requests/${contactRequestId}/messages`,
    { method: 'GET' }
  );
  return raw.map(msg => mapBackendMessage(msg, contactRequestId));
}

// Coach: Send message in conversation
export async function sendCoachMessage(contactRequestId: string, text: string): Promise<ChatMessage> {
  const raw = await apiCall<any>(
    `/api/coach/recruiting/contact-requests/${contactRequestId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ messageText: text }),
    }
  );
  return mapBackendMessage(raw, contactRequestId);
}

// Athlete: Reply to coach message
export async function sendAthleteMessage(contactRequestId: string, text: string): Promise<ChatMessage> {
  const raw = await apiCall<any>(
    `/api/athlete/inbox/contact-requests/${contactRequestId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ messageText: text }),
    }
  );
  return mapBackendMessage(raw, contactRequestId);
}

// Coach: Initiate contact with athlete
export async function initiateCoachContact(athleteId: string, initialMessage: string): Promise<any> {
  return apiCall<any>('/api/coach/recruiting/contact-requests', {
    method: 'POST',
    body: JSON.stringify({ athleteId, initialMessage }),
  });
}

// Create a local reach-out conversation object (not persisted until sent)
export function createReachOutConversation(
  athlete: { id: string; name: string; subtitle: string; initials: string },
  firstMessage: string
): Conversation {
  const convId = `conv-draft-${athlete.id}-${Date.now()}`;
  return {
    id: convId,
    participant: athlete,
    unreadCount: 0,
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversationId: convId,
        senderId: 'me',
        senderName: 'You',
        text: firstMessage,
        sentAt: new Date().toISOString(),
      },
    ],
    lastMessageTime: new Date().toISOString(),
  };
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
