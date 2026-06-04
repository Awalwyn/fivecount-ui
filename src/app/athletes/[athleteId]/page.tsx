'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPublicAthleteProfile, AthleteProfile } from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, type EventType } from '@/lib/api/competitions';
import type { Post } from '@/lib/api/posts';
import { PostFeed } from '@/components/PostFeed';
import { RecruitingStatusDisplay } from '@/components/RecruitingStatusBadge';
import { ScoreProgressionChart } from '@/components/dashboard/ScoreProgressionChart';

export default function AthleteProfilePage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.athleteId as string;

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventType>('ALL_AROUND');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load athlete profile (includes posts)
        const profileData = await getPublicAthleteProfile(athleteId);
        setAthlete(profileData);

        // Use posts from profile response if available
        setPosts(profileData.posts || []);

        // Load competition results
        try {
          const resultsData = await getCompetitionResults(profileData.id);
          setResults(resultsData);
        } catch (err) {
          console.error('Failed to load results', err);
          setResults([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setAthlete(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [athleteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="spinner border-[#0a0a0a]"></span>
      </div>
    );
  }

  if (!athlete || error) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="heading-display text-4xl text-white mb-2">Athlete Profile</h1>
          <p className="text-gray-400">Athlete not found</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8">
          <p className="text-gray-400 mb-4">We couldn't find this athlete profile.</p>
          <button
            onClick={() => router.push('/athletes')}
            className="btn-primary"
          >
            Back to Athletes
          </button>
        </div>
      </div>
    );
  }

  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase();

  // Calculate stats
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

        {/* Sign up CTA */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">Are you a coach? Reach out to this athlete.</p>
          <button className="btn-primary px-6">Sign Up as Coach</button>
        </div>
      </div>

      {/* Score Progression Chart */}
      {results.length > 0 && (
        <div>
          <h2 className="text-body-bold text-2xl mb-4 text-white">Score Progression</h2>
          <ScoreProgressionChart
            results={results}
            activeEvent={activeEvent}
            onEventChange={setActiveEvent}
          />
        </div>
      )}

      {/* Posts Feed */}
      <div>
        <h2 className="text-body-bold text-2xl mb-4 text-white">Posts</h2>
        <PostFeed posts={posts} athleteResults={results} emptyMessage="No posts yet" />
      </div>
    </div>
  );
}
