'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPublicAthleteProfile, AthleteProfile } from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, type EventType } from '@/lib/api/competitions';
import type { Post } from '@/lib/api/posts';
import { PostFeed } from '@/components/PostFeed';
import { ScoreProgressionChart } from '@/components/dashboard/ScoreProgressionChart';
import { RecentMeetsSection } from '@/components/dashboard/RecentMeetsSection';
import { AwardsSection } from '@/components/dashboard/AwardsSection';
import { PersonalBestsSection } from '@/components/dashboard/PersonalBestsSection';

export default function AthleteProfilePage() {
  const params = useParams();
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="heading-display text-4xl text-white mb-2">Athlete not found</h1>
          <p className="text-gray-400">This profile doesn't exist or has been deleted.</p>
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

  const scoresCount = new Set(results.map(r => `${r.meetName}|${r.meetDate}`)).size;

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8">
        {/* Header Section */}
        <div className="flex gap-8 items-start mb-8">
          {/* Avatar + Info */}
          <div className="flex gap-4 flex-1 items-start">
            {/* Avatar */}
            {athlete.profilePictureUrl ? (
              <img
                src={athlete.profilePictureUrl}
                alt={athlete.firstName}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-[#1f1f1f] text-[#5EFF6E] heading-display text-2xl flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
            )}

            {/* Name + Meta Info */}
            <div className="flex-1 min-w-0">
              <h1 className="heading-display text-3xl text-white mb-1">
                {athlete.firstName} {athlete.lastName}
              </h1>
              <div className="flex items-center gap-2 mb-2 flex-wrap text-sm text-gray-400">
                <span>📍 {athlete.city}, {athlete.state}</span>
                <span>•</span>
                <span>Class of {athlete.gradYear}</span>
                {athlete.instagramHandle && (
                  <>
                    <span>•</span>
                    <a
                      href={`https://instagram.com/${athlete.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5EFF6E] hover:underline"
                    >
                      @{athlete.instagramHandle}
                    </a>
                  </>
                )}
              </div>
              {athlete.clubName && (
                <p className="text-gray-400 text-xs mb-3">{athlete.clubName}</p>
              )}
              {athlete.bio && <p className="text-gray-300 text-sm max-w-lg">{athlete.bio}</p>}
            </div>
          </div>

          {/* Recruiting Status Badge */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#5EFF6E] to-[#4de658] shadow-lg shadow-[#5EFF6E]/50">
              <span className="text-2xl font-bold">✓</span>
            </div>
            <p className="text-gray-400 text-xs text-center font-medium">
              {athlete.commitStatus === 'OPEN_TO_RECRUITING' ? 'Open to Recruiting' :
               athlete.commitStatus === 'VERBALLY_COMMITTED' ? 'Verbally Committed' :
               athlete.commitStatus === 'SIGNED' ? 'Signed' : 'Not Recruiting'}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-around items-center mb-6 pb-6 border-b border-[#1f1f1f]">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[#5EFF6E] text-3xl font-bold">{aaPeak > 0 ? aaPeak.toFixed(1) : '—'}</p>
            <p className="text-gray-500 text-xs">AA Peak</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[#5EFF6E] text-3xl font-bold">{bestScore > 0 ? bestScore.toFixed(1) : '—'}</p>
            <p className="text-gray-500 text-xs">Best Event</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[#5EFF6E] text-3xl font-bold">{scoresCount}</p>
            <p className="text-gray-500 text-xs">Scores</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[#5EFF6E] text-3xl font-bold">{posts.length}</p>
            <p className="text-gray-500 text-xs">Posts</p>
          </div>
        </div>

        {/* Coach CTA */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-3">Interested in this athlete?</p>
          <button className="btn-primary px-6">Sign Up as Coach</button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column: Score Progression + Posts */}
        <div className="col-span-2 space-y-8">
          {/* Score Progression */}
          {results.length > 0 && (
            <div>
              <h2 className="text-body-bold text-xl mb-4 text-white">Score Progression</h2>
              <ScoreProgressionChart
                results={results}
                activeEvent={activeEvent}
                onEventChange={setActiveEvent}
              />
            </div>
          )}

          {/* Posts */}
          <div>
            <h2 className="text-body-bold text-xl mb-4 text-white">Posts</h2>
            <PostFeed posts={posts} athleteResults={results} emptyMessage="No posts yet" />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Recent Meets */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
            <RecentMeetsSection results={results} />
          </div>

          {/* Awards & Achievements */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
            <AwardsSection />
          </div>

          {/* Personal Bests */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
            <PersonalBestsSection results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}
