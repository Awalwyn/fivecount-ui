'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MilestoneType } from './FeedPostCard';

interface MilestoneComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestone: {
    type: MilestoneType;
    title: string;
    school?: string;
    subtitle?: string;
    content?: string;
  }) => void;
}

export function MilestoneComposerModal({ isOpen, onClose, onSubmit }: MilestoneComposerModalProps) {
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('COMMITMENT');
  const [school, setSchool] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMilestoneType('COMMITMENT');
      setSchool('');
      setAwardTitle('');
      setContent('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const title = milestoneType === 'AWARD' 
      ? awardTitle 
      : milestoneType === 'COMMITMENT'
        ? `Committed to ${school}!`
        : `Received an offer from ${school}!`;

    onSubmit({
      type: milestoneType,
      title,
      school: milestoneType !== 'AWARD' ? school : undefined,
      content,
    });

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const milestoneOptions = [
    { 
      type: 'COMMITMENT' as MilestoneType, 
      label: 'Commitment', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      color: 'border-[#5EFF6E] bg-[#5EFF6E]/10 text-[#5EFF6E]',
      activeColor: 'border-[#5EFF6E] bg-[#5EFF6E] text-[#0a0a0a]',
    },
    { 
      type: 'OFFER' as MilestoneType, 
      label: 'Offer', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'border-blue-500 bg-blue-500/10 text-blue-500',
      activeColor: 'border-blue-500 bg-blue-500 text-white',
    },
    { 
      type: 'AWARD' as MilestoneType, 
      label: 'Award', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      color: 'border-amber-500 bg-amber-500/10 text-amber-500',
      activeColor: 'border-amber-500 bg-amber-500 text-white',
    },
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-display text-2xl text-white">Share a Milestone</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Milestone Type Selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {milestoneOptions.map(option => (
            <button
              key={option.type}
              onClick={() => setMilestoneType(option.type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                milestoneType === option.type ? option.activeColor : option.color
              }`}
            >
              {option.icon}
              <span className="text-sm font-semibold">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {milestoneType !== 'AWARD' ? (
            <div>
              <label className="input-label">School / University</label>
              <input
                type="text"
                value={school}
                onChange={e => setSchool(e.target.value)}
                placeholder="e.g., UCLA, Stanford, Michigan"
                className="input-field"
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div>
              <label className="input-label">Award Title</label>
              <input
                type="text"
                value={awardTitle}
                onChange={e => setAwardTitle(e.target.value)}
                placeholder="e.g., All-State, All-American, Regional Champion"
                className="input-field"
                disabled={isSubmitting}
              />
            </div>
          )}

          <div>
            <label className="input-label">Add a Message (optional)</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your excitement..."
              className="input-field resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <label className="input-label">Preview</label>
          <div className={`rounded-xl p-4 border-2 ${
            milestoneType === 'COMMITMENT' 
              ? 'bg-gradient-to-br from-[#5EFF6E]/20 via-[#111111] to-[#111111] border-[#5EFF6E]/40'
              : milestoneType === 'OFFER'
                ? 'bg-gradient-to-br from-blue-500/20 via-[#111111] to-[#111111] border-blue-500/40'
                : 'bg-gradient-to-br from-amber-500/20 via-[#111111] to-[#111111] border-amber-500/40'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {milestoneOptions.find(o => o.type === milestoneType)?.icon}
              <span className={`text-xs font-bold uppercase tracking-wide ${
                milestoneType === 'COMMITMENT' ? 'text-[#5EFF6E]' 
                  : milestoneType === 'OFFER' ? 'text-blue-400' 
                    : 'text-amber-400'
              }`}>
                {milestoneType === 'COMMITMENT' ? 'Committed' : milestoneType === 'OFFER' ? 'Offer Received' : 'Award'}
              </span>
            </div>
            <p className="text-white font-bold">
              {milestoneType === 'AWARD' 
                ? awardTitle || 'Your Award'
                : milestoneType === 'COMMITMENT'
                  ? school ? `Committed to ${school}!` : 'Committed to [School]!'
                  : school ? `Received an offer from ${school}!` : 'Received an offer from [School]!'
              }
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (milestoneType !== 'AWARD' ? !school.trim() : !awardTitle.trim())}
            className="btn-primary flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner border-[#0a0a0a]"></span>
                Posting...
              </span>
            ) : (
              'Share Milestone'
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
