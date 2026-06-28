'use client';

import { useDemo } from './DemoContext';

export function DemoRoleToggle() {
  const { role, setRole } = useDemo();

  return (
    <div className="flex gap-1 bg-[#1f1f1f] rounded-full p-1 border border-[#2f2f2f]">
      <button
        onClick={() => setRole('ATHLETE')}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
          role === 'ATHLETE'
            ? 'bg-[#5EFF6E] text-[#0a0a0a]'
            : 'text-[#a0a0a0] hover:text-[#ffffff]'
        }`}
      >
        ATHLETE
      </button>
      <button
        onClick={() => setRole('COACH')}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
          role === 'COACH'
            ? 'bg-[#5EFF6E] text-[#0a0a0a]'
            : 'text-[#a0a0a0] hover:text-[#ffffff]'
        }`}
      >
        COACH
      </button>
    </div>
  );
}
