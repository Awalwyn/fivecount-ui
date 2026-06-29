'use client';

import Link from 'next/link';
import { DemoRoleToggle } from './DemoRoleToggle';

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#1f1f1f] px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/demo/dashboard" className="font-display text-xl tracking-[2px] text-[#5EFF6E]">
            FIVECOUNT
          </Link>
          <span className="text-xs px-2 py-1 rounded bg-[#1f1f1f] text-[#a0a0a0]">DEMO</span>
        </div>
        <DemoRoleToggle />
      </div>
    </header>
  );
}
