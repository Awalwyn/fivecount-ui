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
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col">
      <nav className="flex-1 space-y-1 px-4 py-6">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(href)
                ? 'bg-[#1f1f1f] text-[#5EFF6E]'
                : 'text-[#a0a0a0] hover:text-[#ffffff] hover:bg-[#111111]'
            }`}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
