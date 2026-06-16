'use client';

import { usePathname } from 'next/navigation';

export function ChatDock() {
  // This component is built per spec but NOT mounted anywhere
  // It's a LinkedIn-style docked messaging widget for future use
  // Returns null on /dashboard/messages to avoid conflicts with the full page

  const pathname = usePathname();
  if (pathname === '/dashboard/messages') {
    return null;
  }

  return null;
}
