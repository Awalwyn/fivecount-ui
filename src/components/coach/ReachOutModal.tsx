'use client';

import { useState, useEffect } from 'react';
import { useMessages } from '@/contexts/MessagesContext';
import { createReachOutConversation } from '@/lib/api/messages';

interface ReachOutAthlete {
  id: string;
  name: string;
  subtitle: string;
  initials: string;
}

interface ReachOutModalProps {
  open: boolean;
  onClose: () => void;
  athlete: ReachOutAthlete;
}

export function ReachOutModal({ open, onClose, athlete }: ReachOutModalProps) {
  const { startConversation } = useMessages();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const firstName = athlete.name.split(' ')[0];

  useEffect(() => {
    if (open) {
      setMessage(
        `Hi ${firstName}, I'm Coach Alex with the Stanford program. We've been following your season and we're really impressed with your all-around progression. We'd love to learn more about your recruiting timeline.`,
      );
      setSent(false);
    }
  }, [open, firstName]);

  if (!open) return null;

  function handleSend() {
    const conv = createReachOutConversation(
      { id: athlete.id, name: athlete.name, subtitle: athlete.subtitle, initials: athlete.initials },
      message,
    );
    startConversation(conv, { openInDock: true });
    setSent(true);
    setTimeout(() => onClose(), 900);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#111111] border border-[#1f1f1f] rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-white font-semibold text-lg">Reach out to {firstName}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md text-gray-400 hover:text-white hover:bg-[#1f1f1f] flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-12 h-12 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-base font-semibold">
              {athlete.initials}
            </span>
            <div>
              <p className="text-white font-medium">{athlete.name}</p>
              <p className="text-gray-500 text-sm">{athlete.subtitle}</p>
            </div>
          </div>

          {sent ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#5EFF6E] text-black flex items-center justify-center text-xl font-bold mx-auto mb-3">
                ✓
              </div>
              <p className="text-white font-medium">Message sent</p>
              <p className="text-gray-500 text-sm">Your conversation is now open in the chat dock.</p>
            </div>
          ) : (
            <>
              <label className="block text-xs text-gray-500 mb-2">Your message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5EFF6E] resize-none"
              />
              <p className="text-xs text-gray-600 mt-2">
                This starts a direct conversation. {firstName} will be notified and can reply from their inbox.
              </p>

              <div className="flex items-center justify-end gap-3 mt-5">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1f1f1f] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="bg-[#5EFF6E] text-black font-medium px-5 py-2 rounded-lg text-sm disabled:opacity-40 hover:bg-[#4ee65d] transition-colors"
                >
                  Send message
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
