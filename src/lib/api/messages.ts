import { apiCall } from './client';

export interface ChatParticipant {
  id: string;
  name: string;
  subtitle: string; // Role or team name
  initials: string;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: 'me' | string;
  senderName: string;
  text: string;
  sentAt: string; // ISO timestamp
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessageTime: string;
}

// Mock data for demo/development
export const COACH_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant: {
      id: 'athlete-1',
      name: 'Marcus Chen',
      subtitle: 'Class of 2027',
      initials: 'MC',
      online: true,
    },
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'athlete-1',
        senderName: 'Marcus Chen',
        text: 'Hi Coach, thanks for reaching out! I\'m very interested in your program.',
        sentAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'me',
        senderName: 'You',
        text: 'Great to hear! We\'d love to have you visit campus. What dates work for you?',
        sentAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'athlete-1',
        senderName: 'Marcus Chen',
        text: 'How about spring break? That\'s when I have the most flexibility.',
        sentAt: new Date(Date.now() - 600000).toISOString(),
      },
    ],
    unreadCount: 0,
    lastMessageTime: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'conv-2',
    participant: {
      id: 'athlete-2',
      name: 'Chris Johnson',
      subtitle: 'Class of 2026',
      initials: 'CJ',
      online: false,
    },
    messages: [
      {
        id: 'msg-4',
        conversationId: 'conv-2',
        senderId: 'me',
        senderName: 'You',
        text: 'Hi Chris! We\'ve been following your progress and are impressed with your AA scores.',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    unreadCount: 0,
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const ATHLETE_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-3',
    participant: {
      id: 'coach-1',
      name: 'Dan Mills',
      subtitle: 'Stanford University',
      initials: 'DM',
      online: true,
    },
    messages: [
      {
        id: 'msg-5',
        conversationId: 'conv-3',
        senderId: 'coach-1',
        senderName: 'Dan Mills',
        text: 'Hi! We\'d love for you to visit Stanford. Your AA average is exactly what we\'re looking for.',
        sentAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'msg-6',
        conversationId: 'conv-3',
        senderId: 'me',
        senderName: 'You',
        text: 'Thanks Coach Mills! Stanford sounds amazing. When can we set up a visit?',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    unreadCount: 0,
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'conv-4',
    participant: {
      id: 'coach-2',
      name: 'Rick Torres',
      subtitle: 'University of Oklahoma',
      initials: 'RT',
      online: false,
    },
    messages: [
      {
        id: 'msg-7',
        conversationId: 'conv-4',
        senderId: 'coach-2',
        senderName: 'Rick Torres',
        text: 'Hey! Just wanted to check in and see if you\'re still interested in OU.',
        sentAt: new Date(Date.now() - 345600000).toISOString(),
      },
    ],
    unreadCount: 1,
    lastMessageTime: new Date(Date.now() - 345600000).toISOString(),
  },
];

export async function getConversations(role: 'ATHLETE' | 'COACH'): Promise<Conversation[]> {
  // In demo mode, return mock data
  // In production, this would call the API
  if (role === 'COACH') {
    return COACH_CONVERSATIONS;
  } else {
    return ATHLETE_CONVERSATIONS;
  }
}

export async function createReachOutConversation(
  athleteId: string,
  athleteName: string,
  firstMessage: string
): Promise<Conversation> {
  // In demo mode, create a mock conversation
  // In production, this would call the API
  const conversation: Conversation = {
    id: `conv-${Date.now()}`,
    participant: {
      id: athleteId,
      name: athleteName,
      subtitle: 'Class of 2027',
      initials: athleteName.split(' ').map(n => n[0]).join(''),
      online: false,
    },
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversationId: `conv-${Date.now()}`,
        senderId: 'me',
        senderName: 'You',
        text: firstMessage,
        sentAt: new Date().toISOString(),
      },
    ],
    unreadCount: 0,
    lastMessageTime: new Date().toISOString(),
  };
  return conversation;
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  // In production, this would call the API
  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: 'me',
    senderName: 'You',
    text,
    sentAt: new Date().toISOString(),
  };
  return message;
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
