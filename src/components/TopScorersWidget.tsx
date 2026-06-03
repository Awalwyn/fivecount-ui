'use client';

import { LeaderboardEntry } from '@/lib/api/leaderboard';

interface TopScorersWidgetProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
}

export function TopScorersWidget({ entries, isLoading }: TopScorersWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
        <h3 className="text-white font-semibold text-sm mb-4">TOP SCORERS THIS WEEK</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-[#1f1f1f] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
      <h3 className="text-white font-semibold text-sm mb-4">TOP SCORERS THIS WEEK</h3>
      <div className="space-y-2">
        {entries.slice(0, 10).map(entry => (
          <div
            key={entry.athleteId}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2 flex-1">
              {entry.profilePictureUrl ? (
                <img
                  src={entry.profilePictureUrl}
                  alt={entry.firstName}
                  className="w-6 h-6 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  {entry.firstName[0]}
                </div>
              )}
              <span className="text-gray-300">
                {entry.firstName} {entry.lastName}
              </span>
            </div>
            <span className="text-[#5EFF6E] font-bold ml-2">{entry.score.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
