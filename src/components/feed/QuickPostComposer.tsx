'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface QuickPostComposerProps {
  onOpenFullComposer: (tab?: 'text' | 'meet' | 'photo' | 'video') => void;
}

export function QuickPostComposer({ onOpenFullComposer }: QuickPostComposerProps) {
  const { user } = useAuth();
  
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'A';

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.firstName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onOpenFullComposer('text')}
            className="w-full text-left bg-[#0a0a0a] hover:bg-[#161616] border border-[#1f1f1f] rounded-xl px-4 py-3 text-gray-500 text-sm transition-colors"
          >
            What&apos;s happening in your gymnastics journey?
          </button>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1 mt-3">
            <button
              onClick={() => onOpenFullComposer('video')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-[#1f1f1f] hover:text-[#5EFF6E] transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Video</span>
            </button>
            <button
              onClick={() => onOpenFullComposer('photo')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-[#1f1f1f] hover:text-[#5EFF6E] transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Photo</span>
            </button>
            <button
              onClick={() => onOpenFullComposer('meet')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-[#1f1f1f] hover:text-[#5EFF6E] transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Score</span>
            </button>
            <div className="flex-1" />
            <button
              onClick={() => onOpenFullComposer('text')}
              className="btn-primary px-4 py-1.5 text-sm"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
