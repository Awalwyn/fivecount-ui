'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FEATURES } from '@/lib/features';
import { SponsorBanner } from '@/components/SponsorBanner';

interface NavLink {
  href: string;
  label: string;
  show: boolean;
}

export function DashboardSidebar() {
  const pathname = usePathname();

  const navLinks: NavLink[] = [
    { href: '/dashboard/dashboard', label: 'Dashboard', show: true },
    { href: '/dashboard/profile', label: 'Profile', show: true },
    { href: '/dashboard/competitions', label: 'Results', show: true },
    { href: '/athletes', label: 'Athletes', show: FEATURES.SEARCH },
  ];

  return (
    <aside className="w-64 border-r border-[#1f1f1f] bg-[#0a0a0a] flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {navLinks.map((link) =>
          link.show ? (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                pathname === link.href
                  ? 'bg-[#5EFF6E] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#111111]'
              }`}
            >
              {link.label}
            </Link>
          ) : null
        )}
      </nav>

      {/* Sponsor Banner */}
      <SponsorBanner />

      {/* Footer */}
      <div className="border-t border-[#1f1f1f] p-6">
        <p className="text-xs text-gray-600">© 2026 FiveCount</p>
      </div>
    </aside>
  );
}
