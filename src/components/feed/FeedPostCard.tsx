'use client';

import { Post, PostType } from '@/lib/api/posts';
import { CompetitionResult, EventType } from '@/lib/api/competitions';
import { useState } from 'react';

const EVENT_DISPLAY_NAMES: Record<EventType, string> = {
  ALL_AROUND: 'All Around',
  FLOOR: 'Floor',
  POMMEL_HORSE: 'Pommel',
  RINGS: 'Rings',
  VAULT: 'Vault',
  PARALLEL_BARS: 'P. Bars',
  HIGH_BAR: 'High Bar',
};

const EVENT_ABBREVIATIONS: Record<string, string> = {
  FLOOR: 'FX',
  POMMEL_HORSE: 'PH',
  RINGS: 'SR',
  VAULT: 'VT',
  PARALLEL_BARS: 'PB',
  HIGH_BAR: 'HB',
};

export type MilestoneType = 'COMMITMENT' | 'OFFER' | 'AWARD';

export interface Milestone {
  type: MilestoneType;
  title: string;
  subtitle?: string;
  school?: string;
  date: string;
}

interface FeedPostCardProps {
  post: Post;
  athleteResults?: CompetitionResult[];
  milestone?: Milestone;
  canDelete?: boolean;
  onDelete?: (postId: string) => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export function FeedPostCard({ 
  post, 
  athleteResults = [], 
  milestone,
  canDelete = false, 
  onDelete,
  onLike,
  onComment,
  onShare,
}: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50)); // Placeholder
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const initials = post.author && post.author.firstName && post.author.lastName
    ? `${post.author.firstName[0]}${post.author.lastName[0]}`.toUpperCase()
    : 'A';

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  const renderMilestoneCard = () => {
    if (!milestone) return null;

    const milestoneStyles = {
      COMMITMENT: {
        bg: 'bg-gradient-to-br from-[#5EFF6E]/20 via-[#111111] to-[#111111]',
        border: 'border-[#5EFF6E]/40',
        icon: (
          <svg className="w-8 h-8 text-[#5EFF6E]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        ),
        badge: 'COMMITTED',
        badgeColor: 'bg-[#5EFF6E] text-[#0a0a0a]',
      },
      OFFER: {
        bg: 'bg-gradient-to-br from-blue-500/20 via-[#111111] to-[#111111]',
        border: 'border-blue-500/40',
        icon: (
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        badge: 'OFFER RECEIVED',
        badgeColor: 'bg-blue-500 text-white',
      },
      AWARD: {
        bg: 'bg-gradient-to-br from-amber-500/20 via-[#111111] to-[#111111]',
        border: 'border-amber-500/40',
        icon: (
          <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
        badge: 'AWARD',
        badgeColor: 'bg-amber-500 text-white',
      },
    };

    const style = milestoneStyles[milestone.type];

    return (
      <div className={`${style.bg} ${style.border} border-2 rounded-xl p-6 relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="80" cy="20" r="60" fill="currentColor" className="text-white" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            {style.icon}
            <span className={`${style.badgeColor} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
              {style.badge}
            </span>
          </div>
          <h3 className="text-white text-xl font-bold mb-1">{milestone.title}</h3>
          {milestone.school && (
            <p className="text-[#5EFF6E] font-semibold">{milestone.school}</p>
          )}
          {milestone.subtitle && (
            <p className="text-gray-400 text-sm mt-2">{milestone.subtitle}</p>
          )}
        </div>
      </div>
    );
  };

  const renderMeetCard = () => {
    if (!post.meetReference) return null;

    const [meetName, meetDate] = post.meetReference.split('|');
    const meetResults = athleteResults.filter(r => r.meetName === meetName && r.meetDate === meetDate);

    if (meetResults.length === 0) {
      return (
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-4 text-gray-400 text-sm">
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

    const eventOrder: EventType[] = ['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'];

    return (
      <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden">
        {/* Meet Header */}
        <div className="bg-[#0a0a0a] px-4 py-3 border-b border-[#1f1f1f]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{meetName}</p>
              <p className="text-gray-500 text-xs">{new Date(meetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            {aa !== undefined && (
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">All Around</p>
                <p className="text-[#5EFF6E] text-2xl font-bold">{aa.toFixed(3)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Scores Grid */}
        <div className="p-4">
          <div className="grid grid-cols-6 gap-2">
            {eventOrder.map(et => (
              <div key={et} className="text-center">
                <p className="text-gray-500 text-xs mb-1">{EVENT_ABBREVIATIONS[et]}</p>
                <p className={`font-bold text-sm ${byEvent[et] !== undefined ? 'text-white' : 'text-gray-600'}`}>
                  {byEvent[et] !== undefined ? byEvent[et]!.toFixed(2) : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVideoHighlight = () => {
    if (!post.videoUrl) return null;

    return (
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
        <video
          src={post.videoUrl}
          controls={isVideoPlaying}
          className="w-full h-full object-cover"
          poster={post.imageUrl}
          onPlay={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
        />
        {!isVideoPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <button
              onClick={(e) => {
                const video = e.currentTarget.parentElement?.querySelector('video');
                video?.play();
              }}
              className="w-16 h-16 rounded-full bg-[#5EFF6E] text-[#0a0a0a] flex items-center justify-center shadow-lg shadow-[#5EFF6E]/30 hover:scale-110 transition-transform"
            >
              <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
        {/* Video badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#5EFF6E]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14V10z" />
            <rect x="3" y="6" width="12" height="12" rx="2" />
          </svg>
          <span className="text-white text-xs font-semibold">Highlight</span>
        </div>
      </div>
    );
  };

  return (
    <article className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden hover:border-[#2a2a2a] transition-colors">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3 flex-1 min-w-0">
            <a href={`/athletes/${post.athleteId}`} className="flex-shrink-0">
              {post.author?.profilePictureUrl ? (
                <img
                  src={post.author.profilePictureUrl}
                  alt={post.author.firstName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent hover:ring-[#5EFF6E]/50 transition-all"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center text-sm font-bold ring-2 ring-transparent hover:ring-[#5EFF6E]/50 transition-all">
                  {initials}
                </div>
              )}
            </a>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a href={`/athletes/${post.athleteId}`} className="text-white font-bold hover:text-[#5EFF6E] transition-colors">
                  {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Athlete'}
                </a>
                {milestone && (
                  <span className="text-[#5EFF6E] text-xs">
                    <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(post.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-gray-200 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Milestone Card */}
        {milestone && (
          <div className="mb-4">
            {renderMilestoneCard()}
          </div>
        )}

        {/* Video Highlight */}
        {post.videoUrl && (
          <div className="mb-4">
            {renderVideoHighlight()}
          </div>
        )}

        {/* Image */}
        {post.imageUrl && !post.videoUrl && (
          <div className="rounded-xl overflow-hidden mb-4">
            <img 
              src={post.imageUrl} 
              alt="Post" 
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Score Tile / Meet Card */}
        {post.postType === 'SCORE_TILE' && (
          <div className="mb-4">
            {renderMeetCard()}
          </div>
        )}

        {/* Engagement Actions */}
        <div className="flex items-center gap-1 pt-2 border-t border-[#1f1f1f]">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isLiked 
                ? 'text-red-500 bg-red-500/10' 
                : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">{likeCount}</span>
          </button>
          <button
            onClick={() => onComment?.(post.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:text-[#5EFF6E] hover:bg-[#5EFF6E]/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button
            onClick={() => onShare?.(post.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:text-[#5EFF6E] hover:bg-[#5EFF6E]/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
