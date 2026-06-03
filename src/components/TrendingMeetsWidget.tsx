'use client';

import { TrendingMeet } from '@/lib/api/meets';

interface TrendingMeetsWidgetProps {
  meets: TrendingMeet[];
  isLoading: boolean;
}

export function TrendingMeetsWidget({ meets, isLoading }: TrendingMeetsWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
        <h3 className="text-white font-semibold text-sm mb-4">TRENDING MEETS</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-[#1f1f1f] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
      <h3 className="text-white font-semibold text-sm mb-4">TRENDING MEETS</h3>
      <div className="space-y-3">
        {meets.slice(0, 5).map((meet, idx) => (
          <div key={meet.id || idx} className="text-sm">
            <p className="text-white font-medium">{meet.name}</p>
            <p className="text-gray-400 text-xs">
              {new Date(meet.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {meet.location && ` · ${meet.location}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
