'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Conversation,
  ChatMessage,
  getConversations,
} from '@/lib/api/messages';

interface MessagesContextType {
  conversations: Conversation[];
  totalUnread: number;
  /** Full-page selection */
  activeConversationId: string | null;
  selectConversation: (id: string | null) => void;
  /** Docked widget state */
  isDockExpanded: boolean;
  toggleDock: () => void;
  openWindowIds: string[];
  openDockWindow: (id: string) => void;
  closeDockWindow: (id: string) => void;
  /** Shared actions */
  sendMessage: (conversationId: string, text: string) => void;
  startConversation: (conversation: Conversation, opts?: { openInDock?: boolean }) => void;
  markRead: (conversationId: string) => void;
  getConversation: (id: string) => Conversation | undefined;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [openWindowIds, setOpenWindowIds] = useState<string[]>([]);

  // Seed (and reseed) conversations whenever the role changes (demo behavior).
  useEffect(() => {
    setConversations(getConversations(role));
    setActiveConversationId(null);
    setOpenWindowIds([]);
  }, [role]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  );

  const markRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conversationId,
      senderId: 'me',
      text: trimmed,
      sentAt: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, newMessage] } : c,
      ),
    );
  }, []);

  const selectConversation = useCallback(
    (id: string | null) => {
      setActiveConversationId(id);
      if (id) markRead(id);
    },
    [markRead],
  );

  const openDockWindow = useCallback(
    (id: string) => {
      setOpenWindowIds((prev) => {
        const next = prev.filter((w) => w !== id);
        // Cap to 3 open windows (LinkedIn-style), newest on the right.
        return [...next, id].slice(-3);
      });
      markRead(id);
    },
    [markRead],
  );

  const closeDockWindow = useCallback((id: string) => {
    setOpenWindowIds((prev) => prev.filter((w) => w !== id));
  }, []);

  const toggleDock = useCallback(() => setIsDockExpanded((open) => !open), []);

  const startConversation = useCallback(
    (conversation: Conversation, opts?: { openInDock?: boolean }) => {
      setConversations((prev) => {
        const exists = prev.some(
          (c) => c.participant.id === conversation.participant.id,
        );
        if (exists) return prev;
        return [conversation, ...prev];
      });
      // Resolve to an existing thread with the same participant if present.
      setConversations((prev) => {
        const match = prev.find((c) => c.participant.id === conversation.participant.id);
        const targetId = match?.id ?? conversation.id;
        if (opts?.openInDock) {
          setOpenWindowIds((w) => [...w.filter((x) => x !== targetId), targetId].slice(-3));
        } else {
          setActiveConversationId(targetId);
        }
        return prev;
      });
    },
    [],
  );

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        totalUnread,
        activeConversationId,
        selectConversation,
        isDockExpanded,
        toggleDock,
        openWindowIds,
        openDockWindow,
        closeDockWindow,
        sendMessage,
        startConversation,
        markRead,
        getConversation,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
}
