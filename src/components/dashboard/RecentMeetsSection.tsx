'use client';

import { CompetitionResult, EventType } from '@/lib/api/competitions';

interface RecentMeetsSectionProps {
  results: CompetitionResult[];
}

export function RecentMeetsSection({ results }: RecentMeetsSectionProps) {
  // Group results by meet
  const grouped = new Map<string, CompetitionResult[]>();
  results.forEach(r => {
    const key = `${r.meetName}|${r.meetDate}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  });

  const recentMeets = Array.from(grouped.values())
    .sort((a, b) => new Date(b[0].meetDate).getTime() - new Date(a[0].meetDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-sm">Recent Meets</h3>
      {recentMeets.length > 0 ? (
        <div className="space-y-3">
          {recentMeets.map((meetResults, idx) => {
            const first = meetResults[0];
            const aaScore = meetResults.find(r => r.eventType === 'ALL_AROUND')?.score;
            return (
              <div key={idx} className="text-sm">
                <p className="text-white font-medium text-sm">{first.meetName}</p>
                <p className="text-gray-500 text-xs mb-2">
                  {new Date(first.meetDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {aaScore && (
                  <p className="text-[#5EFF6E] text-xs font-semibold">
                    AA: {aaScore.toFixed(2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-500 text-xs text-center py-6">
          No meets recorded yet
        </div>
      )}
    </div>
  );
}
