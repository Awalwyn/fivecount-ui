'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Profile Card */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E]/50 transition-colors">
          <h2 className="text-body-bold text-lg mb-2 text-white">Your Profile</h2>
          <p className="text-gray-400 text-sm mb-4">
            Create or edit your athlete profile to get discovered by coaches.
          </p>
          <a
            href="/dashboard/profile"
            className="text-[#5EFF6E] text-sm font-semibold hover:underline"
          >
            Edit Profile →
          </a>
        </div>

        {/* Competition Results Card */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E]/50 transition-colors">
          <h2 className="text-body-bold text-lg mb-2 text-white">Competition Results</h2>
          <p className="text-gray-400 text-sm mb-4">
            Track your competition scores and watch your stats grow.
          </p>
          <a
            href="/dashboard/competitions"
            className="text-[#5EFF6E] text-sm font-semibold hover:underline"
          >
            View Results →
          </a>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 mt-8">
        <h2 className="text-body-bold text-lg mb-4 text-white">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#5EFF6E]">0</div>
            <p className="text-gray-400 text-sm">Competitions</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#5EFF6E]">0.0</div>
            <p className="text-gray-400 text-sm">Avg Score</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#5EFF6E]">0.0</div>
            <p className="text-gray-400 text-sm">Best Score</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#5EFF6E]">0</div>
            <p className="text-gray-400 text-sm">Events</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-4">
          Complete your profile and add competition results to see your stats here.
        </p>
      </div>
    </div>
  );
}
