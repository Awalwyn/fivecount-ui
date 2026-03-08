'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAthleteByUserId, AthleteProfile } from '@/lib/api/athletes';
import { ProfileFormModal } from '@/components/ProfileFormModal';

interface EventStatsData {
  [key: string]: {
    average: number;
    attemptCount: number;
    scoreProgression: Array<{ score: number; date?: string }>;
  };
}

const EVENT_DISPLAY_NAMES: Record<string, string> = {
  ALL_AROUND: 'All Around',
  FLOOR: 'Floor Exercise',
  POMMEL_HORSE: 'Pommel Horse',
  RINGS: 'Rings',
  VAULT: 'Vault',
  PARALLEL_BARS: 'Parallel Bars',
  HIGH_BAR: 'High Bar',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const loadAthlete = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAthleteByUserId(user.id);
        setAthlete(data);
      } catch (err) {
        // No profile yet - this is OK
        setError(
          err instanceof Error ? err.message : 'Failed to load profile'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAthlete();
  }, [user?.id]);

  // Calculate overall stats
  const calculateOverallStats = () => {
    if (!athlete?.eventStats) {
      return {
        totalCompetitions: 0,
        avgScore: 0,
        bestScore: 0,
        numEvents: 0,
      };
    }

    const eventStats = athlete.eventStats as EventStatsData;
    const allScores: number[] = [];
    let numEvents = 0;

    Object.values(eventStats).forEach((stats) => {
      if (stats.scoreProgression && Array.isArray(stats.scoreProgression)) {
        stats.scoreProgression.forEach((item) => {
          if (typeof item.score === 'number') {
            allScores.push(item.score);
          }
        });
        numEvents++;
      }
    });

    return {
      totalCompetitions: allScores.length,
      avgScore:
        allScores.length > 0
          ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
          : 0,
      bestScore:
        allScores.length > 0
          ? Math.max(...allScores).toFixed(2)
          : 0,
      numEvents,
    };
  };

  const stats = calculateOverallStats();
  const hasProfile = athlete !== null && !error;
  const eventStats = (athlete?.eventStats as EventStatsData) || {};

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {user?.user_metadata?.firstName ?? user?.email}
          {hasProfile && ` • ${athlete?.firstName} ${athlete?.lastName}`}
        </p>
      </div>

      {/* Profile Completion Banner */}
      {!loading && !hasProfile && (
        <div className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-amber-200 font-semibold">Complete your profile</p>
            <p className="text-amber-100/70 text-sm">Add your details to track scores and get discovered by coaches</p>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="ml-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded whitespace-nowrap transition-colors"
          >
            Complete Profile →
          </button>
        </div>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E]/50 transition-colors">
          <h2 className="text-body-bold text-lg mb-2 text-white">Your Profile</h2>
          <p className="text-gray-400 text-sm mb-4">
            {hasProfile
              ? 'Update your profile to stay fresh with coaches.'
              : 'Create your athlete profile to get discovered by coaches.'}
          </p>
          <a
            href="/dashboard/profile"
            className="text-[#5EFF6E] text-sm font-semibold hover:underline"
          >
            {hasProfile ? 'Edit Profile' : 'Create Profile'} →
          </a>
        </div>

        {/* Competition Results Card */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 hover:border-[#5EFF6E]/50 transition-colors">
          <h2 className="text-body-bold text-lg mb-2 text-white">
            Competition Results
          </h2>
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
      {loading && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 flex items-center justify-center h-32">
          <span className="spinner"></span>
        </div>
      )}

      {!loading && !hasProfile && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
          <h2 className="text-body-bold text-lg mb-4 text-white">Your Stats</h2>
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-4">
              No profile yet. Create your profile and add competition results to
              see your stats here.
            </p>
            <a href="/dashboard/profile" className="btn-primary inline-block">
              Get Started
            </a>
          </div>
        </div>
      )}

      {!loading && hasProfile && (
        <>
          {/* Overall Stats */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
            <h2 className="text-body-bold text-lg mb-4 text-white">
              Your Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center border border-[#1f1f1f]">
                <div className="text-3xl font-bold text-[#5EFF6E]">
                  {stats.totalCompetitions}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {stats.totalCompetitions === 1 ? 'Result' : 'Results'}
                </p>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center border border-[#1f1f1f]">
                <div className="text-3xl font-bold text-[#5EFF6E]">
                  {stats.avgScore}
                </div>
                <p className="text-gray-400 text-sm mt-1">Avg Score</p>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center border border-[#1f1f1f]">
                <div className="text-3xl font-bold text-[#5EFF6E]">
                  {stats.bestScore}
                </div>
                <p className="text-gray-400 text-sm mt-1">Best Score</p>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center border border-[#1f1f1f]">
                <div className="text-3xl font-bold text-[#5EFF6E]">
                  {stats.numEvents}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {stats.numEvents === 1 ? 'Event' : 'Events'}
                </p>
              </div>
            </div>
          </div>

          {/* Event Breakdown */}
          {stats.numEvents > 0 && (
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
              <h2 className="text-body-bold text-lg mb-4 text-white">
                Event Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(eventStats).map(([eventType, stats]) => {
                  const scores =
                    stats.scoreProgression?.map((s) => s.score) || [];
                  const best =
                    scores.length > 0 ? Math.max(...scores).toFixed(2) : 'N/A';
                  const avg =
                    scores.length > 0
                      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(
                          2
                        )
                      : 'N/A';

                  return (
                    <div
                      key={eventType}
                      className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 hover:border-[#5EFF6E]/20 transition"
                    >
                      <p className="text-[#5EFF6E] text-sm font-semibold mb-3">
                        {EVENT_DISPLAY_NAMES[eventType] || eventType}
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-gray-500 text-xs">Average</p>
                          <p className="text-white font-bold text-lg">{avg}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Best</p>
                          <p className="text-white font-bold text-lg">{best}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Attempts</p>
                          <p className="text-white font-bold text-lg">
                            {scores.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {stats.numEvents === 0 && (
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
              <h2 className="text-body-bold text-lg mb-4 text-white">
                Event Breakdown
              </h2>
              <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6 text-center">
                <p className="text-gray-400 mb-4">
                  No competition results yet. Add your first result to see
                  event breakdowns.
                </p>
                <a
                  href="/dashboard/competitions"
                  className="btn-primary inline-block"
                >
                  Add Results
                </a>
              </div>
            </div>
          )}
        </>
      )}

      {/* Profile Form Modal */}
      <ProfileFormModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSuccess={(newProfile) => {
          setAthlete(newProfile);
          setIsProfileModalOpen(false);
        }}
        existingProfile={null}
      />
    </div>
  );
}
