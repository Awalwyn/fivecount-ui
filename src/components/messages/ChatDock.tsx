'use client';

import { usePathname } from 'next/navigation';
import { useMessages } from '@/contexts/MessagesContext';
import { ChatWindow } from './ChatWindow';
import { formatRelativeTime } from '@/lib/api/messages';

export function ChatDock() {
  const pathname = usePathname();
  const {
    conversations,
    totalUnread,
    isDockExpanded,
    toggleDock,
    openWindowIds,
    openDockWindow,
  } = useMessages();

  // Hide the dock on the full messages page to avoid redundancy.
  if (pathname === '/dashboard/messages') return null;

  return (
    <div className="fixed bottom-0 right-6 z-50 flex items-end gap-3 pointer-events-none">
      {/* Open mini chat windows (stack to the left of the dock) */}
      {openWindowIds.map((id) => (
        <div key={id} className="pointer-events-auto">
          <ChatWindow conversationId={id} />
        </div>
      ))}

      {/* Dock panel */}
      <div className="pointer-events-auto w-72 bg-[#111111] border border-[#1f1f1f] border-b-0 rounded-t-xl shadow-2xl">
        <button
          onClick={toggleDock}
          className="w-full flex items-center justify-between gap-2 px-4 py-3"
          aria-expanded={isDockExpanded}
        >
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-sm font-semibold">
              AJ
            </span>
            <span className="text-sm font-semibold text-white">Messaging</span>
            {totalUnread > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#5EFF6E] text-black text-[10px] font-bold flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </span>
          <span className="text-gray-400 text-sm">{isDockExpanded ? '▾' : '▴'}</span>
        </button>

        {isDockExpanded && (
          <div className="max-h-96 overflow-y-auto border-t border-[#1f1f1f]">
            {conversations.length === 0 ? (
              <p className="text-gray-600 text-xs text-center p-6">No conversations yet</p>
            ) : (
              conversations.map((conv) => {
                const last = conv.messages[conv.messages.length - 1];
                return (
                  <button
                    key={conv.id}
                    onClick={() => openDockWindow(conv.id)}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#161616] transition-colors"
                  >
                    <span className="relative flex-shrink-0">
                      <span className="w-9 h-9 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-xs font-semibold">
                        {conv.participant.initials}
                      </span>
                      {conv.participant.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#5EFF6E] border-2 border-[#111111]" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {conv.participant.name}
                        </span>
                        <span className="text-[10px] text-gray-600 flex-shrink-0">
                          {last ? formatRelativeTime(last.sentAt) : ''}
                        </span>
                      </span>
                      <span className={`block text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                        {last?.senderId === 'me' ? 'You: ' : ''}
                        {last?.text}
                      </span>
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#5EFF6E]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
