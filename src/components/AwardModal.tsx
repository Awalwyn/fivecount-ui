'use client';

import { useState } from 'react';
import { Award, createAward, updateAward } from '@/lib/api/awards';

interface AwardModalProps {
  isOpen: boolean;
  athleteId: string;
  award?: Award | null;
  onClose: () => void;
  onSuccess: (award: Award) => void;
}

export function AwardModal({ isOpen, athleteId, award, onClose, onSuccess }: AwardModalProps) {
  const [title, setTitle] = useState(award?.title || '');
  const [year, setYear] = useState(award?.year || new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Award title is required');
      return;
    }

    try {
      setLoading(true);
      let result: Award;

      if (award?.id) {
        result = await updateAward(athleteId, award.id, { title, year });
      } else {
        result = await createAward(athleteId, { title, year });
      }

      onSuccess(result);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save award');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle(award?.title || '');
    setYear(award?.year || new Date().getFullYear());
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="heading-display text-2xl text-white mb-6">
          {award?.id ? 'Edit Award' : 'Add Award'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-950/20 border border-red-700/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label block mb-2">Award Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., State Champion - Floor"
              className="input-field w-full"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="input-label block mb-2">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min={2000}
              max={new Date().getFullYear()}
              className="input-field w-full"
              disabled={loading}
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Award'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
