'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getPublicAthleteProfile, AthleteProfile } from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, type EventType } from '@/lib/api/competitions';
import type { Post } from '@/lib/api/posts';
import { getAthletesAwards, Award } from '@/lib/api/awards';
import { formatScore } from '@/lib/utils/formatScore';
import { PostFeed } from '@/components/PostFeed';
import { ScoreProgressionChart } from '@/components/dashboard/ScoreProgressionChart';
import { RecentMeetsSection } from '@/components/dashboard/RecentMeetsSection';
import { AwardsSection } from '@/components/dashboard/AwardsSection';
import { PersonalBestsSection } from '@/components/dashboard/PersonalBestsSection';
import { ContactAthleteModal } from '@/components/ContactAthleteModal';
import Link from 'next/link';

export default function AthleteProfilePage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.athleteId as string;

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventType>('ALL_AROUND');
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'ATHLETE' | 'COACH' | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession?.user?.user_metadata?.role) {
        setUserRole(currentSession.user.user_metadata.role);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileData = await getPublicAthleteProfile(athleteId);
        setAthlete(profileData);
        setPosts(profileData.posts || []);

        try {
          const resultsData = await getCompetitionResults(profileData.id);
          setResults(resultsData);
        } catch (err) {
          console.error('Failed to load results', err);
          setResults([]);
        }

        try {
          const awardsData = await getAthletesAwards(profileData.id);
          setAwards(awardsData);
        } catch (err) {
          console.error('Failed to load awards', err);
          setAwards([]);
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
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <span className="spinner border-[#5EFF6E]"></span>
      </div>
    );
  }

  if (!athlete || error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="heading-display text-4xl text-white mb-2">Athlete not found</h1>
          <p className="text-gray-400">This profile doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase();
  const aaPeak = results.filter(r => r.eventType === 'ALL_AROUND').reduce((max, r) => Math.max(max, r.score), 0);
  const bestScore = results.filter(r => r.eventType !== 'ALL_AROUND').reduce((max, r) => Math.max(max, r.score), 0);
  const scoresCount = new Set(results.map(r => `${r.meetName}|${r.meetDate}`)).size;

  return (
    <div className="min-h-screen bg-[#0a0a0a] space-y-6">
      {/* Cover Photo */}
      <div className="bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a0a0a] h-48 md:h-56 mx-6 rounded-t-xl" />

      {/* Profile Header */}
      <div className="px-6 -mt-20">
        <div className="flex gap-6 mb-8">
          {/* Avatar */}
          {athlete.profilePictureUrl ? (
            <img
              src={athlete.profilePictureUrl}
              alt={athlete.firstName}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#111111] object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#111111] bg-[#1f1f1f] text-[#5EFF6E] heading-display text-4xl flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
          )}

          {/* Name & Info */}
          <div className="flex-1 pt-4">
            <h1 className="heading-display text-3xl md:text-4xl text-white mb-2">
              {athlete.firstName} {athlete.lastName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>📍 {athlete.city}, {athlete.state}</span>
              <span>•</span>
              <span>Class of {athlete.gradYear}</span>
              {athlete.instagramHandle && (
                <>
                  <span>•</span>
                  <a href={`https://instagram.com/${athlete.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400">
                    @{athlete.instagramHandle}
                  </a>
                </>
              )}
            </div>
            <p className="text-[#5EFF6E] text-sm font-medium mb-3">{athlete.clubName}</p>
            {athlete.bio && <p className="text-gray-400 text-sm max-w-lg mb-6">{athlete.bio}</p>}

            {/* Coach CTA */}
            {!session ? (
              <Link href="/auth/signup">
                <button className="bg-[#5EFF6E] text-black hover:bg-[#4ee65d] px-6 py-2 rounded-lg text-sm font-medium">
                  Sign Up as Coach
                </button>
              </Link>
            ) : userRole === 'COACH' ? (
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="bg-[#5EFF6E] text-black hover:bg-[#4ee65d] px-6 py-2 rounded-lg text-sm font-medium"
              >
                Contact {athlete.firstName}
              </button>
            ) : null}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between items-center pb-6 border-b border-[#1f1f1f] mb-6">
          <div className="text-center">
            <p className="text-[#5EFF6E] text-2xl font-bold">{formatScore(aaPeak > 0 ? aaPeak : undefined)}</p>
            <p className="text-xs text-gray-500">AA Peak</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">{(athlete as any).gpa ? (athlete as any).gpa.toFixed(2) : '—'}</p>
            <p className="text-xs text-gray-500">GPA</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">{scoresCount}</p>
            <p className="text-xs text-gray-500">Scores</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">{posts.length}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5EFF6E] to-[#4ee65d] flex items-center justify-center text-sm font-bold shadow-lg shadow-[#5EFF6E]/50">
              ✓
            </div>
            <p className="text-xs text-gray-500">
              {athlete.commitStatus === 'OPEN_TO_RECRUITING' ? 'Open' :
               athlete.commitStatus === 'VERBALLY_COMMITTED' ? 'Committed' :
               athlete.commitStatus === 'SIGNED' ? 'Signed' : 'Not'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6 px-6 pb-6">
        {/* Left Column (2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Score Progression */}
          {results.length > 0 && (
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
              <h2 className="font-semibold text-lg text-white mb-4">Score Progression</h2>
              <ScoreProgressionChart
                results={results}
                activeEvent={activeEvent}
                onEventChange={setActiveEvent}
              />
            </div>
          )}

          {/* Posts Grid */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="font-semibold text-lg text-white mb-4">Posts</h2>
            <PostFeed posts={posts} athleteResults={results} emptyMessage="No posts yet" />
          </div>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Recent Meets */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <RecentMeetsSection results={results} />
          </div>

          {/* Awards */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <AwardsSection awards={awards} />
          </div>

          {/* Personal Bests */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <PersonalBestsSection results={results} />
          </div>
        </div>
      </div>

      {/* Contact Athlete Modal */}
      {athlete && (
        <ContactAthleteModal
          isOpen={isContactModalOpen}
          athleteId={athleteId}
          athleteName={athlete.firstName}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
}
