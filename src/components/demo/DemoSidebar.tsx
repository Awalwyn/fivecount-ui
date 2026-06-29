'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemo } from './DemoContext';
import {
  LayoutDashboard,
  User,
  Users,
  TrendingUp,
  MessageSquare,
  Zap,
} from 'lucide-react';

export function DemoSidebar() {
  const { role } = useDemo();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  const athleteLinks = [
    { href: '/demo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/demo/profile', label: 'Profile', icon: User },
    { href: '/demo/athletes', label: 'Athletes', icon: Users },
    { href: '/demo/feed', label: 'Feed', icon: TrendingUp },
    { href: '/demo/messages', label: 'Messages', icon: MessageSquare },
  ];

  const coachLinks = [
    { href: '/demo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/demo/athletes', label: 'Find Athletes', icon: Users },
    { href: '/demo/recruiting', label: 'Recruiting', icon: Zap },
    { href: '/demo/feed', label: 'Feed', icon: TrendingUp },
    { href: '/demo/messages', label: 'Messages', icon: MessageSquare },
    { href: '/demo/profile', label: 'Profile', icon: User },
  ];

  const links = role === 'COACH' ? coachLinks : athleteLinks;

  return (
    <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#1f1f1f] flex flex-col">
      <nav className="flex gap-2 overflow-x-auto px-4 py-3 md:flex-1 md:flex-col md:space-y-1 md:overflow-visible md:py-6">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-colors ${
              isActive(href)
                ? 'bg-[#1f1f1f] text-[#5EFF6E]'
                : 'text-[#a0a0a0] hover:text-[#ffffff] hover:bg-[#111111]'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
