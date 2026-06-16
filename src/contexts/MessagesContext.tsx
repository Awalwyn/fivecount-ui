'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Conversation,
  getConversations,
  initiateCoachContact,
  sendCoachMessage,
  sendAthleteMessage,
} from '@/lib/api/messages';
import { useAuthContext } from './AuthContext';

interface MessagesContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  sendMessageToConversation: (conversationId: string, text: string) => Promise<void>;
  startCoachReachOut: (athleteId: string, athleteName: string, firstMessage: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { role, user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount and when role changes
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getConversations(role);
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load conversations';
        console.error('Failed to load conversations:', err);
        setError(errorMsg);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [role, user]);

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const sendMessageToConversation = async (conversationId: string, text: string) => {
    try {
      if (role === 'COACH') {
        await sendCoachMessage(conversationId, text);
      } else {
        await sendAthleteMessage(conversationId, text);
      }

      // Refresh conversation thread to get the new message
      const updatedConversations = await getConversations(role);
      setConversations(updatedConversations);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      console.error('Failed to send message:', err);
      throw new Error(errorMsg);
    }
  };

  const startCoachReachOut = async (
    athleteId: string,
    athleteName: string,
    firstMessage: string
  ) => {
    try {
      if (role !== 'COACH') {
        throw new Error('Only coaches can initiate contact');
      }

      await initiateCoachContact(athleteId, firstMessage);

      // Refresh conversations list
      const updatedConversations = await getConversations(role);
      setConversations(updatedConversations);
      if (updatedConversations.length > 0) {
        setActiveConversationId(updatedConversations[0].id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initiate contact';
      console.error('Failed to start reach-out conversation:', err);
      throw new Error(errorMsg);
    }
  };

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        activeConversationId,
        setActiveConversationId,
        unreadCount,
        isLoading,
        error,
        sendMessageToConversation,
        startCoachReachOut,
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
