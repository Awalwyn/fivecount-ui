'use client';

import { CompetitionResult, EventType } from '@/lib/api/competitions';

const EVENTS: { type: EventType; label: string }[] = [
  { type: 'FLOOR', label: 'Floor' },
  { type: 'POMMEL_HORSE', label: 'Pommel Horse' },
  { type: 'RINGS', label: 'Rings' },
  { type: 'VAULT', label: 'Vault' },
  { type: 'PARALLEL_BARS', label: 'Parallel Bars' },
  { type: 'HIGH_BAR', label: 'High Bar' },
];

interface PersonalBestsSectionProps {
  results: CompetitionResult[];
}

export function PersonalBestsSection({ results }: PersonalBestsSectionProps) {
  const getBestScore = (eventType: EventType): number | null => {
    const scores = results
      .filter(r => r.eventType === eventType)
      .map(r => r.score);
    return scores.length > 0 ? Math.max(...scores) : null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-sm">Personal Bests</h3>
      <div className="space-y-3">
        {EVENTS.map(event => {
          const bestScore = getBestScore(event.type);
          return (
            <div key={event.type} className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">{event.label}</p>
              <p className="text-[#5EFF6E] font-semibold text-sm">
                {bestScore ? bestScore.toFixed(2) : '—'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
