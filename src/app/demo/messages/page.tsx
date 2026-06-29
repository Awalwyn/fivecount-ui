'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, MessageSquare, Send } from 'lucide-react';
import { useDemo, type DemoRole } from '@/components/demo/DemoContext';

type DemoMessage = {
  id: string;
  senderId: 'me' | string;
  senderName: string;
  text: string;
  sentAt: string;
};

type DemoConversation = {
  id: string;
  participant: {
    id: string;
    name: string;
    subtitle: string;
    initials: string;
    online?: boolean;
  };
  messages: DemoMessage[];
  unreadCount: number;
  lastMessageTime: string;
};

const COACH_CONVERSATIONS: DemoConversation[] = [
  {
    id: 'coach-conv-1',
    participant: {
      id: 'athlete-1',
      name: 'Marcus Chen',
      subtitle: 'Class of 2027',
      initials: 'MC',
      online: true,
    },
    messages: [
      {
        id: 'coach-msg-1',
        senderId: 'athlete-1',
        senderName: 'Marcus Chen',
        text: "Hi Coach, thanks for reaching out! I'm very interested in your program.",
        sentAt: '2026-06-28T13:20:00.000Z',
      },
      {
        id: 'coach-msg-2',
        senderId: 'me',
        senderName: 'You',
        text: "Great to hear! We'd love to have you visit campus. What dates work for you?",
        sentAt: '2026-06-28T13:48:00.000Z',
      },
      {
        id: 'coach-msg-3',
        senderId: 'athlete-1',
        senderName: 'Marcus Chen',
        text: "How about spring break? That's when I have the most flexibility.",
        sentAt: '2026-06-28T14:06:00.000Z',
      },
    ],
    unreadCount: 0,
    lastMessageTime: '2026-06-28T14:06:00.000Z',
  },
  {
    id: 'coach-conv-2',
    participant: {
      id: 'athlete-2',
      name: 'Chris Johnson',
      subtitle: 'Class of 2026',
      initials: 'CJ',
      online: false,
    },
    messages: [
      {
        id: 'coach-msg-4',
        senderId: 'me',
        senderName: 'You',
        text: "Hi Chris! We've been following your progress and are impressed with your AA scores.",
        sentAt: '2026-06-27T16:35:00.000Z',
      },
    ],
    unreadCount: 0,
    lastMessageTime: '2026-06-27T16:35:00.000Z',
  },
];

const ATHLETE_CONVERSATIONS: DemoConversation[] = [
  {
    id: 'athlete-conv-1',
    participant: {
      id: 'coach-1',
      name: 'Dan Mills',
      subtitle: 'Stanford University',
      initials: 'DM',
      online: true,
    },
    messages: [
      {
        id: 'athlete-msg-1',
        senderId: 'coach-1',
        senderName: 'Dan Mills',
        text: "Hi! We'd love for you to visit Stanford. Your AA average is exactly what we're looking for.",
        sentAt: '2026-06-26T15:12:00.000Z',
      },
      {
        id: 'athlete-msg-2',
        senderId: 'me',
        senderName: 'You',
        text: 'Thanks Coach Mills! Stanford sounds amazing. When can we set up a visit?',
        sentAt: '2026-06-27T11:24:00.000Z',
      },
    ],
    unreadCount: 0,
    lastMessageTime: '2026-06-27T11:24:00.000Z',
  },
  {
    id: 'athlete-conv-2',
    participant: {
      id: 'coach-2',
      name: 'Rick Torres',
      subtitle: 'University of Oklahoma',
      initials: 'RT',
      online: false,
    },
    messages: [
      {
        id: 'athlete-msg-3',
        senderId: 'coach-2',
        senderName: 'Rick Torres',
        text: "Hey! Just wanted to check in and see if you're still interested in OU.",
        sentAt: '2026-06-24T18:40:00.000Z',
      },
    ],
    unreadCount: 1,
    lastMessageTime: '2026-06-24T18:40:00.000Z',
  },
];

