'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFeedPosts, Post } from '@/lib/api/posts';
import { getWeeklyLeaderboard, LeaderboardEntry } from '@/lib/api/leaderboard';
import { getTrendingMeets, TrendingMeet } from '@/lib/api/meets';
import { getSuggestedAthletes, SuggestedAthlete } from '@/lib/api/suggestions';
import { PostFeed } from '@/components/PostFeed';
import { TopScorersWidget } from '@/components/TopScorersWidget';
import { TrendingMeetsWidget } from '@/components/TrendingMeetsWidget';
import { SuggestedAthletesWidget } from '@/components/SuggestedAthletesWidget';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [meets, setMeets] = useState<TrendingMeet[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedAthlete[]>([]);

  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setPostsError(null);

        // Load all data in parallel
        const results = await Promise.allSettled([
          getFeedPosts(),
          getWeeklyLeaderboard(),
          getTrendingMeets(),
          user?.id ? getSuggestedAthletes(user.id) : Promise.resolve([]),
        ]);

        setPosts(results[0].status === 'fulfilled' ? results[0].value : []);
        setLeaderboard(results[1].status === 'fulfilled' ? results[1].value : []);
        setMeets(results[2].status === 'fulfilled' ? results[2].value : []);
        setSuggestions(results[3].status === 'fulfilled' ? results[3].value : []);
      } catch (err) {
        setPostsError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadAll();
    }
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">FEED</h1>
        <p className="text-gray-400">See what's happening in the gymnastics community</p>
      </div>

      {/* Error */}
      {postsError && <div className="error-message">{postsError}</div>}

      {/* Two-column layout: Feed + Sidebars */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column: Feed (2/3 width) */}
        <div className="col-span-2">
          <PostFeed
            posts={posts}
            emptyMessage="No posts in the feed yet. Be the first to post!"
            isLoading={loading}
          />
        </div>

        {/* Right column: Sidebars (1/3 width) */}
        <div className="space-y-4 sticky top-24">
          <TrendingMeetsWidget meets={meets} isLoading={loading} />
          <TopScorersWidget entries={leaderboard} isLoading={loading} />
          <SuggestedAthletesWidget athletes={suggestions} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
