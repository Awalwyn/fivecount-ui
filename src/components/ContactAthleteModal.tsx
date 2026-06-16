'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMessages } from '@/contexts/MessagesContext';
import { createReachOutConversation } from '@/lib/api/messages';

interface ContactAthleteModalProps {
  isOpen: boolean;
  athleteId: string;
  athleteName: string;
  onClose: () => void;
}

export function ContactAthleteModal({
  isOpen,
  athleteId,
  athleteName,
  onClose,
}: ContactAthleteModalProps) {
  const router = useRouter();
  const { startConversation } = useMessages();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage(null);

    try {
      const initials = athleteName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

      const conversation = createReachOutConversation(
        { id: athleteId, name: athleteName, subtitle: '', initials },
        message
      );

      startConversation(conversation);

      setStatus('success');
      setMessage('');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        router.push('/dashboard/messages');
      }, 2000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      if (error.message.includes('409') || error.message.includes('already')) {
        setStatus('duplicate');
      } else {
        setStatus('error');
        setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setStatus('idle');
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="heading-display text-2xl text-white mb-6">
          Contact {athleteName}
        </h2>

        {status === 'success' ? (
          <div className="text-center py-8">
            <p className="text-[#5EFF6E] text-lg font-semibold">Request sent!</p>
            <p className="text-gray-400 text-sm mt-2">
              {athleteName} will review your message shortly.
            </p>
          </div>
        ) : status === 'duplicate' ? (
          <div className="text-center py-8">
            <p className="text-yellow-400 text-lg font-semibold">
              Already contacted
            </p>
            <p className="text-gray-400 text-sm mt-2">
              You've already sent a contact request to {athleteName}.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full bg-[#1f1f1f] text-white hover:bg-[#2a2a2a] px-4 py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label block mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell them why you're interested in coaching this athlete..."
                disabled={loading}
                required
                rows={5}
                className="input-field w-full px-4 py-3 rounded-lg resize-none disabled:opacity-50"
              />
              <p className="text-gray-500 text-xs mt-1">
                {message.length} / 500 characters
              </p>
            </div>

            {status === 'error' && (
              <div className="p-3 bg-red-950/20 border border-red-700/30 rounded-lg">
                <p className="text-red-400 text-sm">
                  {errorMessage || 'Failed to send request'}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
