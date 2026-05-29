'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAthleteByUserId, AthleteProfile } from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, EventType } from '@/lib/api/competitions';
import { getMyPosts, Post, deletePost } from '@/lib/api/posts';
import { ProfileFormModal } from '@/components/ProfileFormModal';
import { PostComposerModal } from '@/components/PostComposerModal';
import { PostFeed } from '@/components/PostFeed';
import { RecruitingStatusDisplay } from '@/components/RecruitingStatusBadge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

export default function ProfilePage() {
  const { user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventType>('ALL_AROUND');

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

        // Load posts (don't fail if this errors)
        try {
          const postsData = await getMyPosts();
          setPosts(postsData);
        } catch (err) {
          console.error('Failed to load posts', err);
          setPosts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setAthlete(null);
        setResults([]);
        setPosts([]);
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

  // Calculate stats from actual competition results
  const aaPeak = results
    .filter(r => r.eventType === 'ALL_AROUND')
    .reduce((max, r) => Math.max(max, r.score), 0);

  const bestScore = results
    .filter(r => r.eventType !== 'ALL_AROUND')
    .reduce((max, r) => Math.max(max, r.score), 0);

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
          <div className="bg-[#0a0a0a] rounded-lg p-4 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-gray-400">Status</p>
            <RecruitingStatusDisplay status={athlete.commitStatus} />
          </div>
        </div>

        {/* Two-column content: Chart + Posts (left), Recent Meets (right) */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Left column: Score Progression Chart */}
          <div className="col-span-2">
            <h2 className="text-body-bold text-lg mb-4 text-white">Score Progression</h2>
            <ScoreProgressionChart
              results={results}
              activeEvent={activeEvent}
              onEventChange={setActiveEvent}
            />
          </div>

          {/* Right column: Up to 3 Recent Meets stacked */}
          <div>
            <h2 className="text-body-bold text-lg mb-4 text-white">Latest Meet</h2>
            <div className="space-y-3">
              {(() => {
                const sortedResults = [...results].sort(
                  (a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()
                );
                const recentMeets = groupResultsByMeet(sortedResults).slice(0, 1);
                return recentMeets.length > 0 ? (
                  recentMeets.map((meet, idx) => (
                    <div key={idx} className="bg-[#0a0a0a] rounded-lg p-4">
                      <p className="text-white text-sm font-semibold">{meet.meetName}</p>
                      <p className="text-gray-400 text-xs mb-2">
                        {new Date(meet.meetDate).toLocaleDateString()}
                        {meet.meetLocation && ` · ${meet.meetLocation}`}
                      </p>
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
                );
              })()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn-secondary flex-1"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setIsPostComposerOpen(true)}
            className="btn-primary flex-1"
          >
            + New Post
          </button>
        </div>
      </div>

      {/* Posts Section */}
      {athlete && (
        <div>
          <h2 className="text-body-bold text-2xl mb-4 text-white">Posts</h2>
          <PostFeed
            posts={posts}
            athleteResults={results}
            canDelete={true}
            onDelete={async (postId) => {
              try {
                await deletePost(postId);
                setPosts(prev => prev.filter(p => p.id !== postId));
              } catch (err) {
                console.error('Failed to delete post', err);
              }
            }}
            emptyMessage="No posts yet. Share your gymnastics journey!"
          />
        </div>
      )}

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

      {/* Post Composer Modal */}
      {athlete && (
        <PostComposerModal
          isOpen={isPostComposerOpen}
          onClose={() => setIsPostComposerOpen(false)}
          onSuccess={(newPost) => {
            setPosts(prev => [newPost, ...prev]);
            setIsPostComposerOpen(false);
          }}
          athleteResults={results}
        />
      )}
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

const EVENT_TABS: { type: EventType; label: string }[] = [
  { type: 'ALL_AROUND', label: 'All Around' },
  { type: 'FLOOR', label: 'Floor' },
  { type: 'POMMEL_HORSE', label: 'Pommel' },
  { type: 'RINGS', label: 'Rings' },
  { type: 'VAULT', label: 'Vault' },
  { type: 'PARALLEL_BARS', label: 'P. Bars' },
  { type: 'HIGH_BAR', label: 'High Bar' },
];

const EVENT_STAT_LABELS: Partial<Record<EventType, string>> = {
  FLOOR: 'Floor',
  POMMEL_HORSE: 'Pommel Horse',
  RINGS: 'Rings',
  VAULT: 'Vault',
  PARALLEL_BARS: 'Parallel Bars',
  HIGH_BAR: 'High Bar',
  ALL_AROUND: 'All Around',
};

function RadarExpanded({
  radarData,
  results,
  onClose,
}: {
  radarData: { event: string; score: number; avg: number }[];
  results: CompetitionResult[];
  onClose: () => void;
}) {
  const sorted = [...results].sort(
    (a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()
  );
  const grouped = new Map<string, CompetitionResult[]>();
  sorted.forEach(r => {
    const key = `${r.meetName}|${r.meetDate}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  });
  const recentMeets = Array.from(grouped.values()).slice(0, 3).map(meetResults => {
    const first = meetResults[0];
    const byEvent: Partial<Record<EventType, number>> = {};
    let aa: number | undefined;
    meetResults.forEach(r => {
      if (r.eventType === 'ALL_AROUND') aa = r.score;
      else byEvent[r.eventType] = r.score;
    });
    return { meetName: first.meetName, meetDate: first.meetDate, byEvent, aa };
  });

  const EVENT_ORDER: EventType[] = ['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'];
  const SHORT: Partial<Record<EventType, string>> = {
    FLOOR: 'FX', POMMEL_HORSE: 'PH', RINGS: 'SR', VAULT: 'VT', PARALLEL_BARS: 'PB', HIGH_BAR: 'HB',
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">Season Best</h2>
            <p className="text-gray-500 text-xs mt-0.5">Event breakdown across all meets</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Enlarged radar */}
          <div className="col-span-3">
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#1f1f1f" />
                <PolarAngleAxis dataKey="event" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 17.5]} tick={{ fill: '#4b5563', fontSize: 9 }} tickCount={4} />
                <Radar dataKey="score" stroke="#5EFF6E" fill="#5EFF6E" fillOpacity={0.15} dot={{ fill: '#5EFF6E', r: 4, strokeWidth: 0 } as any} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2 space-y-1">
                        <p className="text-white text-xs font-semibold mb-2">{d.event}</p>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-gray-500 text-xs">Average</p>
                          <p className="text-[#5EFF6E] text-xs font-bold">{d.avg.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-gray-500 text-xs">Season Best</p>
                          <p className="text-[#5EFF6E] text-xs font-bold">{d.score.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent meets */}
          <div className="col-span-2 space-y-3">
            <p className="text-white text-sm font-semibold mb-1">Recent Meets</p>
            {recentMeets.map((meet, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3">
                <p className="text-white text-xs font-semibold">{meet.meetName}</p>
                <p className="text-gray-500 text-xs mb-2">{new Date(meet.meetDate).toLocaleDateString()}</p>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {EVENT_ORDER.map(et => (
                    <div key={et}>
                      <p className="text-gray-600">{SHORT[et]}</p>
                      <p className="text-[#5EFF6E] font-semibold">
                        {meet.byEvent[et] !== undefined ? meet.byEvent[et]!.toFixed(2) : '—'}
                      </p>
                    </div>
                  ))}
                </div>
                {meet.aa !== undefined && (
                  <div className="mt-2 pt-2 border-t border-[#1f1f1f]">
                    <p className="text-[#5EFF6E] text-xs font-bold">AA: {meet.aa.toFixed(2)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function getYAxisMax(eventType: EventType): number {
  return eventType === 'ALL_AROUND' ? 100 : 20;
}

function ScoreProgressionChart({
  results,
  activeEvent,
  onEventChange,
}: {
  results: CompetitionResult[];
  activeEvent: EventType;
  onEventChange: (e: EventType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLineChartExpanded, setIsLineChartExpanded] = useState(false);
  const uniqueMeetCount = new Set(results.map(r => `${r.meetName}|${r.meetDate}`)).size;
  const yAxisMax = getYAxisMax(activeEvent);

  // 0 meets — placeholder
  if (results.length === 0) {
    return (
      <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-gray-400 text-sm">
        Add your first meet to see score progression
      </div>
    );
  }

  // 1–2 meets — season best per event (excluding ALL_AROUND)
  if (uniqueMeetCount < 3) {
    const bestByEvent: Partial<Record<EventType, number>> = {};
    results.forEach(r => {
      if (r.eventType === 'ALL_AROUND') return;
      if (bestByEvent[r.eventType] === undefined || r.score > bestByEvent[r.eventType]!) {
        bestByEvent[r.eventType] = r.score;
      }
    });

    const eventTabs = EVENT_TABS.filter(t => t.type !== 'ALL_AROUND');

    const sumByEvent: Partial<Record<EventType, { total: number; count: number }>> = {};
    results.forEach(r => {
      if (r.eventType === 'ALL_AROUND') return;
      if (!sumByEvent[r.eventType]) sumByEvent[r.eventType] = { total: 0, count: 0 };
      sumByEvent[r.eventType]!.total += r.score;
      sumByEvent[r.eventType]!.count += 1;
    });

    const radarData = eventTabs.map(({ type, label }) => ({
      event: label,
      score: bestByEvent[type] ?? 0,
      avg: sumByEvent[type]
        ? parseFloat((sumByEvent[type]!.total / sumByEvent[type]!.count).toFixed(2))
        : 0,
    }));

    return (
      <div className="bg-[#0a0a0a] rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-white text-xs font-semibold">Season Best</p>
          <div className="flex items-center gap-3">
            <p className="text-gray-500 text-xs">
              {3 - uniqueMeetCount} more {3 - uniqueMeetCount === 1 ? 'meet' : 'meets'} to unlock chart
            </p>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-400 hover:text-white text-xs underline transition-colors"
            >
              Expand
            </button>
          </div>
        </div>
        {isExpanded && (
          <RadarExpanded
            radarData={radarData}
            results={results}
            onClose={() => setIsExpanded(false)}
          />
        )}
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="#1f1f1f" />
            <PolarAngleAxis
              dataKey="event"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 17.5]}
              tick={{ fill: '#4b5563', fontSize: 9 }}
              tickCount={4}
            />
            <Radar
              dataKey="score"
              stroke="#5EFF6E"
              fill="#5EFF6E"
              fillOpacity={0.15}
              dot={{ fill: '#5EFF6E', r: 3, strokeWidth: 0 } as any}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg px-3 py-2 space-y-1">
                    <p className="text-white text-xs font-semibold mb-2">{d.event}</p>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-gray-500 text-xs">Average</p>
                      <p className="text-[#5EFF6E] text-xs font-bold">{d.avg.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-gray-500 text-xs">Season Best</p>
                      <p className="text-[#5EFF6E] text-xs font-bold">{d.score.toFixed(2)}</p>
                    </div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 3+ meets — interactive line chart
  const chartData = results
    .filter(r => r.eventType === activeEvent)
    .sort((a, b) => new Date(a.meetDate).getTime() - new Date(b.meetDate).getTime())
    .map(r => ({ name: r.meetName, score: r.score }));

  const peak = chartData.reduce((max, d) => Math.max(max, d.score), 0);

  return (
    <div className="bg-[#0a0a0a] rounded-lg p-4">
      {/* Header with expand button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 flex-wrap flex-1">
          {EVENT_TABS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onEventChange(type)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeEvent === type
                  ? 'bg-[#5EFF6E] text-black'
                  : 'bg-[#1f1f1f] text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsLineChartExpanded(true)}
          className="text-gray-400 hover:text-white text-xs underline transition-colors flex-shrink-0 ml-4"
        >
          Expand
        </button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#1f1f1f' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, yAxisMax]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', borderRadius: '8px' }}
            labelStyle={{ color: '#ffffff', fontWeight: 700, marginBottom: 4 }}
            itemStyle={{ color: '#5EFF6E', fontSize: 18, fontWeight: 700 }}
            formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Score']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#5EFF6E"
            strokeWidth={2}
            dot={{ fill: 'transparent', stroke: '#5EFF6E', strokeWidth: 2, r: 4 }}
            activeDot={{ fill: '#5EFF6E', stroke: '#5EFF6E', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 pt-3 border-t border-[#1f1f1f]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#5EFF6E] inline-block" />
        <span className="text-gray-400 text-xs">{EVENT_STAT_LABELS[activeEvent]}</span>
        {peak > 0 && (
          <span className="ml-auto text-gray-400 text-xs">
            Peak: <span className="text-[#5EFF6E] font-bold">{peak.toFixed(2)}</span>
          </span>
        )}
      </div>

      {/* Expanded Line Chart Modal */}
      {isLineChartExpanded && (
        <LineChartExpanded
          chartData={chartData}
          activeEvent={activeEvent}
          onEventChange={onEventChange}
          peak={peak}
          yAxisMax={yAxisMax}
          onClose={() => setIsLineChartExpanded(false)}
        />
      )}
    </div>
  );
}

function LineChartExpanded({
  chartData,
  activeEvent,
  onEventChange,
  peak,
  yAxisMax,
  onClose,
}: {
  chartData: { name: string; score: number }[];
  activeEvent: EventType;
  onEventChange: (e: EventType) => void;
  peak: number;
  yAxisMax: number;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 max-w-4xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">{EVENT_STAT_LABELS[activeEvent]}</h2>
            <p className="text-gray-500 text-xs mt-0.5">Score progression over time</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Event Tabs */}
        <div className="flex gap-1 flex-wrap mb-6">
          {EVENT_TABS.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onEventChange(type)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeEvent === type
                  ? 'bg-[#5EFF6E] text-black'
                  : 'bg-[#1f1f1f] text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Enlarged Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={{ stroke: '#1f1f1f' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, yAxisMax]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', borderRadius: '8px' }}
              labelStyle={{ color: '#ffffff', fontWeight: 700, marginBottom: 4 }}
              itemStyle={{ color: '#5EFF6E', fontSize: 18, fontWeight: 700 }}
              formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Score']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#5EFF6E"
              strokeWidth={2}
              dot={{ fill: 'transparent', stroke: '#5EFF6E', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: '#5EFF6E', stroke: '#5EFF6E', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Footer Stats */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#1f1f1f]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5EFF6E] inline-block" />
          <span className="text-gray-400 text-xs">{EVENT_STAT_LABELS[activeEvent]}</span>
          {peak > 0 && (
            <span className="ml-auto text-gray-400 text-xs">
              Peak: <span className="text-[#5EFF6E] font-bold">{peak.toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

