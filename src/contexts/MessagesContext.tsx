'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Conversation, ChatMessage, getConversations } from '@/lib/api/messages';

interface MessagesContextType {
  conversations: Conversation[];
  totalUnread: number;
  activeConversationId: string | null;
  selectConversation: (id: string | null) => void;
  isDockExpanded: boolean;
  toggleDock: () => void;
  openWindowIds: string[];
  openDockWindow: (id: string) => void;
  closeDockWindow: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  startConversation: (conversation: Conversation, opts?: { openInDock?: boolean }) => void;
  markRead: (conversationId: string) => void;
  getConversation: (id: string) => Conversation | undefined;
  isLoading: boolean;
  error: string | null;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [openWindowIds, setOpenWindowIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount and role change
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getConversations(role);
        setConversations(data);
        setActiveConversationId(null);
        setOpenWindowIds([]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load conversations';
        const expectedEmptyState =
          msg.toLowerCase().includes('coach not found') ||
          msg.toLowerCase().includes('coach profile not found');
        if (!expectedEmptyState) {
          console.error('Failed to load conversations:', err);
        }
        setError(expectedEmptyState ? null : msg);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [role]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const getConversation = useCallback(
    (id: string) => conversations.find(c => c.id === id),
    [conversations]
  );

  const markRead = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conversationId,
      senderId: 'me',
      senderName: 'You',
      text: trimmed,
      sentAt: new Date().toISOString(),
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMessage], lastMessageTime: new Date().toISOString() }
          : c
      )
    );
  }, []);

  const selectConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
    if (id) markRead(id);
  }, [markRead]);

  const openDockWindow = useCallback((id: string) => {
    setOpenWindowIds(prev => [...prev.filter(w => w !== id), id].slice(-3));
    markRead(id);
  }, [markRead]);

  const closeDockWindow = useCallback((id: string) => {
    setOpenWindowIds(prev => prev.filter(w => w !== id));
  }, []);

  const toggleDock = useCallback(() => {
    setIsDockExpanded(open => !open);
  }, []);

  const startConversation = useCallback(
    (conversation: Conversation, opts?: { openInDock?: boolean }) => {
      setConversations(prev => {
        const exists = prev.some(c => c.id === conversation.id);
        return exists ? prev : [conversation, ...prev];
      });

      const targetId = conversation.id;
      if (opts?.openInDock) {
        setOpenWindowIds(prev => [...prev.filter(x => x !== targetId), targetId].slice(-3));
      } else {
        setActiveConversationId(targetId);
      }
      markRead(targetId);
    },
    [markRead]
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
        isLoading,
        error,
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