export default function DemoMessages() {
  const { role } = useDemo();
  const [coachConversations, setCoachConversations] = useState(COACH_CONVERSATIONS);
  const [athleteConversations, setAthleteConversations] = useState(ATHLETE_CONVERSATIONS);
  const [activeByRole, setActiveByRole] = useState<Record<DemoRole, string>>({
    ATHLETE: ATHLETE_CONVERSATIONS[0].id,
    COACH: COACH_CONVERSATIONS[0].id,
  });
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = role === 'COACH' ? coachConversations : athleteConversations;
  const activeConversationId = activeByRole[role];
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0];
  const unreadCount = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  const pageCopy = useMemo(() => {
    if (role === 'COACH') {
      return {
        eyebrow: 'Coach inbox',
        title: 'Messages',
        subtitle: 'Follow up with recruits and keep campus visit conversations moving.',
      };
    }

    return {
      eyebrow: 'Athlete inbox',
      title: 'Messages',
      subtitle: 'Keep track of coach outreach and next steps with programs.',
    };
  }, [role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, activeConversation?.messages.length]);

  const selectConversation = (conversationId: string) => {
    setActiveByRole((current) => ({ ...current, [role]: conversationId }));
    const update = (conversation: DemoConversation) => (
      conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
    );
    if (role === 'COACH') {
      setCoachConversations((current) => current.map(update));
    } else {
      setAthleteConversations((current) => current.map(update));
    }
  };

  const sendMessage = () => {
    const text = messageText.trim();
    if (!text || !activeConversation) return;

    const newMessage: DemoMessage = {
      id: `demo-msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      text,
      sentAt: new Date().toISOString(),
    };

    const update = (conversation: DemoConversation) => (
      conversation.id === activeConversation.id
        ? {
            ...conversation,
            messages: [...conversation.messages, newMessage],
            lastMessageTime: newMessage.sentAt,
          }
        : conversation
    );

    if (role === 'COACH') {
      setCoachConversations((current) => current.map(update));
    } else {
      setAthleteConversations((current) => current.map(update));
    }

    setMessageText('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 pb-6 border-b border-[#1f1f1f]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5EFF6E] mb-3">{pageCopy.eyebrow}</p>
          <h1 className="heading-display text-4xl mb-2">{pageCopy.title}</h1>
          <p className="text-[#a0a0a0]">{pageCopy.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-[#1f1f1f] bg-[#111111] px-4 py-3">
          <MessageSquare size={18} className="text-[#5EFF6E]" />
          <span className="text-sm font-semibold text-white">{conversations.length} conversations</span>
          {unreadCount > 0 && <span className="rounded-full bg-[#5EFF6E] px-2 py-0.5 text-xs font-bold text-black">{unreadCount} unread</span>}
        </div>
      </div>

      <section className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-lg border border-[#1f1f1f] bg-[#111111] lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-[#1f1f1f] bg-[#0d0d0d] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">Inbox</h2>
              <p className="text-xs text-[#7f8794]">{role === 'COACH' ? 'Recruit conversations' : 'Coach conversations'}</p>
            </div>
            <span className="rounded-full border border-[#263a28] bg-[#132216] px-3 py-1 text-xs font-bold text-[#5EFF6E]">
              {role === 'COACH' ? 'Coach view' : 'Athlete view'}
            </span>
          </div>

          <div className="max-h-[300px] overflow-y-auto lg:max-h-none">
            {conversations.map((conversation) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              const isActive = activeConversation?.id === conversation.id;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  className={`w-full border-b border-[#1f1f1f] px-5 py-4 text-left transition-colors ${
                    isActive ? 'bg-[#162118]' : 'hover:bg-[#111811]'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16391d] text-sm font-bold text-[#5EFF6E]">
                        {conversation.participant.initials}
                      </div>
                      {conversation.participant.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0d0d0d] bg-[#5EFF6E]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{conversation.participant.name}</p>
                          <p className="mt-0.5 truncate text-xs text-[#7f8794]">{conversation.participant.subtitle}</p>
                        </div>
                        <span className="shrink-0 text-xs text-[#7f8794]">{formatRelativeTime(conversation.lastMessageTime)}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm text-[#a0a0a0]">{lastMessage?.text}</p>
                        {conversation.unreadCount > 0 && (
                          <span className="rounded-full bg-[#5EFF6E] px-2 py-0.5 text-xs font-bold text-black">{conversation.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {activeConversation && (
          <div className="flex min-h-[520px] flex-col bg-[#0a0a0a]">
            <header className="flex items-center gap-4 border-b border-[#1f1f1f] px-5 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16391d] text-sm font-bold text-[#5EFF6E]">
                {activeConversation.participant.initials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-white">{activeConversation.participant.name}</h2>
                <p className="truncate text-sm text-[#7f8794]">{activeConversation.participant.subtitle}</p>
              </div>
              <div className="ml-auto hidden items-center gap-2 rounded-full border border-[#1f1f1f] px-3 py-1.5 text-xs font-semibold text-[#a0a0a0] sm:flex">
                <Clock3 size={14} />
                {activeConversation.participant.online ? 'Online now' : `Last message ${formatRelativeTime(activeConversation.lastMessageTime)}`}
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              {activeConversation.messages.map((message) => {
                const isMe = message.senderId === 'me';

                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] sm:max-w-[520px] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <span className="px-1 text-xs font-semibold text-[#7f8794]">{isMe ? 'You' : message.senderName}</span>
                      <div
                        className={`rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-[#5EFF6E] text-black'
                            : 'border border-[#1f1f1f] bg-[#111111] text-[#e7e7e7]'
                        }`}
                      >
                        {message.text}
                      </div>
                      <span className={`px-1 text-xs ${isMe ? 'text-[#5EFF6E]/80' : 'text-[#666666]'}`}>
                        {formatMessageTime(message.sentAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <footer className="border-t border-[#1f1f1f] p-4 sm:p-5">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-lg border border-[#1f1f1f] bg-[#111111] px-4 py-3 text-sm font-semibold text-white outline-none transition-colors placeholder:text-[#777777] focus:border-[#5EFF6E]"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#5EFF6E] text-black transition-colors hover:bg-[#4ee65d] disabled:cursor-not-allowed disabled:bg-[#333333] disabled:text-[#777777]"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}

function formatRelativeTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessageTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
