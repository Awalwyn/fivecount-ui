'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFeedPosts, Post, createPost } from '@/lib/api/posts';
import { getCompetitionResults, CompetitionResult } from '@/lib/api/competitions';
import { FeedPostCard, Milestone } from '@/components/feed/FeedPostCard';
import { FeedSidebar } from '@/components/feed/FeedSidebar';
import { QuickPostComposer } from '@/components/feed/QuickPostComposer';
import { FloatingActionButton } from '@/components/feed/FloatingActionButton';
import { PostComposerModal } from '@/components/PostComposerModal';
import { MilestoneComposerModal } from '@/components/feed/MilestoneComposerModal';

// Mock milestones for demo - in production these would come from the API
const MOCK_MILESTONES: Record<string, Milestone> = {};

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [athleteResults, setAthleteResults] = useState<CompetitionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [isMilestoneComposerOpen, setIsMilestoneComposerOpen] = useState(false);
  const [composerTab, setComposerTab] = useState<'text' | 'meet' | 'photo' | 'video'>('text');

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        const postsData = await getFeedPosts();
        setPosts(postsData);
        
        // Load athlete results if user is logged in
        if (user?.id) {
          try {
            const results = await getCompetitionResults(user.id);
            setAthleteResults(results);
          } catch (err) {
            console.log('Could not load athlete results');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user?.id]);

  const handleOpenComposer = (tab: 'text' | 'meet' | 'photo' | 'video' = 'text') => {
    setComposerTab(tab);
    setIsPostComposerOpen(true);
  };

  const handleFABSelect = (option: 'post' | 'score' | 'video' | 'milestone') => {
    switch (option) {
      case 'post':
        handleOpenComposer('text');
        break;
      case 'score':
        handleOpenComposer('meet');
        break;
      case 'video':
        handleOpenComposer('video');
        break;
      case 'milestone':
        setIsMilestoneComposerOpen(true);
        break;
    }
  };

  const handlePostSuccess = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleMilestoneSubmit = async (milestone: {
    type: 'COMMITMENT' | 'OFFER' | 'AWARD';
    title: string;
    school?: string;
    content?: string;
  }) => {
    try {
      const newPost = await createPost({
        content: milestone.content || `${milestone.title}`,
        postType: 'REGULAR',
      });
      
      // Add milestone data to the post (in production this would be stored in the DB)
      MOCK_MILESTONES[newPost.id] = {
        type: milestone.type,
        title: milestone.title,
        school: milestone.school,
        date: new Date().toISOString(),
      };
      
      setPosts(prev => [newPost, ...prev]);
    } catch (err) {
      console.error('Failed to create milestone post:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    // TODO: Implement delete
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="heading-display text-3xl sm:text-4xl text-white mb-1">Feed</h1>
        <p className="text-gray-400 text-sm">See what&apos;s happening in the gymnastics community</p>
      </div>

      {/* Main Layout */}
      <div className="flex gap-6">
        {/* Main Feed Column */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Quick Composer */}
          <QuickPostComposer onOpenFullComposer={handleOpenComposer} />

          {/* Error */}
          {error && <div className="error-message">{error}</div>}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#1f1f1f]" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-[#1f1f1f] rounded mb-2" />
                      <div className="h-3 w-24 bg-[#1f1f1f] rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-full bg-[#1f1f1f] rounded mb-2" />
                  <div className="h-4 w-3/4 bg-[#1f1f1f] rounded" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1f1f1f] flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
              <button
                onClick={() => handleOpenComposer('text')}
                className="btn-primary"
              >
                Create a Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  athleteResults={athleteResults}
                  milestone={MOCK_MILESTONES[post.id]}
                  canDelete={post.athleteId === user?.id}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <FeedSidebar />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onSelectOption={handleFABSelect} />

      {/* Post Composer Modal */}
      <PostComposerModal
        isOpen={isPostComposerOpen}
        onClose={() => setIsPostComposerOpen(false)}
        onSuccess={handlePostSuccess}
        athleteResults={athleteResults}
        prefilledTab={composerTab}
      />

      {/* Milestone Composer Modal */}
      <MilestoneComposerModal
        isOpen={isMilestoneComposerOpen}
        onClose={() => setIsMilestoneComposerOpen(false)}
        onSubmit={handleMilestoneSubmit}
      />
    </div>
  );
}
