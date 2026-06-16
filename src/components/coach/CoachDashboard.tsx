'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCoachStats, getRoster, getCoachActivity } from '@/lib/api/recruiting';
import { searchAthletes } from '@/lib/api/athletes';
import { PipelineStageCard } from './PipelineStageCard';
import { RosterCard } from './RosterCard';
import { StatCardSkeleton } from './StatCardSkeleton';
import { ActivityFeed } from './ActivityFeed';
import { RecommendedPanel } from './RecommendedPanel';

interface RosterAthlete {
  id?: string;
  firstName: string;
  lastName: string;
  gradYear: number;
  recruitingStatus: string;
  topEvents?: Array<{ event: string; averageScore: number }>;
}

interface RosterStats {
  total: number;
  avgScore: string;
  bestScore: number;
  bestAthleteName: string;
  incoming: number;
}

function calculateRosterStats(roster: RosterAthlete[]): RosterStats {
  if (roster.length === 0) {
    return { total: 0, avgScore: '0.0', bestScore: 0, bestAthleteName: '', incoming: 0 };
  }

  // Find athlete with highest ALL_AROUND score
  const bestAthlete = roster.reduce((max, athlete) => {
    const maxAAScore = max.topEvents?.find((e) => e.event === 'ALL_AROUND')?.averageScore || 0;
    const athleteAAScore = athlete.topEvents?.find((e) => e.event === 'ALL_AROUND')?.averageScore || 0;
    return athleteAAScore > maxAAScore ? athlete : max;
  });

  // Calculate average AA score
  const totalAAScore = roster.reduce((sum, a) => {
    const aa = a.topEvents?.find((e) => e.event === 'ALL_AROUND')?.averageScore || 0;
    return sum + aa;
  }, 0);
  const avgScore = (totalAAScore / roster.length).toFixed(2);

  // Count incoming
  const incoming = roster.filter(
    (r) => r.recruitingStatus === 'VERBALLY_COMMITTED' || r.recruitingStatus === 'SIGNED'
  ).length;

  const bestScore = bestAthlete.topEvents?.find((e) => e.event === 'ALL_AROUND')?.averageScore || 0;
  const bestAthleteName = `${bestAthlete.firstName} ${bestAthlete.lastName}`;

  return { total: roster.length, avgScore, bestScore, bestAthleteName, incoming };
}

export function CoachDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [roster, setRoster] = useState<RosterAthlete[] | null>(null);
  const [activity, setActivity] = useState<any>(null);
  const [search, setSearch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    async function loadDashboard() {
      try {
        setError(null);

        const [statsData, rosterData, activityData, searchData] = await Promise.all([
          getCoachStats().catch(() => null),
          getRoster(50).then((res) => res.data || []).catch(() => []),
          getCoachActivity(10).then((res) => res.data || []).catch(() => []),
          searchAthletes(undefined, undefined, undefined, 0, 4).then((res) => res.content || []).catch(() => []),
        ]);

        setStats(statsData);
        setRoster(rosterData as any);
        setActivity(activityData);
        setSearch(searchData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      }
    }

    loadDashboard();
  }, [user?.id]);

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-700/30 rounded-lg p-6 text-red-400">
        {error}
      </div>
    );
  }

  const rosterStats = roster ? calculateRosterStats(roster) : null;
  const stageOrder = [
    'WATCHING',
    'CONTACTED',
    'IN_TALKS',
    'OFFERED',
    'COMMITTED',
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Coach Dashboard</h1>
        <p className="text-gray-400">Track your recruiting pipeline and roster</p>
      </div>

      {/* Pipeline Stats Section */}
      <div className="min-h-[100px]">
        <h2 className="heading-display text-xl text-white mb-4">Recruiting Pipeline</h2>
        {stats ? (
          <div className="grid grid-cols-5 gap-4">
            {stageOrder.map((stage) => (
              <PipelineStageCard
                key={stage}
                stage={stage}
                count={stats[stage.toLowerCase()] || 0}
              />
            ))}
          </div>
        ) : (
          <StatCardSkeleton size="small" count={5} />
        )}
      </div>

      {/* Roster Stats Section */}
      <div className="min-h-[160px]">
        <h2 className="heading-display text-xl text-white mb-4">Committed Roster</h2>
        {rosterStats ? (
          <RosterCard
            committed={rosterStats.total}
            avgScore={parseFloat(rosterStats.avgScore)}
            bestScore={rosterStats.bestScore}
            bestScoreAthlete={rosterStats.bestAthleteName}
            incoming={rosterStats.incoming}
          />
        ) : (
          <StatCardSkeleton size="large" count={1} />
        )}
      </div>

      {/* Activity Feed & Recommended */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 min-h-[250px]">
          <h2 className="heading-display text-xl text-white mb-4">Activity</h2>
          {activity ? <ActivityFeed activities={activity} /> : <ActivityFeedSkeleton />}
        </div>

        <div className="min-h-[250px]">
          <h2 className="heading-display text-xl text-white mb-4">Recommended</h2>
          {search ? <RecommendedPanel athletes={search} /> : <RecommendedSkeleton />}
        </div>
      </div>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 bg-[#1f1f1f] rounded animate-pulse" />
      ))}
    </div>
  );
}

function RecommendedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-[#1f1f1f] rounded animate-pulse" />
      ))}
    </div>
  );
}
