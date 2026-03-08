'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AthletesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Public Navigation Header */}
      <header className="border-b border-[#1f1f1f] bg-[#111111] sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <h1 className="heading-display text-2xl text-[#5EFF6E]">FiveCount</h1>
          </Link>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={() => router.push('/dashboard/dashboard')}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm px-4 py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
