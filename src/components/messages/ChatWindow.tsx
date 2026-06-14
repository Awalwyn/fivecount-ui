'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/contexts/MessagesContext';
import { formatRelativeTime } from '@/lib/api/messages';

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const { getConversation, sendMessage, closeDockWindow } = useMessages();
  const [draft, setDraft] = useState('');
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conv = getConversation(conversationId);

  useEffect(() => {
    if (scrollRef.current && !minimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conv?.messages.length, minimized]);

  if (!conv) return null;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(conversationId, draft);
    setDraft('');
  }

  return (
    <div className="w-72 bg-[#111111] border border-[#1f1f1f] rounded-t-xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[#1f1f1f] bg-[#161616]">
        <button
          onClick={() => setMinimized((m) => !m)}
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
        >
          <span className="relative flex-shrink-0">
            <span className="w-8 h-8 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-xs font-semibold">
              {conv.participant.initials}
            </span>
            {conv.participant.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#5EFF6E] border-2 border-[#161616]" />
            )}
          </span>
          <span className="text-sm font-medium text-white truncate">{conv.participant.name}</span>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setMinimized((m) => !m)}
            className="w-7 h-7 rounded-md text-gray-400 hover:text-white hover:bg-[#1f1f1f] flex items-center justify-center"
            aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
          >
            {minimized ? '▴' : '▾'}
          </button>
          <button
            onClick={() => closeDockWindow(conversationId)}
            className="w-7 h-7 rounded-md text-gray-400 hover:text-white hover:bg-[#1f1f1f] flex items-center justify-center"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div ref={scrollRef} className="h-72 overflow-y-auto p-3 space-y-2">
            {conv.messages.map((msg) => {
              const mine = msg.senderId === 'me';
              return (
                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-xs ${
                      mine
                        ? 'bg-[#5EFF6E] text-black rounded-br-sm'
                        : 'bg-[#1f1f1f] text-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                    <span className={`block text-[9px] mt-0.5 ${mine ? 'text-black/50' : 'text-gray-500'}`}>
                      {formatRelativeTime(msg.sentAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="p-2 border-t border-[#1f1f1f] flex items-center gap-1.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-full px-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5EFF6E]"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="bg-[#5EFF6E] text-black font-medium px-3 py-1.5 rounded-full text-xs disabled:opacity-40 hover:bg-[#4ee65d] transition-colors"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
