import type { UserRole } from '@/contexts/AuthContext';

export interface ChatParticipant {
  id: string;
  name: string;
  /** Short context line under the name, e.g. school or club + grad year */
  subtitle: string;
  initials: string;
  /** Tailwind avatar bg accent */
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  /** 'me' means the current logged-in user; otherwise the participant id */
  senderId: 'me' | string;
  text: string;
  sentAt: string; // ISO string
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  messages: ChatMessage[];
  unreadCount: number;
}

function iso(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

// ---- Coach view: the coach is "me", talking to athletes ----
const COACH_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-c1',
    participant: {
      id: 'athlete-1',
      name: 'Marcus Chen',
      subtitle: 'Golden State Gymnastics • 2025',
      initials: 'MC',
      online: true,
    },
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        conversationId: 'conv-c1',
        senderId: 'me',
        text: "Hi Marcus, I'm Coach Alex with the Stanford program. Really impressed with your high bar work this season.",
        sentAt: iso(2880),
      },
      {
        id: 'm2',
        conversationId: 'conv-c1',
        senderId: 'athlete-1',
        text: 'Thank you Coach! Stanford has always been a dream school for me.',
        sentAt: iso(2820),
      },
      {
        id: 'm3',
        conversationId: 'conv-c1',
        senderId: 'me',
        text: 'Love to hear it. Are you planning to compete at the Winter Cup? Would be great to see you there.',
        sentAt: iso(180),
      },
      {
        id: 'm4',
        conversationId: 'conv-c1',
        senderId: 'athlete-1',
        text: "Yes I'll be there competing all-around! I'll send you my session time.",
        sentAt: iso(45),
      },
      {
        id: 'm5',
        conversationId: 'conv-c1',
        senderId: 'athlete-1',
        text: 'Session 2, Saturday morning.',
        sentAt: iso(43),
      },
    ],
  },
  {
    id: 'conv-c2',
    participant: {
      id: 'athlete-6',
      name: 'Chris Johnson',
      subtitle: 'Midwest Elite • 2025',
      initials: 'CJ',
    },
    unreadCount: 0,
    messages: [
      {
        id: 'm6',
        conversationId: 'conv-c2',
        senderId: 'me',
        text: 'Chris, your pommel horse routine is one of the best in your class. Would love to talk about your recruiting timeline.',
        sentAt: iso(1440),
      },
      {
        id: 'm7',
        conversationId: 'conv-c2',
        senderId: 'athlete-6',
        text: "Appreciate it Coach. I'm taking official visits this fall.",
        sentAt: iso(1400),
      },
      {
        id: 'm8',
        conversationId: 'conv-c2',
        senderId: 'me',
        text: "Perfect. Let's get you on campus. I'll have our coordinator reach out with dates.",
        sentAt: iso(1380),
      },
    ],
  },
  {
    id: 'conv-c3',
    participant: {
      id: 'athlete-7',
      name: 'Brandon Lee',
      subtitle: 'Pacific Coast Academy • 2026',
      initials: 'BL',
    },
    unreadCount: 1,
    messages: [
      {
        id: 'm9',
        conversationId: 'conv-c3',
        senderId: 'athlete-7',
        text: "Hi Coach, thanks for the follow! I'd love to learn more about your program.",
        sentAt: iso(300),
      },
    ],
  },
];

// ---- Athlete view: the athlete is "me", talking to coaches ----
const ATHLETE_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-a1',
    participant: {
      id: 'coach-stanford',
      name: 'Coach Dan Mills',
      subtitle: 'Stanford Men\u2019s Gymnastics',
      initials: 'DM',
      online: true,
    },
    unreadCount: 1,
    messages: [
      {
        id: 'am1',
        conversationId: 'conv-a1',
        senderId: 'coach-stanford',
        text: "Hi Alex, Coach Mills from Stanford. We've been tracking your all-around progression and we're very impressed.",
        sentAt: iso(240),
      },
      {
        id: 'am2',
        conversationId: 'conv-a1',
        senderId: 'me',
        text: 'Thank you Coach, that means a lot! Stanford is at the top of my list.',
        sentAt: iso(200),
      },
      {
        id: 'am3',
        conversationId: 'conv-a1',
        senderId: 'coach-stanford',
        text: "Let's set up a call this week. Are you free Thursday evening?",
        sentAt: iso(30),
      },
    ],
  },
  {
    id: 'conv-a2',
    participant: {
      id: 'coach-oklahoma',
      name: 'Coach Rick Torres',
      subtitle: 'Oklahoma Men\u2019s Gymnastics',
      initials: 'RT',
    },
    unreadCount: 0,
    messages: [
      {
        id: 'am4',
        conversationId: 'conv-a2',
        senderId: 'coach-oklahoma',
        text: 'Alex, great vault at regionals. Keep it up and stay in touch with us.',
        sentAt: iso(2880),
      },
      {
        id: 'am5',
        conversationId: 'conv-a2',
        senderId: 'me',
        text: 'Thank you Coach Torres! Will do.',
        sentAt: iso(2820),
      },
    ],
  },
];

export function getConversations(role: UserRole): Conversation[] {
  return role === 'COACH' ? COACH_CONVERSATIONS : ATHLETE_CONVERSATIONS;
}

/** Build a fresh conversation seeded by a coach reach-out to an athlete. */
export function createReachOutConversation(
  athlete: { id: string; name: string; subtitle: string; initials: string },
  firstMessage: string,
): Conversation {
  const convId = `conv-new-${athlete.id}-${Date.now()}`;
  return {
    id: convId,
    participant: {
      id: athlete.id,
      name: athlete.name,
      subtitle: athlete.subtitle,
      initials: athlete.initials,
    },
    unreadCount: 0,
    messages: [
      {
        id: `msg-${Date.now()}`,
        conversationId: convId,
        senderId: 'me',
        text: firstMessage,
        sentAt: new Date().toISOString(),
      },
    ],
  };
}

/** Friendly relative timestamp for lists/bubbles. */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
