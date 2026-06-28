'use client';

import { DemoHeader } from './DemoHeader';
import { DemoSidebar } from './DemoSidebar';

export function DemoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <DemoSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
