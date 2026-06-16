'use client';

import { useState, useEffect, useRef } from 'react';
import { useMessages } from '@/contexts/MessagesContext';
import { formatRelativeTime } from '@/lib/api/messages';

export default function MessagesPage() {
  const { conversations, activeConversationId, setActiveConversationId, unreadCount, isLoading, sendMessageToConversation, markConversationAsRead } = useMessages();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversationId, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversationId || isSending) return;

    try {
      setIsSending(true);
      await sendMessageToConversation(activeConversationId, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    markConversationAsRead(conversationId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <span className="spinner border-[#5EFF6E]"></span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">
      {/* Left Sidebar - Conversation List */}
      <div className="w-80 border-r border-[#1f1f1f] bg-[#111111] flex flex-col">
        <div className="p-6 border-b border-[#1f1f1f]">
          <h1 className="heading-display text-2xl text-white">Messages</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-[#5EFF6E] mt-2">{unreadCount} unread</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-[#1f1f1f] transition-colors ${
                  activeConversationId === conv.id
                    ? 'bg-[#1f1f1f]'
                    : 'hover:bg-[#0f1f0f]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#5EFF6E] flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#0a0a0a] mx-auto my-auto mt-0.5" />
                      </div>
                      <p className="font-medium text-white truncate">{conv.participant.name}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#5EFF6E] text-black text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{conv.participant.subtitle}</p>
                    <p className="text-xs text-gray-400 truncate">{conv.messages[conv.messages.length - 1]?.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 flex-shrink-0">{formatRelativeTime(conv.lastMessageTime)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Conversation Thread */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="border-b border-[#1f1f1f] px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1f1f1f] text-[#5EFF6E] font-medium flex items-center justify-center">
                  {activeConversation.participant.initials}
                </div>
                <div>
                  <p className="font-medium text-white">{activeConversation.participant.name}</p>
                  <p className="text-xs text-gray-500">{activeConversation.participant.subtitle}</p>
                </div>
                {activeConversation.participant.online && (
                  <div className="ml-auto w-2 h-2 bg-[#5EFF6E] rounded-full" />
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeConversation.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === 'me'
                        ? 'bg-[#5EFF6E] text-black'
                        : 'bg-[#1f1f1f] text-gray-100'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === 'me' ? 'text-black/60' : 'text-gray-500'}`}>
                      {new Date(msg.sentAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#1f1f1f] px-6 py-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1 bg-[#1f1f1f] border border-[#1f1f1f] text-white placeholder-gray-600 px-4 py-2 rounded-lg focus:outline-none focus:border-[#5EFF6E] disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !messageText.trim()}
                  className="bg-[#5EFF6E] text-black hover:bg-[#4ee65d] disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              <p className="text-lg font-medium text-white mb-2">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start messaging</p>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
