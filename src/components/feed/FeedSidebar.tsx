'use client';

import { useState } from 'react';

// Mock data - will be replaced with real API calls
const TRENDING_MEETS = [
  { id: '1', name: 'Winter Cup 2024', date: '2024-02-15', athletes: 124 },
  { id: '2', name: 'Texas State Championships', date: '2024-02-10', athletes: 89 },
  { id: '3', name: 'California Classic', date: '2024-02-08', athletes: 156 },
];

const SUGGESTED_ATHLETES = [
  { id: '1', name: 'Marcus Chen', level: 'Level 10', school: 'Stanford', avatar: null },
  { id: '2', name: 'Jake Williams', level: 'Level 10', school: 'Oklahoma', avatar: null },
  { id: '3', name: 'Tyler Brooks', level: 'Elite', school: 'Michigan', avatar: null },
];

const TOP_AA_SCORES_WEEK = [
  { id: '1', athlete: 'Marcus Chen', school: 'Stanford', score: 86.450, change: '+1.2' },
  { id: '2', athlete: 'Jake Williams', school: 'Oklahoma', score: 85.900, change: '+0.8' },
  { id: '3', athlete: 'Tyler Brooks', school: 'Michigan', score: 85.650, change: '+0.5' },
  { id: '4', athlete: 'Ryan Martinez', school: 'Penn State', score: 85.200, change: 'new' },
  { id: '5', athlete: 'Chris Johnson', school: 'Ohio State', score: 84.850, change: '+0.3' },
];

export function FeedSidebar() {
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const toggleFollow = (id: string) => {
    setFollowedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <aside className="w-80 flex-shrink-0 space-y-4">
      {/* Trending Meets */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#5EFF6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="text-white font-bold text-sm uppercase tracking-wide">Trending Meets</h3>
        </div>
        <div className="space-y-3">
          {TRENDING_MEETS.map((meet, index) => (
            <button
              key={meet.id}
              className="w-full text-left group hover:bg-[#1f1f1f] rounded-lg p-2 -mx-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-[#5EFF6E] font-bold text-lg w-5">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate group-hover:text-[#5EFF6E] transition-colors">
                    {meet.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(meet.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {meet.athletes} athletes
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button className="text-[#5EFF6E] text-xs font-semibold mt-3 hover:underline">
          See all meets
        </button>
      </div>

      {/* Top Scores This Week */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#5EFF6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-white font-bold text-sm uppercase tracking-wide">Top Scores This Week</h3>
        </div>
        <div className="space-y-2">
          {TOP_SCORES_WEEK.map((score, index) => (
            <div
              key={score.id}
              className="flex items-center gap-3 py-2 border-b border-[#1f1f1f] last:border-0"
            >
              <span className={`font-bold text-sm w-5 ${index < 3 ? 'text-[#5EFF6E]' : 'text-gray-500'}`}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{score.athlete}</p>
                <p className="text-gray-500 text-xs">{score.event}</p>
              </div>
              <div className="text-right">
                <p className="text-[#5EFF6E] font-bold text-sm">{score.score.toFixed(3)}</p>
                <p className={`text-xs ${score.change === 'new' ? 'text-blue-400' : 'text-green-400'}`}>
                  {score.change === 'new' ? 'NEW' : score.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Athletes */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[#5EFF6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h3 className="text-white font-bold text-sm uppercase tracking-wide">Suggested Athletes</h3>
        </div>
        <div className="space-y-4">
          {SUGGESTED_ATHLETES.map(athlete => {
            const isFollowing = followedIds.includes(athlete.id);
            return (
              <div key={athlete.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[#5EFF6E] font-bold text-sm flex-shrink-0">
                  {athlete.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{athlete.name}</p>
                  <p className="text-gray-500 text-xs truncate">{athlete.level} · {athlete.school}</p>
                </div>
                <button
                  onClick={() => toggleFollow(athlete.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isFollowing
                      ? 'bg-[#1f1f1f] text-gray-400 hover:text-white'
                      : 'bg-[#5EFF6E] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#5EFF6E]/20'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
        <button className="text-[#5EFF6E] text-xs font-semibold mt-4 hover:underline">
          See more suggestions
        </button>
      </div>

      {/* Footer Links */}
      <div className="text-xs text-gray-600 space-x-2">
        <a href="#" className="hover:text-gray-400">About</a>
        <span>·</span>
        <a href="#" className="hover:text-gray-400">Help</a>
        <span>·</span>
        <a href="#" className="hover:text-gray-400">Privacy</a>
        <span>·</span>
        <a href="#" className="hover:text-gray-400">Terms</a>
        <p className="mt-2">© 2024 FiveCount</p>
      </div>
    </aside>
  );
}
