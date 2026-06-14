'use client';

import { ReactNode } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { MessagesProvider } from '@/contexts/MessagesContext';
import { ChatDock } from '@/components/messages/ChatDock';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <MessagesProvider>
      <div className="flex min-h-screen bg-[#0a0a0a]">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
        <ChatDock />
      </div>
    </MessagesProvider>
  );
}
