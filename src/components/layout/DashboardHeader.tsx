'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

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
      <h1 className="heading-display text-2xl text-[#5EFF6E]">FiveCount</h1>
      <div className="flex items-center gap-6">
        <span className="text-gray-400 text-sm">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="btn-secondary text-sm px-4 py-2"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
