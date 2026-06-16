'use client';

import Link from 'next/link';

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  gradYear?: number;
  state?: string;
  topEvents?: Array<{ event: string; averageScore: number }>;
}

interface RecommendedPanelProps {
  athletes: Athlete[];
}

function getTopEvent(athlete: Athlete): { event: string; score: number } | null {
  if (!athlete.topEvents || athlete.topEvents.length === 0) return null;
  const sorted = [...athlete.topEvents].sort((a, b) => b.averageScore - a.averageScore);
  return { event: sorted[0].event, score: sorted[0].averageScore };
}

export function RecommendedPanel({ athletes }: RecommendedPanelProps) {
  if (athletes.length === 0) {
    return (
      <div className="text-center py-8 bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg">
        <p className="text-gray-400 text-sm">No recommendations available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg p-4">
      {athletes.slice(0, 4).map((athlete) => {
        const topEvent = getTopEvent(athlete);
        return (
          <Link
            key={athlete.id}
            href={`/dashboard/athletes/${athlete.id}`}
            className="block p-3 border border-[#2f2f2f] rounded hover:border-[#3f3f3f] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {athlete.firstName} {athlete.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {athlete.gradYear && `Class ${athlete.gradYear}`}
                  {athlete.state && ` • ${athlete.state}`}
                </p>
              </div>
              {topEvent && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{topEvent.event}</p>
                  <p className="text-sm font-semibold text-[#5EFF6E]">{topEvent.score.toFixed(1)}</p>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
