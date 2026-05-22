'use client';

import { Post } from '@/lib/api/posts';
import { CompetitionResult } from '@/lib/api/competitions';
import { PostCard } from './PostCard';

interface PostFeedProps {
  posts: Post[];
  athleteResults?: CompetitionResult[];
  canDelete?: boolean;
  onDelete?: (postId: string) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function PostFeed({
  posts,
  athleteResults = [],
  canDelete = false,
  onDelete,
  emptyMessage = 'No posts yet',
  isLoading = false,
}: PostFeedProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="spinner border-[#0a0a0a]"></span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          athleteResults={athleteResults}
          canDelete={canDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
