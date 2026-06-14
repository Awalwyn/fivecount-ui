'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

type FABOption = 'post' | 'score' | 'video' | 'milestone';

interface FloatingActionButtonProps {
  onSelectOption: (option: FABOption) => void;
}

export function FloatingActionButton({ onSelectOption }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const options = [
    { 
      id: 'post' as FABOption, 
      label: 'Create Post', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-[#5EFF6E] text-[#0a0a0a]'
    },
    { 
      id: 'score' as FABOption, 
      label: 'Log Score', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-blue-500 text-white'
    },
    { 
      id: 'video' as FABOption, 
      label: 'Post Video', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-purple-500 text-white'
    },
    { 
      id: 'milestone' as FABOption, 
      label: 'Share Milestone', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'bg-amber-500 text-white'
    },
  ];

  const handleSelect = (option: FABOption) => {
    setIsOpen(false);
    onSelectOption(option);
  };

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed bottom-20 right-6 z-40">
      {/* Options Menu */}
      <div
        className={`absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-full ${option.color} shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap`}
            style={{ 
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              transform: isOpen ? 'translateX(0)' : 'translateX(20px)'
            }}
          >
            {option.icon}
            <span className="font-semibold text-sm">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-[#5EFF6E] text-[#0a0a0a] shadow-lg shadow-[#5EFF6E]/30 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:shadow-[#5EFF6E]/40 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>,
    document.body
  );
}
