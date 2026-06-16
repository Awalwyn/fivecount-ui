'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, ChatMessage, getConversations, createReachOutConversation, sendMessage } from '@/lib/api/messages';
import { useAuthContext } from './AuthContext';

interface MessagesContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  unreadCount: number;
  isLoading: boolean;
  sendMessageToConversation: (conversationId: string, text: string) => Promise<void>;
  startReachOutConversation: (athleteId: string, athleteName: string, firstMessage: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { role, user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const data = await getConversations(role);
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [role]);

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const sendMessageToConversation = async (conversationId: string, text: string) => {
    try {
      const message = await sendMessage(conversationId, text);

      // Update local state with new message
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, message],
              lastMessageTime: new Date().toISOString(),
            };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const startReachOutConversation = async (
    athleteId: string,
    athleteName: string,
    firstMessage: string
  ) => {
    try {
      const newConversation = await createReachOutConversation(athleteId, athleteName, firstMessage);

      // Add new conversation to the list (at the top)
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
    } catch (error) {
      console.error('Failed to start reach-out conversation:', error);
      throw error;
    }
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      })
    );
  };

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        activeConversationId,
        setActiveConversationId,
        unreadCount,
        isLoading,
        sendMessageToConversation,
        startReachOutConversation,
        markConversationAsRead,
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
