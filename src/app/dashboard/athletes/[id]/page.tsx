'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addProspect } from '@/lib/api/recruiting';
import Link from 'next/link';

interface AthleteDetail {
  id: string;
  firstName: string;
  lastName: string;
  gradYear?: number;
  state?: string;
  city?: string;
  gpa?: number;
  level?: string;
  club?: string;
  bio?: string;
  topEvents?: Array<{ event: string; averageScore: number }>;
  allAroundAvg?: number;
  recruitingStatus: string;
}

export default function CoachAthleteDetailPage() {
  const params = useParams();
  const athleteId = params.id as string;
  const { user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingProspect, setIsAddingProspect] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!athleteId) return;

    async function loadAthleteDetail() {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Call getAthleteDetail(athleteId) when available
        // For now, we'll show a placeholder
        const mockAthlete: AthleteDetail = {
          id: athleteId,
          firstName: 'Sarah',
          lastName: 'Martinez',
          gradYear: 2026,
          state: 'CA',
          city: 'Los Angeles',
          gpa: 3.8,
          level: 'Level 10',
          club: 'UCLA Gymnastics Club',
          bio: 'Passionate gymnast focused on vault and floor exercise.',
          topEvents: [
            { event: 'VAULT', averageScore: 15.2 },
            { event: 'FLOOR', averageScore: 14.8 },
            { event: 'ALL_AROUND', averageScore: 14.8 },
          ],
          allAroundAvg: 14.8,
          recruitingStatus: 'OPEN_TO_RECRUITING',
        };

        setAthlete(mockAthlete);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load athlete details');
      } finally {
        setIsLoading(false);
      }
    }

    loadAthleteDetail();
  }, [athleteId]);

  const handleAddProspect = async () => {
    if (!athlete) return;

    try {
      setIsAddingProspect(true);
      await addProspect(athlete.id);
      setSuccessMessage('Added to recruiting pipeline!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add prospect');
    } finally {
      setIsAddingProspect(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="bg-red-950/20 border border-red-700/30 rounded-lg p-6 text-red-400">
        {error || 'Athlete not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="heading-display text-4xl text-white mb-2">
            {athlete.firstName} {athlete.lastName}
          </h1>
          <p className="text-gray-400">
            {athlete.club} • Class of {athlete.gradYear}
            {athlete.state && ` • ${athlete.state}`}
          </p>
        </div>
        {athlete.recruitingStatus === 'OPEN_TO_RECRUITING' && (
          <button
            onClick={handleAddProspect}
            disabled={isAddingProspect}
            className="btn-primary"
          >
            {isAddingProspect ? 'Adding...' : 'Add to Pipeline'}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-green-950/20 border border-green-700/30 rounded-lg p-3 text-green-400 text-sm">
          {successMessage}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg p-4">
          <p className="text-gray-500 text-sm mb-1">GPA</p>
          <p className="text-2xl font-bold text-white">{athlete.gpa || '—'}</p>
        </div>
        <div className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg p-4">
          <p className="text-gray-500 text-sm mb-1">Level</p>
          <p className="text-2xl font-bold text-white">{athlete.level || '—'}</p>
        </div>
      </div>

      {/* Bio */}
      {athlete.bio && (
        <div className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg p-6">
          <h2 className="heading-display text-lg text-white mb-3">About</h2>
          <p className="text-gray-300">{athlete.bio}</p>
        </div>
      )}

      {/* Events */}
      {athlete.topEvents && athlete.topEvents.length > 0 && (
        <div className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg p-6">
          <h2 className="heading-display text-lg text-white mb-4">Events</h2>
          <div className="space-y-2">
            {athlete.topEvents.map((event) => (
              <div key={event.event} className="flex items-center justify-between py-2">
                <span className="text-gray-300">{event.event}</span>
                <span className="text-[#5EFF6E] font-semibold">{event.averageScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/dashboard/recruiting" className="text-gray-400 hover:text-white transition-colors">
        ← Back to Recruiting
      </Link>
    </div>
  );
}
