'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAthleteByUserId, AthleteProfile } from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, EventType } from '@/lib/api/competitions';
import { deletePost, type Post } from '@/lib/api/posts';
import { ProfileFormModal } from '@/components/ProfileFormModal';
import { PostComposerModal } from '@/components/PostComposerModal';
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

        // Load profile (includes posts)
        const profileData = await getAthleteByUserId(user.id);
        setAthlete(profileData);
        setError(null);

        // Use posts from profile response if available
        setPosts(profileData.posts || []);

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

  // Profile exists - show full redesigned profile view
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
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#5EFF6E]">
              <span className="text-xl">✓</span>
            </div>
            <p className="text-gray-400 text-xs text-center">
              {athlete.commitStatus === 'OPEN_TO_RECRUITING' ? 'Open to Recruiting' :
               athlete.commitStatus === 'VERBALLY_COMMITTED' ? 'Verbally Committed' :
               athlete.commitStatus === 'SIGNED' ? 'Signed' : 'Not Recruiting'}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 mb-6 pb-6 border-b border-[#1f1f1f] overflow-x-auto">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <p className="text-[#5EFF6E] text-2xl font-bold">{aaPeak > 0 ? aaPeak.toFixed(1) : '—'}</p>
            <p className="text-gray-400 text-xs whitespace-nowrap">AA Peak</p>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <p className="text-[#5EFF6E] text-2xl font-bold">{bestScore > 0 ? bestScore.toFixed(1) : '—'}</p>
            <p className="text-gray-400 text-xs whitespace-nowrap">Best Event</p>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <p className="text-[#5EFF6E] text-2xl font-bold">{scoresCount}</p>
            <p className="text-gray-400 text-xs whitespace-nowrap">Scores</p>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <p className="text-[#5EFF6E] text-2xl font-bold">{posts.length}</p>
            <p className="text-gray-400 text-xs whitespace-nowrap">Posts</p>
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
            + NEW POST
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column: Score Progression + Posts */}
        <div className="col-span-2 space-y-8">
          {/* Score Progression */}
          <div>
            <h2 className="text-body-bold text-xl mb-4 text-white">Score Progression</h2>
            <ScoreProgressionChart
              results={results}
              activeEvent={activeEvent}
              onEventChange={setActiveEvent}
            />
          </div>

          {/* Posts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-body-bold text-xl text-white">Posts</h2>
              <button
                onClick={() => setIsPostComposerOpen(true)}
                className="text-[#5EFF6E] hover:text-[#4de658] text-sm font-medium transition-colors"
              >
                + Add Post
              </button>
            </div>
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

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Recent Meets */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
            <RecentMeetsSection results={results} />
          </div>

          {/* Awards & Achievements */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
            <AwardsSection isEditable={true} />
          </div>

          {/* Personal Bests */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
            <PersonalBestsSection results={results} />
          </div>
        </div>
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

      {/* Post Composer Modal */}
      {athlete && (
        <PostComposerModal
          isOpen={isPostComposerOpen}
          onClose={() => setIsPostComposerOpen(false)}
          onSuccess={(newPost) => {
            console.log('Post created:', newPost);
            setPosts(prev => {
              const updated = [newPost, ...prev];
              console.log('Posts array updated:', updated);
              return updated;
            });
            setIsPostComposerOpen(false);
          }}
          athleteResults={results}
        />
      )}
    </div>
  );
}


