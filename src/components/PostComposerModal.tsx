'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createPost, Post } from '@/lib/api/posts';
import { CompetitionResult } from '@/lib/api/competitions';

type PostTab = 'text' | 'meet' | 'photo' | 'video';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (post: Post) => void;
  athleteResults: CompetitionResult[];
  prefilledMeetKey?: string;
  prefilledTab?: PostTab;
}

export function PostComposerModal({
  isOpen,
  onClose,
  onSuccess,
  athleteResults,
  prefilledMeetKey,
  prefilledTab = 'text',
}: PostComposerModalProps) {
  const [activeTab, setActiveTab] = useState<PostTab>(prefilledTab);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedMeetKey, setSelectedMeetKey] = useState<string | null>(prefilledMeetKey ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setContent('');
    setImageUrl('');
    setVideoUrl('');
    setSelectedMeetKey(prefilledMeetKey ?? null);
    setActiveTab(prefilledTab);
    setError(null);
  }, [isOpen, prefilledMeetKey, prefilledTab]);

  // Get unique meets sorted by date descending
  const getMeets = () => {
    const meetMap = new Map<string, CompetitionResult>();
    athleteResults.forEach(r => {
      const key = `${r.meetName}|${r.meetDate}`;
      if (!meetMap.has(key)) {
        meetMap.set(key, r);
      }
    });
    return Array.from(meetMap.values()).sort(
      (a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()
    );
  };

  const getMeetPreviewResults = () => {
    if (!selectedMeetKey) return [];
    const [meetName, meetDate] = selectedMeetKey.split('|');
    return athleteResults.filter(r => r.meetName === meetName && r.meetDate === meetDate);
  };

  async function handleSubmit() {
    try {
      setError(null);

      // Validation
      if (activeTab === 'text' && !content.trim()) {
        setError('Please enter some text');
        return;
      }
      if (activeTab === 'photo' && !imageUrl.trim()) {
        setError('Please enter an image URL');
        return;
      }
      if (activeTab === 'video' && !videoUrl.trim()) {
        setError('Please enter a video URL');
        return;
      }
      if (activeTab === 'meet' && !selectedMeetKey) {
        setError('Please select a meet');
        return;
      }

      setIsSubmitting(true);

      const postData = {
        content: activeTab === 'text' ? content : activeTab === 'meet' ? content : undefined,
        imageUrl: activeTab === 'photo' ? imageUrl : undefined,
        videoUrl: activeTab === 'video' ? videoUrl : undefined,
        postType: activeTab === 'meet' ? ('SCORE_TILE' as const) : ('REGULAR' as const),
        meetReference: activeTab === 'meet' ? (selectedMeetKey || undefined) : undefined,
      };

      const result = await createPost(postData);
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const meets = getMeets();
  const meetPreviewResults = getMeetPreviewResults();

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-display text-2xl text-white">New Post</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && <div className="error-message mb-4">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#1f1f1f]">
          {['text', 'meet', 'photo', 'video'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as PostTab)}
              disabled={isSubmitting}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'text-[#5EFF6E] border-b-2 border-[#5EFF6E] -mb-0.5'
                  : 'text-gray-400 hover:text-white'
              } disabled:opacity-50`}
            >
              {tab === 'text' ? 'Text' : tab === 'meet' ? 'Meet Card' : tab === 'photo' ? 'Photo' : 'Video'}
            </button>
          ))}
        </div>

        {/* Text Tab */}
        {activeTab === 'text' && (
          <div className="space-y-4 mb-6">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="input-field resize-none"
              rows={6}
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Meet Card Tab */}
        {activeTab === 'meet' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="input-label">Select a Meet</label>
              <select
                value={selectedMeetKey ?? ''}
                onChange={e => setSelectedMeetKey(e.target.value || null)}
                className="input-field"
                disabled={isSubmitting || meets.length === 0}
              >
                <option value="">Choose a meet...</option>
                {meets.map(meet => {
                  const key = `${meet.meetName}|${meet.meetDate}`;
                  return (
                    <option key={key} value={key}>
                      {meet.meetName} • {new Date(meet.meetDate).toLocaleDateString()}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Meet Preview */}
            {selectedMeetKey && meetPreviewResults.length > 0 && (
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
                <p className="text-white text-sm font-semibold mb-3">Preview</p>
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  {(['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'] as any[]).map(et => {
                    const result = meetPreviewResults.find(r => r.eventType === et);
                    return (
                      <div key={et}>
                        <p className="text-gray-500">{et.split('_')[0].slice(0, 2)}</p>
                        <p className="text-[#5EFF6E] font-semibold">
                          {result ? result.score.toFixed(2) : '—'}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {meetPreviewResults.find(r => r.eventType === 'ALL_AROUND') && (
                  <p className="text-[#5EFF6E] text-xs font-bold">
                    AA: {meetPreviewResults.find(r => r.eventType === 'ALL_AROUND')!.score.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="input-label">Add a Caption (optional)</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts about this meet..."
                className="input-field resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Photo Tab */}
        {activeTab === 'photo' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="input-label">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="input-field"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="input-label">Caption (optional)</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Add a caption..."
                className="input-field resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="input-label">Video URL</label>
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="input-field"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="input-label">Caption (optional)</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Add a caption..."
                className="input-field resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner border-[#0a0a0a]"></span>
                Posting...
              </span>
            ) : (
              'Post'
            )}
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
