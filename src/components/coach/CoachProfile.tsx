'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCoachProfile, checkProfileCompleteness, CoachProfile as CoachProfileType, ProfileCompletenessResponse } from '@/lib/api/coaches';
import { CoachProfileFormModal } from './CoachProfileFormModal';

export function CoachProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CoachProfileType | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompletenessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);

        const [profileData, completenessData] = await Promise.all([
          getCoachProfile(user!.id),
          checkProfileCompleteness(),
        ]);

        setProfile(profileData);
        setCompleteness(completenessData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-700/30 rounded-lg p-6 text-red-400">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-4">No profile found. Let&apos;s get you started.</p>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary">
          Create Coach Profile
        </button>
        <CoachProfileFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={(newProfile) => {
            setProfile(newProfile);
            setCompleteness({ complete: false, missingFields: [] });
          }}
          existingProfile={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completeness Banner */}
      {completeness && !completeness.complete && (
        <div className="bg-amber-950/20 border border-amber-700/30 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-amber-400 font-medium">Complete Your Profile</p>
              <p className="text-amber-300/80 text-sm mt-1">
                Missing: {completeness.missingFields.join(', ')}
              </p>
            </div>
            <button onClick={() => setIsFormOpen(true)} className="btn-primary flex-shrink-0">
              Complete Now
            </button>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg p-8">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <h1 className="heading-display text-3xl text-white mb-2">
              Coach {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
              <span>{profile.position}</span>
              <span>·</span>
              <span>{profile.program}</span>
            </div>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="btn-secondary">
            Edit Profile
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#2f2f2f]">
          <div>
            <p className="text-gray-500 text-sm mb-1">Email</p>
            <p className="text-white">{profile.email}</p>
          </div>
          {profile.city || profile.state ? (
            <div>
              <p className="text-gray-500 text-sm mb-1">Location</p>
              <p className="text-white">
                {profile.city}
                {profile.city && profile.state && ', '}
                {profile.state}
              </p>
            </div>
          ) : null}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-[#2f2f2f]">
            <p className="text-gray-500 text-sm mb-2">About</p>
            <p className="text-gray-300">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <CoachProfileFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={(updatedProfile) => {
          setProfile(updatedProfile);
          setCompleteness((prev) =>
            prev ? { ...prev, complete: true } : { complete: true, missingFields: [] }
          );
        }}
        existingProfile={profile}
      />
    </div>
  );
}
