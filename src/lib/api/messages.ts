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

interface BackendPage<T> {
  content?: T[];
}

interface BackendContactRequest {
  id: string;
  coachId?: string;
  coachName?: string;
  coachProgram?: string;
  coachUniversity?: string;
  athleteId?: string;
  athleteName?: string;
  athleteGradYear?: number;
  createdAt?: string;
  unreadCount?: number;
}

interface BackendMessage {
  id: string;
  senderId: string;
  senderName?: string;
  messageText?: string;
  text?: string;
  content?: string;
  createdAt?: string;
  sentAt?: string;
}

function toArray<T>(value: T[] | BackendPage<T>): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value.content ?? [];
}

function initialsFor(name?: string): string {
  if (!name) {
    return '?';
  }
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// Map backend message response to frontend ChatMessage format
function mapBackendMessage(msg: BackendMessage, conversationId: string): ChatMessage {
  return {
    id: msg.id,
    conversationId,
    senderId: msg.senderId,
    senderName: msg.senderName || 'Unknown',
    text: msg.messageText || msg.text || msg.content || '',
    sentAt: msg.createdAt || msg.sentAt || new Date().toISOString(),
  };
}

// Coach: Get sent contact requests (their outgoing conversations)
export async function getCoachConversations(): Promise<Conversation[]> {
  const response = await apiCall<BackendContactRequest[] | BackendPage<BackendContactRequest>>('/api/coach/recruiting/contact-requests', {
    method: 'GET',
  });
  const requests = toArray(response);

  return Promise.all(
    requests.map(async req => {
      const messages = await getCoachConversationThread(req.id);
      const lastMsg = messages[messages.length - 1];

      return {
        id: req.id,
        participant: {
          id: req.athleteId || '',
          name: req.athleteName || 'Athlete',
          subtitle: req.athleteGradYear ? `Class of ${req.athleteGradYear}` : 'Athlete',
          initials: initialsFor(req.athleteName),
        },
        messages,
        lastMessageTime: lastMsg?.sentAt || req.createdAt || new Date().toISOString(),
        unreadCount: 0,
      };
    })
  );
}

// Athlete: Get received contact requests (inbox)
export async function getAthleteConversations(): Promise<Conversation[]> {
  const response = await apiCall<BackendContactRequest[] | BackendPage<BackendContactRequest>>('/api/athlete/inbox/contact-requests', {
    method: 'GET',
  });
  const requests = toArray(response);

  return Promise.all(
    requests.map(async req => {
      const messages = await getAthleteConversationThread(req.id);
      const lastMsg = messages[messages.length - 1];

      return {
        id: req.id,
        participant: {
          id: req.coachId || '',
          name: req.coachName || 'Coach',
          subtitle: req.coachUniversity || 'Coach',
          initials: initialsFor(req.coachName),
        },
        messages,
        lastMessageTime: lastMsg?.sentAt || req.createdAt || new Date().toISOString(),
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
  const raw = await apiCall<BackendMessage[]>(
    `/api/coach/recruiting/contact-requests/${contactRequestId}/messages`,
    { method: 'GET' }
  );
  return raw.map(msg => mapBackendMessage(msg, contactRequestId));
}

// Athlete: Get conversation thread with coach
export async function getAthleteConversationThread(contactRequestId: string): Promise<ChatMessage[]> {
  const raw = await apiCall<BackendMessage[]>(
    `/api/athlete/inbox/contact-requests/${contactRequestId}/messages`,
    { method: 'GET' }
  );
  return raw.map(msg => mapBackendMessage(msg, contactRequestId));
}

// Coach: Send message in conversation
export async function sendCoachMessage(contactRequestId: string, text: string): Promise<ChatMessage> {
  const raw = await apiCall<BackendMessage>(
    `/api/coach/recruiting/contact-requests/${contactRequestId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content: text }),
    }
  );
  return mapBackendMessage(raw, contactRequestId);
}

// Athlete: Reply to coach message
export async function sendAthleteMessage(contactRequestId: string, text: string): Promise<ChatMessage> {
  const raw = await apiCall<BackendMessage>(
    `/api/athlete/inbox/contact-requests/${contactRequestId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content: text }),
    }
  );
  return mapBackendMessage(raw, contactRequestId);
}

// Coach: Initiate contact with athlete
export async function initiateCoachContact(athleteId: string, initialMessage: string): Promise<BackendContactRequest> {
  return apiCall<BackendContactRequest>('/api/coach/recruiting/contact-requests', {
    method: 'POST',
    body: JSON.stringify({ athleteId, coachMessage: initialMessage }),
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
