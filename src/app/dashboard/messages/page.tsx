'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/contexts/MessagesContext';
import { formatRelativeTime } from '@/lib/api/messages';

export default function MessagesPage() {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    sendMessage,
    getConversation,
  } = useMessages();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = activeConversationId ? getConversation(activeConversationId) : undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages.length, activeConversationId]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    sendMessage(active.id, draft);
    setDraft('');
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="heading-display text-3xl text-white mb-1">Messages</h1>
      <p className="text-gray-400 text-sm mb-6">Your recruiting conversations</p>

      <div className="flex h-[calc(100vh-220px)] min-h-[480px] bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
        {/* Conversation list */}
        <div
          className={`w-full md:w-80 flex-shrink-0 border-r border-[#1f1f1f] flex flex-col ${
            active ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-[#1f1f1f]">
            <input
              type="text"
              placeholder="Search messages"
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5EFF6E]"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-gray-600 text-sm text-center p-6">No conversations yet</p>
            ) : (
              conversations.map((conv) => {
                const last = conv.messages[conv.messages.length - 1];
                const isActive = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-[#1a1a1a] transition-colors ${
                      isActive ? 'bg-[#1a1a1a]' : 'hover:bg-[#161616]'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <span className="w-11 h-11 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-sm font-semibold">
                        {conv.participant.initials}
                      </span>
                      {conv.participant.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#5EFF6E] border-2 border-[#111111]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white truncate">
                          {conv.participant.name}
                        </p>
                        <span className="text-xs text-gray-600 flex-shrink-0">
                          {last ? formatRelativeTime(last.sentAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                          {last?.senderId === 'me' ? 'You: ' : ''}
                          {last?.text}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5EFF6E] text-black text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread view */}
        <div className={`flex-1 flex-col ${active ? 'flex' : 'hidden md:flex'}`}>
          {active ? (
            <>
              <div className="px-4 py-3 border-b border-[#1f1f1f] flex items-center gap-3">
                <button
                  onClick={() => selectConversation(null)}
                  className="md:hidden text-gray-400 hover:text-white"
                  aria-label="Back to conversations"
                >
                  ←
                </button>
                <span className="w-9 h-9 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-sm font-semibold">
                  {active.participant.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{active.participant.name}</p>
                  <p className="text-xs text-gray-500">{active.participant.subtitle}</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {active.messages.map((msg) => {
                  const mine = msg.senderId === 'me';
                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[70%]">
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm ${
                            mine
                              ? 'bg-[#5EFF6E] text-black rounded-br-sm'
                              : 'bg-[#1f1f1f] text-gray-100 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <p className={`text-[10px] text-gray-600 mt-1 ${mine ? 'text-right' : 'text-left'}`}>
                          {formatRelativeTime(msg.sentAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-[#1f1f1f] flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-full px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5EFF6E]"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="bg-[#5EFF6E] text-black font-medium px-5 py-2 rounded-full text-sm disabled:opacity-40 hover:bg-[#4ee65d] transition-colors"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 font-medium">Select a conversation</p>
                <p className="text-gray-600 text-sm mt-1">Choose a thread to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
