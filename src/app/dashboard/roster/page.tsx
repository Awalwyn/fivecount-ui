'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRoster, getCoachStats, getTeamStats } from '@/lib/api/recruiting';
import Link from 'next/link';

interface RosterAthlete {
  id?: string;
  firstName: string;
  lastName: string;
  gradYear: number;
  recruitingStatus: string;
  topEvents?: Array<{ event: string; averageScore: number }>;
}

export default function RosterPage() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<RosterAthlete[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    async function loadRoster() {
      try {
        setIsLoading(true);
        setError(null);

        const [rosterData, statsData] = await Promise.all([
          getRoster(50).then((res) => res.data || []),
          getCoachStats(),
        ]);

        setAthletes(rosterData as any);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load roster');
      } finally {
        setIsLoading(false);
      }
    }

    loadRoster();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-700/30 rounded-lg p-6 text-red-400">
        {error}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERBALLY_COMMITTED':
        return 'bg-blue-900/20 text-blue-400 border-blue-700/30';
      case 'SIGNED':
        return 'bg-purple-900/20 text-purple-400 border-purple-700/30';
      case 'NOT_RECRUITING':
        return 'bg-gray-900/20 text-gray-400 border-gray-700/30';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-700/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VERBALLY_COMMITTED':
        return 'Verbally Committed';
      case 'SIGNED':
        return 'Signed';
      case 'NOT_RECRUITING':
        return 'Not Recruiting';
      default:
        return status;
    }
  };

  const getTopEvent = (athlete: RosterAthlete) => {
    if (!athlete.topEvents || athlete.topEvents.length === 0) return null;
    const sorted = [...athlete.topEvents].sort((a, b) => b.averageScore - a.averageScore);
    return sorted[0];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Committed Roster</h1>
        <p className="text-gray-400">Your {athletes.length} committed athletes</p>
      </div>

      {/* Table */}
      <div className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2f2f2f]">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Athlete</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Class</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Top Event</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">All-Around</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map((athlete, idx) => {
                const topEvent = getTopEvent(athlete);
                return (
                  <tr
                    key={idx}
                    className="border-b border-[#2f2f2f] hover:bg-[#252525] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/athletes/${athlete.id}`}
                        className="text-white hover:text-[#5EFF6E] transition-colors"
                      >
                        {athlete.firstName} {athlete.lastName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-400">Class of {athlete.gradYear}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                          athlete.recruitingStatus
                        )}`}
                      >
                        {getStatusLabel(athlete.recruitingStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {topEvent ? (
                        <span className="text-white">
                          {topEvent.event}: {topEvent.averageScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#5EFF6E] font-medium">
                        {athlete.topEvents
                          ?.find((e) => e.event === 'ALL_AROUND')
                          ?.averageScore.toFixed(2) || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {athletes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No committed athletes yet</p>
          <Link href="/dashboard/recruiting" className="text-[#5EFF6E] hover:underline mt-2 inline-block">
            Start recruiting
          </Link>
        </div>
      )}
    </div>
  );
}
