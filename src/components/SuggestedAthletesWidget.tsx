'use client';

import { useState } from 'react';
import { SuggestedAthlete } from '@/lib/api/suggestions';

interface SuggestedAthletesWidgetProps {
  athletes: SuggestedAthlete[];
  isLoading: boolean;
}

export function SuggestedAthletesWidget({ athletes, isLoading }: SuggestedAthletesWidgetProps) {
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const handleFollow = (athleteId: string) => {
    setFollowing(prev => {
      const newSet = new Set(prev);
      if (newSet.has(athleteId)) {
        newSet.delete(athleteId);
      } else {
        newSet.add(athleteId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4">
        <h3 className="text-white font-semibold text-sm mb-4">SUGGESTED ATHLETES</h3>
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
      <h3 className="text-white font-semibold text-sm mb-4">SUGGESTED ATHLETES</h3>
      <div className="space-y-3">
        {athletes.slice(0, 4).map(athlete => (
          <div key={athlete.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {athlete.profilePictureUrl ? (
                <img
                  src={athlete.profilePictureUrl}
                  alt={athlete.firstName}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-[#1f1f1f] text-[#5EFF6E] flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  {athlete.firstName[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {athlete.firstName} {athlete.lastName}
                </p>
                {athlete.clubName && (
                  <p className="text-gray-500 text-xs truncate">{athlete.clubName}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleFollow(athlete.id)}
              className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                following.has(athlete.id)
                  ? 'bg-[#1f1f1f] text-gray-300'
                  : 'bg-[#5EFF6E] text-black hover:bg-[#4de658]'
              }`}
            >
              {following.has(athlete.id) ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
      <button className="w-full text-center text-gray-400 hover:text-gray-300 text-xs mt-4 py-2">
        See more suggestions
      </button>
    </div>
  );
}
