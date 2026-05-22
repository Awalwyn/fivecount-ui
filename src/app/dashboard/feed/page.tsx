'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFeedPosts, Post } from '@/lib/api/posts';
import { PostFeed } from '@/components/PostFeed';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        const postsData = await getFeedPosts();
        setPosts(postsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Feed</h1>
        <p className="text-gray-400">See posts from all athletes in the community</p>
      </div>

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Feed */}
      <PostFeed
        posts={posts}
        emptyMessage="No posts in the feed yet. Be the first to post!"
        isLoading={loading}
      />
    </div>
  );
}
