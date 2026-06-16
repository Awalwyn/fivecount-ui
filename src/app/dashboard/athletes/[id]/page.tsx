'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAthleteDetail, AthleteDetail } from '@/lib/api/athletes';
import { ContactAthleteModal } from '@/components/ContactAthleteModal';

export default function AthleteDetailPage() {
  const { role } = useAuth();
  const params = useParams();
  const athleteId = params.id as string;
  const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const loadAthlete = async () => {
      try {
        setLoading(true);
        const data = await getAthleteDetail(athleteId);
        setAthlete(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load athlete');
      } finally {
        setLoading(false);
      }
    };

    loadAthlete();
  }, [athleteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="spinner border-[#5EFF6E]"></span>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="heading-display text-4xl text-white mb-2">Athlete not found</h1>
          <p className="text-gray-400">{error || 'This athlete profile doesn\'t exist'}</p>
        </div>
      </div>
    );
  }

  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <div className="bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a0a0a] h-48 md:h-56 rounded-t-xl" />

      {/* Profile Header */}
      <div className="px-6 pb-6 -mt-20">
        <div className="flex gap-6 mb-8">
          {/* Avatar */}
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#111111] bg-[#1f1f1f] text-[#5EFF6E] heading-display text-4xl flex items-center justify-center flex-shrink-0">
            {initials}
          </div>

          {/* Name & Info */}
          <div className="flex-1 pt-4">
            <h1 className="heading-display text-3xl md:text-4xl text-white mb-2">
              {athlete.firstName} {athlete.lastName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>📍 {athlete.city}, {athlete.state}</span>
              <span>•</span>
              <span>Class of {athlete.gradYear}</span>
            </div>
            <p className="text-[#5EFF6E] text-sm font-medium mb-3">{athlete.clubName}</p>
            {athlete.bio && <p className="text-gray-400 text-sm max-w-lg mb-6">{athlete.bio}</p>}

            {/* Coach Reach Out Button */}
            {role === 'COACH' && (
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="bg-[#5EFF6E] text-black hover:bg-[#4ee65d] px-4 py-2 rounded-lg text-sm font-medium"
              >
                Contact {athlete.firstName}
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex justify-between items-center pb-6 border-b border-[#1f1f1f]">
          <div className="text-center">
            <p className="text-[#5EFF6E] text-2xl font-bold">{athlete.allAroundAvg?.toFixed(2) ?? '—'}</p>
            <p className="text-xs text-gray-500">AA Average</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">{athlete.level ?? '—'}</p>
            <p className="text-xs text-gray-500">Level</p>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-bold">{athlete.gpa ?? '—'}</p>
            <p className="text-xs text-gray-500">GPA</p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactAthleteModal
        isOpen={isContactModalOpen}
        athleteId={athleteId}
        athleteName={athlete.firstName}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
