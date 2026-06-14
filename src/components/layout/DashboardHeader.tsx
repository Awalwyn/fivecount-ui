'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const { user, signOut, isDemoMode, role, setDemoRole } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.user_metadata?.firstName
    ? `${user.user_metadata.firstName} ${user.user_metadata.lastName}`
    : user?.email;

  const initials = user?.user_metadata?.firstName
    ? `${user.user_metadata.firstName[0]}${user.user_metadata.lastName?.[0] ?? ''}`
    : (user?.email?.[0]?.toUpperCase() ?? '?');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <header className="border-b border-[#1f1f1f] px-6 py-4 flex justify-between items-center bg-[#111111]">
      <div className="flex items-center gap-3">
        <h1 className="heading-display text-2xl text-[#5EFF6E]">FiveCount</h1>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1f1f1f] text-gray-400 uppercase tracking-wide">
          {role === 'COACH' ? 'Coach' : 'Athlete'}
        </span>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[#1f1f1f] transition-colors"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="text-gray-300 text-sm hidden sm:block">{displayName}</span>
          <span className="w-9 h-9 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-sm font-semibold">
            {initials}
          </span>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-60 bg-[#111111] border border-[#1f1f1f] rounded-xl shadow-xl py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-[#1f1f1f]">
              <p className="text-sm text-white font-medium truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>

            {isDemoMode && (
              <div className="px-4 py-3 border-b border-[#1f1f1f]">
                <p className="text-xs text-gray-500 mb-2">Viewing as (demo)</p>
                <div className="flex gap-1 bg-[#0a0a0a] rounded-lg p-1">
                  <button
                    onClick={() => setDemoRole('ATHLETE')}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                      role === 'ATHLETE'
                        ? 'bg-[#5EFF6E] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Athlete
                  </button>
                  <button
                    onClick={() => setDemoRole('COACH')}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                      role === 'COACH'
                        ? 'bg-[#5EFF6E] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Coach
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              role="menuitem"
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1f1f1f] transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
