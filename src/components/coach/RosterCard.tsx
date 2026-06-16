'use client';

import { StatCard } from './StatCard';

interface RosterCardProps {
  committed: number;
  avgScore: number;
  bestScore: number;
  bestScoreAthlete?: string;
  incoming: number;
}

export function RosterCard({
  committed,
  avgScore,
  bestScore,
  bestScoreAthlete,
  incoming,
}: RosterCardProps) {
  return (
    <StatCard label="Committed Roster" size="large">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-400">Total Committed</p>
          <p className="text-3xl font-bold text-white">{committed}</p>
        </div>

        <div className="pt-2 border-t border-[#2f2f2f]">
          <p className="text-xs font-medium text-gray-400">Avg All-Around</p>
          <p className="text-2xl font-bold text-[#5EFF6E]">{avgScore.toFixed(2)}</p>
        </div>

        <div className="pt-2 border-t border-[#2f2f2f]">
          <p className="text-xs font-medium text-gray-400">Highest Score</p>
          <p className="text-2xl font-bold text-white">{bestScore.toFixed(2)}</p>
          {bestScoreAthlete && <p className="text-xs text-gray-500 mt-1">{bestScoreAthlete}</p>}
        </div>

        <div className="pt-2 border-t border-[#2f2f2f]">
          <p className="text-xs font-medium text-gray-400">Incoming (Verbally Committed/Signed)</p>
          <p className="text-2xl font-bold text-[#5EFF6E]">+{incoming}</p>
        </div>
      </div>
    </StatCard>
  );
}
