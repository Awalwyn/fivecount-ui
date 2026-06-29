'use client';

import { Heart, MessageCircle, Share, TrendingUp, Trophy, Users } from 'lucide-react';

export function FeedDemo() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-display text-4xl mb-2">Feed</h1>
          <p className="text-[#a0a0a0]">See what&apos;s happening in the men&apos;s gymnastics community</p>
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Main feed - 2/3 width */}
          <div className="col-span-2 space-y-6">
            <h2 className="text-lg font-semibold mb-4">Latest Posts</h2>
            {[
              {
                id: '1',
                author: 'Marcus Johnson',
                avatarInitials: 'MJ',
                timestamp: '2 hours ago',
                type: 'REGULAR',
                content: 'Just landed a new vault progression! Feeling confident going into regionals. 🙌',
                likes: 234,
                comments: 18,
              },
              {
                id: '2',
                author: 'Michael Rodriguez',
                avatarInitials: 'MR',
                timestamp: '1 day ago',
                type: 'SCORE_TILE',
                meetName: 'West Coast Classic',
                meetDate: 'Mar 15',
                scores: {
                  'VAULT': 15.4,
                  'FLOOR': 14.8,
                  'POMMEL_HORSE': 13.6,
                  'RINGS': 14.2,
                  'PARALLEL_BARS': 13.8,
                  'HIGH_BAR': 14.1,
                  'AA': 85.9,
                },
                likes: 456,
                comments: 32,
              },
              {
                id: '3',
                author: 'Andrew Thompson',
                avatarInitials: 'AT',
                timestamp: '2 days ago',
                type: 'REGULAR',
                content: 'Floor routine hitting different today 💪 Ready for nationals!',
                likes: 189,
                comments: 15,
              },
            ].map((post) => (
              <div
                key={post.id}
                className="bg-[#111111] border border-[#1f1f1f] rounded-lg overflow-hidden hover:border-[#5EFF6E] transition-colors"
              >
                {/* Post header */}
                <div className="p-6 border-b border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#5EFF6E] flex items-center justify-center text-lg font-bold text-[#0a0a0a]">
                      {post.avatarInitials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{post.author}</p>
                      <p className="text-xs text-[#a0a0a0]">{post.timestamp}</p>
                    </div>
                  </div>
                </div>

                {/* Post content */}
                <div className="p-6">
                  {post.type === 'REGULAR' && (
                    <p className="text-[#ffffff] leading-relaxed mb-4">{post.content}</p>
                  )}

                  {post.type === 'SCORE_TILE' && (
                    <div className="bg-gradient-to-br from-[#5EFF6E]/10 to-[#0a0a0a] border border-[#5EFF6E]/20 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <p className="text-sm text-[#a0a0a0] mb-2">🏅 Meet Result</p>
                        <p className="heading-display text-2xl">{post.meetName}</p>
                        <p className="text-[#a0a0a0] text-sm">{post.meetDate}</p>
                      </div>

                      {/* Event scores grid */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          { event: 'Vault', score: post.scores?.VAULT },
                          { event: 'Floor', score: post.scores?.FLOOR },
                          { event: 'Pommel', score: post.scores?.POMMEL_HORSE },
                          { event: 'Rings', score: post.scores?.RINGS },
                          { event: 'P-Bars', score: post.scores?.PARALLEL_BARS },
                          { event: 'H-Bar', score: post.scores?.HIGH_BAR },
                        ].map((e) => (
                          <div key={e.event} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded p-2 text-center">
                            <p className="text-xs text-[#a0a0a0] mb-1">{e.event}</p>
                            <p className="text-[#5EFF6E] font-semibold text-sm">{e.score}</p>
                          </div>
                        ))}
                      </div>

                      {/* AA Score highlight */}
                      <div className="bg-[#0a0a0a] border border-[#5EFF6E] rounded p-3 text-center">
                        <p className="text-xs text-[#a0a0a0] mb-1">All-Around</p>
                        <p className="heading-display text-2xl text-[#5EFF6E]">{post.scores?.AA}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Engagement */}
                <div className="px-6 py-4 border-t border-[#1f1f1f] flex items-center justify-between text-[#a0a0a0]">
                  <button className="flex items-center gap-2 hover:text-[#5EFF6E] transition-colors text-sm">
                    <Heart size={16} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-2 hover:text-[#5EFF6E] transition-colors text-sm">
                    <MessageCircle size={16} /> {post.comments}
                  </button>
                  <button className="flex items-center gap-2 hover:text-[#5EFF6E] transition-colors text-sm">
                    <Share size={16} /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Trending Meets Widget */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#5EFF6E]" /> Trending Meets
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'State Qualifier', date: '2026-03-15', athletes: 156 },
                  { name: 'West Coast Classic', date: '2026-03-12', athletes: 342 },
                  { name: 'Regional Championship', date: '2026-02-28', athletes: 89 },
                ].map((meet, idx) => (
                  <div key={idx} className="pb-3 border-b border-[#1f1f1f] last:border-0 cursor-pointer hover:text-[#5EFF6E] transition-colors">
                    <p className="text-sm font-semibold">{meet.name}</p>
                    <p className="text-xs text-[#a0a0a0]">{meet.athletes} athletes competed</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Scorers Widget */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-[#5EFF6E]" /> Top Scorers
              </h3>
              <div className="space-y-3">
                {[
                  { rank: '1', name: 'Andrew Thompson', score: 86.7, meet: 'West Coast Classic' },
                  { rank: '2', name: 'Michael Rodriguez', score: 85.9, meet: 'Regional Championship' },
                  { rank: '3', name: 'Marcus Johnson', score: 81.9, meet: 'State Qualifier Meet' },
                ].map((athlete) => (
                  <div key={athlete.rank} className="flex items-center justify-between pb-3 border-b border-[#1f1f1f] last:border-0 cursor-pointer hover:text-[#5EFF6E] transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">#{athlete.rank}</p>
                      <p className="text-xs text-[#a0a0a0]">{athlete.name}</p>
                      <p className="text-xs text-[#a0a0a0]">{athlete.meet}</p>
                    </div>
                    <span className="text-[#5EFF6E] font-semibold">{athlete.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Athletes Widget */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Users size={16} className="text-[#5EFF6E]" /> Suggested
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Brandon Lopez', year: 2026, state: 'TX', level: 'Level 10' },
                  { name: 'Tyler Richardson', year: 2027, state: 'NV', level: 'Transfer Portal' },
                  { name: 'Justin Taylor', year: 2027, state: 'CO', level: 'Level 10' },
                ].map((athlete) => (
                  <div key={athlete.name} className="border border-[#1f1f1f] rounded p-3 hover:border-[#5EFF6E] transition-colors cursor-pointer">
                    <p className="text-sm font-semibold">{athlete.name}</p>
                    <p className="text-xs text-[#a0a0a0]">Class of {athlete.year} • {athlete.state}</p>
                    <p className="text-xs text-[#5EFF6E] mt-2">{athlete.level}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
