'use client';

import { useState } from 'react';

export interface Award {
  id: string;
  title: string;
  year: number;
}

interface AwardsSectionProps {
  awards?: Award[];
  onAddAward?: () => void;
  isEditable?: boolean;
}

export function AwardsSection({ awards = [], onAddAward, isEditable = false }: AwardsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Awards & Achievements</h3>
        {isEditable && (
          <button
            onClick={onAddAward}
            className="text-[#5EFF6E] hover:text-[#4de658] text-xs font-medium transition-colors"
          >
            + Add Achievement
          </button>
        )}
      </div>

      {awards.length > 0 ? (
        <div className="space-y-3">
          {awards.map(award => (
            <div key={award.id} className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-white text-sm font-medium">{award.title}</p>
                <p className="text-gray-500 text-xs">{award.year}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-xs text-center py-6">
          {isEditable ? 'Add your achievements to showcase your accomplishments' : 'No achievements yet'}
        </div>
      )}
    </div>
  );
}
