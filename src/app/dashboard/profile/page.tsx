'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAthleteByUserId, AthleteProfile } from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, EventType } from '@/lib/api/competitions';
import { deletePost, type Post } from '@/lib/api/posts';
import { getAthletesAwards, Award, deleteAward } from '@/lib/api/awards';
import { ProfileFormModal } from '@/components/ProfileFormModal';
import { PostComposerModal } from '@/components/PostComposerModal';
import { AwardModal } from '@/components/AwardModal';
import { PostFeed } from '@/components/PostFeed';
import { ScoreProgressionChart } from '@/components/dashboard/ScoreProgressionChart';
import { RecentMeetsSection } from '@/components/dashboard/RecentMeetsSection';
import { AwardsSection } from '@/components/dashboard/AwardsSection';
import { PersonalBestsSection } from '@/components/dashboard/PersonalBestsSection';

export default function ProfilePage() {
  const { user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventType>('ALL_AROUND');

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileData = await getAthleteByUserId(user.id);
        setAthlete(profileData);
        setPosts(profileData.posts || []);

        try {
          const resultsData = await getCompetitionResults(profileData.id);
          setResults(resultsData);
        } catch (err) {
          console.error('Failed to load competition results', err);
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
        setResults([]);
        setPosts([]);
        setAwards([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (!loading && !athlete && !error) {
      setIsEditModalOpen(true);
    }
  }, [loading, athlete, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="spinner border-[#5EFF6E]"></span>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a0a0a] h-48 md:h-56 rounded-t-xl" />

        <div className="px-6 pb-6">
          <div className="flex gap-6 mb-8">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#111111] bg-[#1f1f1f] text-[#5EFF6E] heading-display text-4xl flex items-center justify-center -mt-20">
              +
            </div>
            <div className="flex-1 pt-4">
              <h1 className="heading-display text-3xl md:text-4xl text-white mb-2">Your Name</h1>
              <p className="text-gray-500 text-sm mb-1">City, State • Class of {new Date().getFullYear()}</p>
              <p className="text-[#5EFF6E] text-sm font-medium mb-4">Club Name</p>
              <p className="text-gray-400 text-sm max-w-lg mb-6">Add your details to complete your profile</p>
              <div className="flex gap-3">
                <button onClick={() => setIsEditModalOpen(true)} className="bg-[#5EFF6E] text-black hover:bg-[#4ee65d] px-4 py-2 rounded-lg text-sm font-medium">
                  Edit Profile
                </button>
                <button onClick={() => setIsPostComposerOpen(true)} className="border border-[#1f1f1f] text-white hover:bg-[#1f1f1f] px-4 py-2 rounded-lg text-sm font-medium">
                  + New Post
                </button>
              </div>
            </div>
          </div>
        </div>

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

  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase();
  const aaPeak = results.filter(r => r.eventType === 'ALL_AROUND').reduce((max, r) => Math.max(max, r.score), 0);
  const bestScore = results.filter(r => r.eventType !== 'ALL_AROUND').reduce((max, r) => Math.max(max, r.score), 0);
  const scoresCount = new Set(results.map(r => `${r.meetName}|${r.meetDate}`)).size;

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <div className="bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a0a0a] h-48 md:h-56 rounded-t-xl" />

      {/* Profile Header */}
      <div className="px-6 pb-6 -mt-20">
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

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#5EFF6E] text-black hover:bg-[#4ee65d] px-4 py-2 rounded-lg text-sm font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsPostComposerOpen(true)}
                className="border border-[#1f1f1f] text-white hover:bg-[#1f1f1f] px-4 py-2 rounded-lg text-sm font-medium"
              >
                + New Post
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between items-center pb-6 border-b border-[#1f1f1f]">
          <div className="text-center">
            <p className="text-[#5EFF6E] text-2xl font-bold">{aaPeak > 0 ? aaPeak.toFixed(1) : '—'}</p>
            <p className="text-xs text-gray-500">AA Peak</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">{bestScore > 0 ? bestScore.toFixed(1) : '—'}</p>
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
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="font-semibold text-lg text-white mb-4">Score Progression</h2>
            <ScoreProgressionChart
              results={results}
              activeEvent={activeEvent}
              onEventChange={setActiveEvent}
            />
          </div>

          {/* Posts Grid */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="font-semibold text-lg text-white mb-4">Posts</h2>
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
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Recent Meets */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <RecentMeetsSection results={results} />
          </div>

          {/* Awards */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <AwardsSection
              awards={awards}
              isEditable={true}
              onAddAward={() => {
                setSelectedAward(null);
                setIsAwardModalOpen(true);
              }}
            />
          </div>

          {/* Personal Bests */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <PersonalBestsSection results={results} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfileFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updatedProfile) => {
          setAthlete(updatedProfile);
          setIsEditModalOpen(false);
        }}
        existingProfile={athlete}
      />

      <PostComposerModal
        isOpen={isPostComposerOpen}
        onClose={() => setIsPostComposerOpen(false)}
        onSuccess={(newPost) => {
          setPosts(prev => [newPost, ...prev]);
          setIsPostComposerOpen(false);
        }}
        athleteResults={results}
      />

      {athlete && (
        <AwardModal
          isOpen={isAwardModalOpen}
          athleteId={athlete.id}
          award={selectedAward}
          onClose={() => {
            setIsAwardModalOpen(false);
            setSelectedAward(null);
          }}
          onSuccess={(award) => {
            if (selectedAward?.id) {
              setAwards(prev => prev.map(a => a.id === award.id ? award : a));
            } else {
              setAwards(prev => [award, ...prev]);
            }
            setIsAwardModalOpen(false);
            setSelectedAward(null);
          }}
        />
      )}
    </div>
  );
}
