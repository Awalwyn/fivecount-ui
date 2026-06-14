'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAthleteByUserId, AthleteProfile } from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, EventType } from '@/lib/api/competitions';
import { deletePost, type Post } from '@/lib/api/posts';
import { ProfileFormModal } from '@/components/ProfileFormModal';
import { PostComposerModal } from '@/components/PostComposerModal';
import { RecruitingStatusDisplay } from '@/components/RecruitingStatusBadge';
import { CoachProfile } from '@/components/coach/CoachProfile';
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
import { Camera, Play, MapPin, Calendar, Instagram, Trophy, Medal, Award, ExternalLink, MoreHorizontal, Heart, MessageCircle, Bookmark } from 'lucide-react';

export default function ProfilePage() {
  const { role } = useAuth();
  if (role === 'COACH') {
    return <CoachProfile />;
  }
  return <AthleteProfilePage />;
}

function AthleteProfilePage() {
  const { user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventType>('ALL_AROUND');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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

        {/* Empty state with cover photo placeholder */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden max-w-5xl">
          {/* Cover Photo Placeholder */}
          <div className="h-48 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-600" />
            </div>
          </div>

          {/* Avatar + Info */}
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-[#1f1f1f] border-4 border-[#111111] text-[#5EFF6E] heading-display text-4xl flex items-center justify-center flex-shrink-0">
                +
              </div>
              <div className="pb-2">
                <h2 className="heading-display text-3xl text-gray-500">Your Name</h2>
                <p className="text-gray-500 text-sm">Complete your profile to get started</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-primary w-full"
            >
              Set Up Profile
            </button>
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

  const aaPeak = results
    .filter(r => r.eventType === 'ALL_AROUND')
    .reduce((max, r) => Math.max(max, r.score), 0);

  const bestScore = results
    .filter(r => r.eventType !== 'ALL_AROUND')
    .reduce((max, r) => Math.max(max, r.score), 0);

  const bestEvent = results
    .filter(r => r.eventType !== 'ALL_AROUND')
    .reduce((best, r) => (r.score > (best?.score || 0) ? r : best), null as CompetitionResult | null);

  const recentMeets = groupResultsByMeet([...results].sort(
    (a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime()
  )).slice(0, 3);

  // Mock awards for demo
  const awards = [
    { id: '1', title: 'State Champion - Floor', year: '2024' },
    { id: '2', title: 'Regional All-Around Silver', year: '2024' },
    { id: '3', title: 'Club Athlete of the Year', year: '2023' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Cover Photo + Avatar Header */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden mb-6">
        {/* Cover Photo */}
        <div className="h-48 md:h-56 bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a0a0a] relative group">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-4 h-4" />
            Edit Cover
          </button>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 md:px-8 pb-6">
          {/* Avatar - overlapping cover */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20 mb-4">
            <div className="relative flex-shrink-0">
              {athlete.profilePictureUrl ? (
                <img
                  src={athlete.profilePictureUrl}
                  alt={athlete.firstName}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-[#111111]"
                />
              ) : (
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-[#1f1f1f] border-4 border-[#111111] text-[#5EFF6E] heading-display text-4xl flex items-center justify-center">
                  {initials}
                </div>
              )}
              <button className="absolute bottom-2 right-2 bg-[#5EFF6E] text-black p-2 rounded-full hover:bg-[#4ee65d] transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Name + Location + Actions */}
            <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="heading-display text-3xl md:text-4xl text-white">
                  {athlete.firstName} {athlete.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-400 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {athlete.city}, {athlete.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Class of {athlete.gradYear}
                  </span>
                  {athlete.instagramHandle && (
                    <a
                      href={`https://instagram.com/${athlete.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#5EFF6E] hover:underline"
                    >
                      <Instagram className="w-4 h-4" />
                      @{athlete.instagramHandle}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn-secondary text-sm"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsPostComposerOpen(true)}
                  className="btn-primary text-sm"
                >
                  + New Post
                </button>
              </div>
            </div>
          </div>

          {/* Club + Bio */}
          <div className="mt-4">
            <p className="text-[#5EFF6E] font-medium">{athlete.clubName}</p>
            {athlete.bio && <p className="text-gray-300 text-sm mt-2 max-w-2xl">{athlete.bio}</p>}
          </div>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[#1f1f1f]">
            <div className="text-center">
              <p className="text-[#5EFF6E] text-2xl font-bold">{aaPeak > 0 ? aaPeak.toFixed(2) : '—'}</p>
              <p className="text-gray-500 text-xs">AA Peak</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{bestScore > 0 ? bestScore.toFixed(2) : '—'}</p>
              <p className="text-gray-500 text-xs">Best Event</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{results.length}</p>
              <p className="text-gray-500 text-xs">Scores</p>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{posts.length}</p>
              <p className="text-gray-500 text-xs">Posts</p>
            </div>
            <div className="ml-auto">
              <RecruitingStatusDisplay status={athlete.commitStatus} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Main + Sidebar */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Score Progression Chart */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4">Score Progression</h2>
            <ScoreProgressionChart
              results={results}
              activeEvent={activeEvent}
              onEventChange={setActiveEvent}
            />
          </div>

          {/* Posts Grid */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Posts</h2>
              <button
                onClick={() => setIsPostComposerOpen(true)}
                className="text-[#5EFF6E] text-sm hover:underline"
              >
                + Add Post
              </button>
            </div>

            {posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="aspect-square bg-[#0a0a0a] rounded-lg overflow-hidden relative group"
                  >
                    {post.mediaUrl ? (
                      <>
                        <img
                          src={post.mediaUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {post.mediaType === 'video' && (
                          <div className="absolute top-2 right-2">
                            <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3">
                        <p className="text-gray-400 text-xs line-clamp-4 text-center">
                          {post.content}
                        </p>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <span className="flex items-center gap-1 text-white text-sm">
                        <Heart className="w-4 h-4" fill="white" />
                        {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-white text-sm">
                        <MessageCircle className="w-4 h-4" fill="white" />
                        {post.commentsCount || 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="mb-2">No posts yet</p>
                <button
                  onClick={() => setIsPostComposerOpen(true)}
                  className="text-[#5EFF6E] hover:underline text-sm"
                >
                  Share your first post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 space-y-4 hidden lg:block">
          {/* Recent Competition Results */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Recent Meets</h3>
            {recentMeets.length > 0 ? (
              <div className="space-y-3">
                {recentMeets.map((meet, idx) => (
                  <div key={idx} className="bg-[#0a0a0a] rounded-lg p-3">
                    <p className="text-white text-sm font-medium truncate">{meet.meetName}</p>
                    <p className="text-gray-500 text-xs mb-2">
                      {new Date(meet.meetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      {(['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'] as EventType[]).map((eventType) => {
                        const result = meet.eventResults[eventType];
                        const shortLabel = { FLOOR: 'FX', POMMEL_HORSE: 'PH', RINGS: 'SR', VAULT: 'VT', PARALLEL_BARS: 'PB', HIGH_BAR: 'HB' }[eventType];
                        return (
                          <div key={eventType} className="text-center">
                            <p className="text-gray-600">{shortLabel}</p>
                            <p className="text-[#5EFF6E] font-semibold">{result ? result.score.toFixed(2) : '—'}</p>
                          </div>
                        );
                      })}
                    </div>
                    {meet.allAroundScore && (
                      <div className="mt-2 pt-2 border-t border-[#1f1f1f] text-center">
                        <span className="text-gray-500 text-xs">AA Total </span>
                        <span className="text-[#5EFF6E] text-sm font-bold">{meet.allAroundScore.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No meets recorded yet</p>
            )}
          </div>

          {/* Awards & Achievements */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Awards & Achievements</h3>
            <div className="space-y-2">
              {awards.map((award) => (
                <div key={award.id} className="flex items-start gap-3 bg-[#0a0a0a] rounded-lg p-3">
                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm">{award.title}</p>
                    <p className="text-gray-500 text-xs">{award.year}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-[#5EFF6E] text-xs hover:underline">
              + Add Achievement
            </button>
          </div>

          {/* Best Scores by Event */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-3">Personal Bests</h3>
            <div className="space-y-2">
              {(['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'] as EventType[]).map((eventType) => {
                const best = results
                  .filter(r => r.eventType === eventType)
                  .reduce((max, r) => (r.score > (max?.score || 0) ? r : max), null as CompetitionResult | null);
                const label = { FLOOR: 'Floor', POMMEL_HORSE: 'Pommel Horse', RINGS: 'Rings', VAULT: 'Vault', PARALLEL_BARS: 'Parallel Bars', HIGH_BAR: 'High Bar' }[eventType];
                return (
                  <div key={eventType} className="flex items-center justify-between py-1">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <span className="text-[#5EFF6E] font-semibold text-sm">{best ? best.score.toFixed(2) : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          athlete={athlete}
          onClose={() => setSelectedPost(null)}
          onDelete={async () => {
            try {
              await deletePost(selectedPost.id);
              setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
              setSelectedPost(null);
            } catch (err) {
              console.error('Failed to delete post', err);
            }
          }}
        />
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

function PostDetailModal({
  post,
  athlete,
  onClose,
  onDelete,
}: {
  post: Post;
  athlete: AthleteProfile;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase();

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#111111] border border-[#1f1f1f] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media side */}
        {post.mediaUrl && (
          <div className="flex-1 bg-black flex items-center justify-center max-w-md">
            {post.mediaType === 'video' ? (
              <video src={post.mediaUrl} controls className="max-w-full max-h-[80vh]" />
            ) : (
              <img src={post.mediaUrl} alt="" className="max-w-full max-h-[80vh] object-contain" />
            )}
          </div>
        )}

        {/* Content side */}
        <div className="w-80 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[#1f1f1f]">
            {athlete.profilePictureUrl ? (
              <img src={athlete.profilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1f1f1f] text-[#5EFF6E] text-sm font-bold flex items-center justify-center">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{athlete.firstName} {athlete.lastName}</p>
              <p className="text-gray-500 text-xs">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-white p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg py-1 min-w-[120px] z-10">
                  <button
                    onClick={onDelete}
                    className="w-full text-left px-3 py-2 text-red-500 hover:bg-[#2f2f2f] text-sm"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-[#1f1f1f]">
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button className="ml-auto text-gray-400 hover:text-white transition-colors">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white text-sm font-semibold mt-2">{post.likesCount || 0} likes</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
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
  const uniqueMeetCount = new Set(results.map(r => `${r.meetName}|${r.meetDate}`)).size;
  const yAxisMax = getYAxisMax(activeEvent);

  if (results.length === 0) {
    return (
      <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-gray-400 text-sm">
        Add your first meet to see score progression
      </div>
    );
  }

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
          <p className="text-gray-500 text-xs">
            {3 - uniqueMeetCount} more {3 - uniqueMeetCount === 1 ? 'meet' : 'meets'} to unlock chart
          </p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="#1f1f1f" />
            <PolarAngleAxis dataKey="event" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 17.5]} tick={{ fill: '#4b5563', fontSize: 9 }} tickCount={4} />
            <Radar dataKey="score" stroke="#5EFF6E" fill="#5EFF6E" fillOpacity={0.15} dot={{ fill: '#5EFF6E', r: 3, strokeWidth: 0 } as any} />
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

  const chartData = results
    .filter(r => r.eventType === activeEvent)
    .sort((a, b) => new Date(a.meetDate).getTime() - new Date(b.meetDate).getTime())
    .map(r => ({ name: r.meetName, score: r.score }));

  const peak = chartData.reduce((max, d) => Math.max(max, d.score), 0);

  return (
    <div className="bg-[#0a0a0a] rounded-lg p-4">
      <div className="flex gap-1 flex-wrap mb-4">
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

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: '#1f1f1f' }} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, yAxisMax]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', borderRadius: '8px' }}
            labelStyle={{ color: '#ffffff', fontWeight: 700, marginBottom: 4 }}
            itemStyle={{ color: '#5EFF6E', fontSize: 18, fontWeight: 700 }}
            formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Score']}
          />
          <Line type="monotone" dataKey="score" stroke="#5EFF6E" strokeWidth={2} dot={{ fill: 'transparent', stroke: '#5EFF6E', strokeWidth: 2, r: 4 }} activeDot={{ fill: '#5EFF6E', stroke: '#5EFF6E', r: 5 }} />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-3 mt-2 pt-3 border-t border-[#1f1f1f]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#5EFF6E] inline-block" />
        <span className="text-gray-400 text-xs">{EVENT_STAT_LABELS[activeEvent]}</span>
        {peak > 0 && (
          <span className="ml-auto text-gray-400 text-xs">
            Peak: <span className="text-[#5EFF6E] font-bold">{peak.toFixed(2)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
