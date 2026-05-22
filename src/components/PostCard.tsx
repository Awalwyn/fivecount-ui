'use client';

import { Post, PostType } from '@/lib/api/posts';
import { CompetitionResult, EventType } from '@/lib/api/competitions';

const EVENT_DISPLAY_NAMES: Record<EventType, string> = {
  ALL_AROUND: 'All Around',
  FLOOR: 'Floor Exercise',
  POMMEL_HORSE: 'Pommel Horse',
  RINGS: 'Rings',
  VAULT: 'Vault',
  PARALLEL_BARS: 'Parallel Bars',
  HIGH_BAR: 'High Bar',
};

interface PostCardProps {
  post: Post;
  athleteResults?: CompetitionResult[];
  canDelete?: boolean;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, athleteResults = [], canDelete = false, onDelete }: PostCardProps) {
  const initials = post.author
    ? `${post.author.firstName[0]}${post.author.lastName[0]}`.toUpperCase()
    : '?';

  const renderMeetCard = () => {
    if (!post.meetReference) return null;

    const [meetName, meetDate] = post.meetReference.split('|');
    const meetResults = athleteResults.filter(r => r.meetName === meetName && r.meetDate === meetDate);

    if (meetResults.length === 0) {
      return (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4 text-gray-400 text-sm">
          {meetName} · {meetDate}
        </div>
      );
    }

    // Group results by event
    const byEvent: Partial<Record<EventType, number>> = {};
    let aa: number | undefined;

    meetResults.forEach(r => {
      if (r.eventType === 'ALL_AROUND') {
        aa = r.score;
      } else {
        byEvent[r.eventType] = r.score;
      }
    });

    return (
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
        <p className="text-white text-sm font-semibold mb-3">{meetName}</p>
        <p className="text-gray-400 text-xs mb-3">{new Date(meetDate).toLocaleDateString()}</p>

        {/* Event scores grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          {(['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'] as EventType[]).map(et => (
            <div key={et}>
              <p className="text-gray-500">{et.split('_')[0].slice(0, 2)}</p>
              <p className="text-[#5EFF6E] font-semibold">
                {byEvent[et] !== undefined ? byEvent[et]!.toFixed(2) : '—'}
              </p>
            </div>
          ))}
        </div>

        {/* All around */}
        {aa !== undefined && (
          <div className="border-t border-[#1f1f1f] pt-2">
            <p className="text-[#5EFF6E] text-xs font-bold">AA: {aa.toFixed(2)}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {post.author?.profilePictureUrl ? (
              <img
                src={post.author.profilePictureUrl}
                alt={post.author.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">
              {post.author?.firstName} {post.author?.lastName}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(post.createdAt).toLocaleDateString()} · {new Date(post.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-red-500 hover:text-red-400 text-sm transition-colors flex-shrink-0"
          >
            Delete
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && <p className="text-gray-300 text-sm">{post.content}</p>}

      {/* Image */}
      {post.imageUrl && (
        <div className="rounded-lg overflow-hidden max-h-96">
          <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Video */}
      {post.videoUrl && (
        <div className="rounded-lg overflow-hidden max-h-96">
          <video
            src={post.videoUrl}
            controls
            className="w-full h-full bg-black"
          />
        </div>
      )}

      {/* Score Tile */}
      {post.postType === 'SCORE_TILE' && renderMeetCard()}
    </div>
  );
}
