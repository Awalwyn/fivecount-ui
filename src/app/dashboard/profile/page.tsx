'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAthleteByUserId, AthleteProfile, CommitStatus } from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, EventType } from '@/lib/api/competitions';
import { ProfileFormModal } from '@/components/ProfileFormModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EventStatData {
  average: number;
  attemptCount: number;
  scoreProgression: Array<{ score: number; date?: string }>;
}

type EventStatsData = Record<EventType, EventStatData>;

const COMMIT_STATUS_CONFIG: Record<CommitStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open to Recruiting', className: 'text-[#5EFF6E] bg-[#5EFF6E]/10 border border-[#5EFF6E]/30' },
  VERBALLY_COMMITTED: { label: 'Verbally Committed', className: 'text-blue-400 bg-blue-400/10 border border-blue-400/30' },
  SIGNED: { label: 'Signed', className: 'text-purple-400 bg-purple-400/10 border border-purple-400/30' },
  NOT_RECRUITING: { label: 'Not Recruiting', className: 'text-gray-500 bg-gray-500/10 border border-gray-500/30' },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load profile
        const profileData = await getAthleteByUserId(user.id);
        setAthlete(profileData);
        setError(null);

        // Load competition results (don't fail if this errors)
        try {
          const resultsData = await getCompetitionResults(profileData.id);
          setResults(resultsData);
        } catch (err) {
          console.error('Failed to load competition results', err);
          setResults([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setAthlete(null);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Auto-open modal if no profile exists
  useEffect(() => {
    if (!loading && !athlete && !error) {
      setIsEditModalOpen(true);
    }
  }, [loading, athlete, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="spinner border-[#0a0a0a]"></span>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-display text-4xl text-white mb-2">Your Profile</h1>
          <p className="text-gray-400">Set up your profile to get discovered by coaches</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 max-w-4xl">
          {/* Placeholder Avatar */}
          <div className="flex gap-6 items-start mb-8">
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-xl bg-[#1f1f1f] text-[#5EFF6E] heading-display text-4xl flex items-center justify-center">
                +
              </div>
            </div>

            {/* Placeholder Info */}
            <div className="flex-1">
              <h2 className="heading-display text-4xl text-gray-500 mb-2">Your Name</h2>
              <p className="text-gray-500 text-sm mb-4">Club Name · City, State · Class of {new Date().getFullYear()}</p>
              <p className="text-gray-500 text-sm max-w-lg">Add your details to complete your profile</p>
            </div>
          </div>

          {/* Placeholder Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-[#1f1f1f]">
            <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
              <p className="text-gray-400 text-xs mb-2">All Around Peak</p>
              <p className="text-gray-500 text-3xl font-bold">—</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
              <p className="text-gray-400 text-xs mb-2">Best Event Score</p>
              <p className="text-gray-500 text-3xl font-bold">—</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-4 text-center text-gray-400">
              <p className="text-xs mb-2">Status</p>
              <p className="font-semibold">Not set</p>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <h3 className="text-body-bold text-lg mb-4 text-white">Score Progression</h3>
              <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-gray-400">
                Add your first meet to see score progression
              </div>
            </div>
            <div>
              <h3 className="text-body-bold text-lg mb-4 text-white">Recent Meets</h3>
              <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-gray-400">
                Complete your profile to get started
              </div>
            </div>
          </div>

          {/* Setup Button */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-primary flex-1"
            >
              Set Up Profile
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        <ProfileFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(newProfile) => {
            setAthlete(newProfile);
            setIsEditModalOpen(false);
          }}
          existingProfile={null}
        />
      </div>
    );
  }

  // Profile exists - show full social media profile view
  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase();
  const athleteStats = (athlete.eventStats as EventStatsData) || {};

  const bestScore = Object.entries(athleteStats)
    .filter(([event]) => event !== 'ALL_AROUND')
    .flatMap(([, data]) => data.scoreProgression?.map(s => s.score) || [])
    .reduce((max, score) => Math.max(max, score), 0);

  const aaPeak = athleteStats?.ALL_AROUND?.scoreProgression?.[0]?.score || 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8">
        {/* Header */}
        <div className="flex gap-6 items-start mb-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {athlete.profilePictureUrl ? (
              <img
                src={athlete.profilePictureUrl}
                alt={athlete.firstName}
                className="w-28 h-28 rounded-xl object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-xl bg-[#1f1f1f] text-[#5EFF6E] heading-display text-3xl flex items-center justify-center">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="heading-display text-4xl text-white mb-2">
              {athlete.firstName} {athlete.lastName}
            </h1>
            <div className="flex items-center gap-2 mb-3">
              {athlete.instagramHandle && (
                <a
                  href={`https://instagram.com/${athlete.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5EFF6E] hover:underline text-sm"
                >
                  Instagram
                </a>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {athlete.clubName} · {athlete.city}, {athlete.state} · Class of {athlete.gradYear}
            </p>
            {athlete.bio && <p className="text-gray-300 text-sm max-w-lg">{athlete.bio}</p>}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-[#1f1f1f]">
          {/* AA Peak */}
          <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
            <p className="text-gray-400 text-xs mb-2">All Around Peak</p>
            <p className="text-[#5EFF6E] text-3xl font-bold">{aaPeak > 0 ? aaPeak.toFixed(2) : '—'}</p>
          </div>

          {/* Best Event */}
          <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
            <p className="text-gray-400 text-xs mb-2">Best Event Score</p>
            <p className="text-[#5EFF6E] text-3xl font-bold">{bestScore > 0 ? bestScore.toFixed(2) : '—'}</p>
          </div>

          {/* Commit Status */}
          <div className={`rounded-lg p-4 text-center ${athlete.commitStatus ? COMMIT_STATUS_CONFIG[athlete.commitStatus].className : 'bg-[#0a0a0a] text-gray-400'}`}>
            <p className="text-xs mb-2">Status</p>
            <p className="font-semibold">{athlete.commitStatus ? COMMIT_STATUS_CONFIG[athlete.commitStatus].label : 'Not set'}</p>
          </div>
        </div>

        {/* Two-column content */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <div className="col-span-2">
            <h2 className="text-body-bold text-lg mb-4 text-white">Score Progression</h2>
            {Object.keys(athleteStats).length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={prepareChartData(athleteStats)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="date" stroke="#a0a0a0" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#a0a0a0" tick={{ fontSize: 12 }} domain={[0, 17.5]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1f1f1f' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  {Object.entries(athleteStats)
                    .filter(([event]) => event !== 'ALL_AROUND')
                    .map(([event]) => (
                      <Line
                        key={event}
                        type="monotone"
                        dataKey={event}
                        stroke={event === 'FLOOR' ? '#5EFF6E' : '#8a8a8a'}
                        isAnimationActive={false}
                        dot={false}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-gray-400">
                Add your first meet to see score progression
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div>
            <h2 className="text-body-bold text-lg mb-4 text-white">Recent Posts</h2>
            <div className="space-y-3">
              {groupResultsByMeet(results).slice(0, 3).length > 0 ? (
                groupResultsByMeet(results).slice(0, 3).map((meet, idx) => (
                  <div key={idx} className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-white text-sm font-semibold">{meet.meetName}</p>
                    <p className="text-gray-400 text-xs mb-2">{new Date(meet.meetDate).toLocaleDateString()}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'].map((eventType: string) => {
                        const result = meet.eventResults[eventType as EventType];
                        return (
                          <div key={eventType}>
                            <p className="text-gray-500">{eventType.split('_')[0].slice(0, 2)}</p>
                            <p className="text-[#5EFF6E] font-semibold">{result ? result.score.toFixed(2) : '—'}</p>
                          </div>
                        );
                      })}
                    </div>
                    {meet.allAroundScore && (
                      <div className="mt-2 pt-2 border-t border-[#1f1f1f]">
                        <p className="text-[#5EFF6E] text-xs font-bold">AA: {meet.allAroundScore.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-gray-400 text-sm">
                  Your recent meets will appear here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="btn-secondary w-full"
        >
          Edit Profile
        </button>
      </div>

      {/* Edit Modal */}
      <ProfileFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updatedProfile) => {
          setAthlete(updatedProfile);
          setIsEditModalOpen(false);
        }}
        existingProfile={athlete}
      />
    </div>
  );
}

function groupResultsByMeet(results: CompetitionResult[]) {
  const grouped = new Map<string, CompetitionResult[]>();
  results.forEach((result) => {
    const key = `${result.meetName}|${result.meetDate}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(result);
  });

  return Array.from(grouped.values()).map((meetResults) => {
    const firstResult = meetResults[0];
    const byEvent: Record<EventType, CompetitionResult> = {} as Record<EventType, CompetitionResult>;
    let allAroundResult: CompetitionResult | undefined;

    meetResults.forEach((result) => {
      if (result.eventType === 'ALL_AROUND') {
        allAroundResult = result;
      } else {
        byEvent[result.eventType] = result;
      }
    });

    return {
      meetName: firstResult.meetName,
      meetDate: firstResult.meetDate,
      meetLocation: firstResult.location,
      allAroundScore: allAroundResult?.score,
      eventResults: byEvent,
      allResults: meetResults,
    };
  });
}

function prepareChartData(eventStats: EventStatsData) {
  const dateMap = new Map<string, any>();

  Object.entries(eventStats).forEach(([event, data]) => {
    if (event === 'ALL_AROUND') return;
    if (!data.scoreProgression) return;

    data.scoreProgression.forEach(({ score, date }) => {
      const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown';
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr });
      }
      dateMap.get(dateStr)![event] = score;
    });
  });

  return Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
