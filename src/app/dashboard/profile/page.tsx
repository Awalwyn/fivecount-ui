'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  createAthleteProfile,
  updateAthleteProfile,
  getAthleteByUserId,
  AthleteProfile,
  CommitStatus,
} from '@/lib/api/athletes';
import { getCompetitionResults, CompetitionResult, EventType } from '@/lib/api/competitions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  gradYear: z.coerce.number().refine((val) => val >= 2020 && val <= 2050, 'Grad year must be between 2020 and 2050'),
  clubName: z.string().min(1, 'Club name is required').max(100),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(2),
  bio: z.string().max(500, 'Bio must be 500 characters or less'),
  profilePictureUrl: z.string().refine(
    (val) => !val || /^https?:\/\/.+\..+/.test(val),
    'Must be a valid URL or empty'
  ),
  instagramHandle: z.string().max(30, 'Max 30 characters'),
  commitStatus: z.enum(['OPEN', 'VERBALLY_COMMITTED', 'SIGNED', 'NOT_RECRUITING']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const COMMIT_STATUS_CONFIG: Record<CommitStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open to Recruiting', className: 'text-[#5EFF6E] bg-[#5EFF6E]/10 border border-[#5EFF6E]/30' },
  VERBALLY_COMMITTED: { label: 'Verbally Committed', className: 'text-blue-400 bg-blue-400/10 border border-blue-400/30' },
  SIGNED: { label: 'Signed', className: 'text-purple-400 bg-purple-400/10 border border-purple-400/30' },
  NOT_RECRUITING: { label: 'Not Recruiting', className: 'text-gray-500 bg-gray-500/10 border border-gray-500/30' },
};

interface EventStatData {
  average: number;
  attemptCount: number;
  scoreProgression: Array<{ score: number; date?: string }>;
}

type EventStatsData = Record<EventType, EventStatData>;

export default function ProfilePage() {
  const { user } = useAuth();

  // Profile state
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<AthleteProfile | null>(null);
  const [athleteStats, setAthleteStats] = useState<EventStatsData | null>(null);

  // Results state
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  // UI state
  const [viewMode, setViewMode] = useState(true); // true = view, false = edit/create
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      gradYear: new Date().getFullYear(),
      clubName: '',
      city: '',
      state: '',
      bio: '',
      profilePictureUrl: '',
      instagramHandle: '',
      commitStatus: undefined,
    },
  });

  // Load profile
  useEffect(() => {
    if (!user?.id) return;

    async function loadProfile() {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const profile = await getAthleteByUserId(user!.id);
        setExistingProfile(profile);
        reset({
          firstName: profile.firstName,
          lastName: profile.lastName,
          gradYear: profile.gradYear,
          clubName: profile.clubName,
          city: profile.city,
          state: profile.state,
          bio: profile.bio || '',
          profilePictureUrl: profile.profilePictureUrl || '',
          instagramHandle: profile.instagramHandle || '',
          commitStatus: profile.commitStatus as any,
        });
        setViewMode(true);

        // Load results for chart
        try {
          const compResults = await getCompetitionResults(profile.id);
          setResults(compResults);
        } catch (error) {
          console.error('Failed to load competition results', error);
        }
      } catch (error) {
        setExistingProfile(null);
        setViewMode(false); // Show creation form
        reset({
          firstName: user!.user_metadata?.firstName || '',
          lastName: user!.user_metadata?.lastName || '',
          gradYear: new Date().getFullYear(),
          clubName: '',
          city: '',
          state: '',
          bio: '',
          profilePictureUrl: '',
          instagramHandle: '',
          commitStatus: undefined,
        });
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [user?.id, reset]);

  // Fetch athlete stats from API
  useEffect(() => {
    if (!existingProfile?.id) return;

    async function loadStats() {
      try {
        const response = await fetch(`/api/athletes/${existingProfile!.id}/stats`);
        if (response.ok) {
          const stats = await response.json();
          setAthleteStats(stats);
        }
      } catch (error) {
        console.error('Failed to load athlete stats', error);
      }
    }

    loadStats();
  }, [existingProfile?.id]);

  async function onSubmit(data: ProfileFormData) {
    try {
      setSubmitError(null);

      const cleanData = {
        ...data,
        profilePictureUrl: data.profilePictureUrl || undefined,
        instagramHandle: data.instagramHandle || undefined,
      };

      if (existingProfile) {
        await updateAthleteProfile(existingProfile.id, cleanData);
        setExistingProfile({ ...existingProfile, ...cleanData });
      } else {
        const newProfile = await createAthleteProfile(cleanData);
        setExistingProfile(newProfile);
      }

      setViewMode(true);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save profile');
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="spinner border-[#0a0a0a]"></span>
      </div>
    );
  }

  // Show creation form
  if (!existingProfile && viewMode === true) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-display text-4xl text-white mb-2">Create Your Profile</h1>
          <p className="text-gray-400">Let coaches know about you</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl">
          {submitError && <div className="error-message mb-6">{submitError}</div>}
          {submitSuccess && <div className="success-message mb-6">Profile created successfully!</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">First Name <span className="text-red-500">*</span></label>
                <input {...register('firstName')} type="text" className="input-field" />
                {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="input-label">Last Name <span className="text-red-500">*</span></label>
                <input {...register('lastName')} type="text" className="input-field" />
                {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Grad Year */}
            <div>
              <label className="input-label">Graduation Year <span className="text-red-500">*</span></label>
              <input {...register('gradYear')} type="number" className="input-field" />
              {errors.gradYear && <p className="text-red-400 text-sm mt-1">{errors.gradYear.message}</p>}
            </div>

            {/* Club Name */}
            <div>
              <label className="input-label">Club Name <span className="text-red-500">*</span></label>
              <input {...register('clubName')} type="text" className="input-field" />
              {errors.clubName && <p className="text-red-400 text-sm mt-1">{errors.clubName.message}</p>}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="input-label">City <span className="text-red-500">*</span></label>
                <input {...register('city')} type="text" className="input-field" />
                {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="input-label">State <span className="text-red-500">*</span></label>
                <input {...register('state')} type="text" maxLength={2} className="input-field" />
                {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state.message}</p>}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="input-label">Bio</label>
              <textarea {...register('bio')} className="input-field resize-none" rows={4} />
              {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>}
            </div>

            {/* Profile Picture */}
            <div>
              <label className="input-label">Profile Picture URL</label>
              <input {...register('profilePictureUrl')} type="url" className="input-field" />
              {errors.profilePictureUrl && <p className="text-red-400 text-sm mt-1">{errors.profilePictureUrl.message}</p>}
            </div>

            {/* Instagram */}
            <div>
              <label className="input-label">Instagram Handle</label>
              <div className="flex items-center">
                <span className="px-3 py-3.5 text-gray-400 bg-[#0a0a0a] border-r-0 border border-[#5EFF6E]/15 rounded-l-lg">@</span>
                <input {...register('instagramHandle')} type="text" className="input-field rounded-l-none" />
              </div>
              {errors.instagramHandle && <p className="text-red-400 text-sm mt-1">{errors.instagramHandle.message}</p>}
            </div>

            {/* Commit Status */}
            <div>
              <label className="input-label">Recruiting Status</label>
              <select {...register('commitStatus')} className="input-field">
                <option value="">Not set</option>
                <option value="OPEN">Open to Recruiting</option>
                <option value="VERBALLY_COMMITTED">Verbally Committed</option>
                <option value="SIGNED">Signed</option>
                <option value="NOT_RECRUITING">Not Recruiting</option>
              </select>
              {errors.commitStatus && <p className="text-red-400 text-sm mt-1">{errors.commitStatus.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full">Create Profile</button>
          </form>
        </div>
      </div>
    );
  }

  // View mode
  if (viewMode && existingProfile) {
    const initials = `${existingProfile.firstName[0]}${existingProfile.lastName[0]}`.toUpperCase();
    const bestScore = athleteStats
      ? Math.max(...Object.entries(athleteStats)
          .filter(([event]) => event !== 'ALL_AROUND')
          .flatMap(([, data]) => data.scoreProgression.map(s => s.score)))
      : 0;
    const aaPeak = athleteStats?.ALL_AROUND?.scoreProgression?.[0]?.score || 0;

    return (
      <div className="space-y-8 max-w-4xl">
        {/* Profile Card */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8">
          {/* Header */}
          <div className="flex gap-6 items-start mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {existingProfile.profilePictureUrl ? (
                <img
                  src={existingProfile.profilePictureUrl}
                  alt={existingProfile.firstName}
                  className="w-28 h-28 rounded-xl object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-[#1f1f1f] text-[#5EFF6E] heading-display text-3xl flex items-center justify-center">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="heading-display text-4xl text-white mb-2">{existingProfile.firstName} {existingProfile.lastName}</h1>
              <div className="flex items-center gap-2 mb-3">
                {user?.user_metadata?.username && (
                  <span className="text-gray-400">@{user.user_metadata.username}</span>
                )}
                {existingProfile.instagramHandle && (
                  <a
                    href={`https://instagram.com/${existingProfile.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5EFF6E] hover:underline text-sm"
                  >
                    Instagram
                  </a>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {existingProfile.clubName} · {existingProfile.city}, {existingProfile.state} · Class of {existingProfile.gradYear}
              </p>
              {existingProfile.bio && <p className="text-gray-300 text-sm max-w-lg">{existingProfile.bio}</p>}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-[#1f1f1f]">
            {/* AA Peak */}
            <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
              <p className="text-gray-400 text-xs mb-2">All Around Peak</p>
              <p className="text-[#5EFF6E] text-3xl font-bold">{aaPeak > 0 ? aaPeak.toFixed(2) : '—'}</p>
            </div>

            {/* Best Event */}
            <div className="bg-[#0a0a0a] rounded-lg p-4 text-center">
              <p className="text-gray-400 text-xs mb-2">Best Event Score</p>
              <p className="text-[#5EFF6E] text-3xl font-bold">{bestScore > 0 ? bestScore.toFixed(2) : '—'}</p>
            </div>

            {/* Commit Status */}
            <div className={`rounded-lg p-4 text-center ${existingProfile.commitStatus ? COMMIT_STATUS_CONFIG[existingProfile.commitStatus].className : 'bg-[#0a0a0a] text-gray-400'}`}>
              <p className="text-xs mb-2">Status</p>
              <p className="font-semibold">{existingProfile.commitStatus ? COMMIT_STATUS_CONFIG[existingProfile.commitStatus].label : 'Not set'}</p>
            </div>
          </div>

          {/* Two-column content */}
          <div className="grid grid-cols-3 gap-6">
            {/* Chart */}
            <div className="col-span-2">
              <h2 className="text-body-bold text-lg mb-4 text-white">Score Progression</h2>
              {athleteStats && Object.keys(athleteStats).length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={prepareChartData(athleteStats)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                    <XAxis dataKey="date" stroke="#a0a0a0" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#a0a0a0" tick={{ fontSize: 12 }} domain={[0, 17.5]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1f1f1f' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Legend />
                    {Object.entries(athleteStats)
                      .filter(([event]) => event !== 'ALL_AROUND')
                      .map(([event]) => (
                        <Line
                          key={event}
                          type="monotone"
                          dataKey={event}
                          stroke={event === 'FLOOR' ? '#5EFF6E' : '#8a8a8a'}
                          isAnimationActive={false}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="bg-[#0a0a0a] rounded-lg p-8 text-center text-gray-400">
                  No competition results yet
                </div>
              )}
            </div>

            {/* Recent Meets */}
            <div>
              <h2 className="text-body-bold text-lg mb-4 text-white">Recent Meets</h2>
              <div className="space-y-3">
                {groupResultsByMeet(results).slice(0, 3).map((meet, idx) => (
                  <div key={idx} className="bg-[#0a0a0a] rounded-lg p-4">
                    <p className="text-white text-sm font-semibold">{meet.meetName}</p>
                    <p className="text-gray-400 text-xs mb-2">{new Date(meet.meetDate).toLocaleDateString()}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {['FLOOR', 'POMMEL_HORSE', 'RINGS', 'VAULT', 'PARALLEL_BARS', 'HIGH_BAR'].map((eventType: string) => {
                        const result = meet.eventResults[eventType as EventType];
                        return (
                          <div key={eventType}>
                            <p className="text-gray-500">{eventType.split('_')[0].slice(0, 2)}</p>
                            <p className="text-[#5EFF6E] font-semibold">{result ? result.score.toFixed(2) : '—'}</p>
                          </div>
                        );
                      })}
                    </div>
                    {meet.allAroundScore && (
                      <div className="mt-2 pt-2 border-t border-[#1f1f1f]">
                        <p className="text-[#5EFF6E] text-xs font-bold">AA: {meet.allAroundScore.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <a href="/dashboard/competitions" className="text-[#5EFF6E] hover:underline text-sm mt-3 block">
                View all →
              </a>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-8 pt-8 border-t border-[#1f1f1f]">
            <button onClick={() => setViewMode(false)} className="btn-secondary w-full">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  if (!viewMode && existingProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-display text-4xl text-white mb-2">Edit Profile</h1>
          <p className="text-gray-400">Update your information</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl">
          {submitError && <div className="error-message mb-6">{submitError}</div>}
          {submitSuccess && <div className="success-message mb-6">Profile updated!</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">First Name <span className="text-red-500">*</span></label>
                <input {...register('firstName')} type="text" className="input-field" />
                {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="input-label">Last Name <span className="text-red-500">*</span></label>
                <input {...register('lastName')} type="text" className="input-field" />
                {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Grad Year */}
            <div>
              <label className="input-label">Graduation Year <span className="text-red-500">*</span></label>
              <input {...register('gradYear')} type="number" className="input-field" />
              {errors.gradYear && <p className="text-red-400 text-sm mt-1">{errors.gradYear.message}</p>}
            </div>

            {/* Club Name */}
            <div>
              <label className="input-label">Club Name <span className="text-red-500">*</span></label>
              <input {...register('clubName')} type="text" className="input-field" />
              {errors.clubName && <p className="text-red-400 text-sm mt-1">{errors.clubName.message}</p>}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="input-label">City <span className="text-red-500">*</span></label>
                <input {...register('city')} type="text" className="input-field" />
                {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="input-label">State <span className="text-red-500">*</span></label>
                <input {...register('state')} type="text" maxLength={2} className="input-field" />
                {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state.message}</p>}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="input-label">Bio</label>
              <textarea {...register('bio')} className="input-field resize-none" rows={4} />
              {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>}
            </div>

            {/* Profile Picture */}
            <div>
              <label className="input-label">Profile Picture URL</label>
              <input {...register('profilePictureUrl')} type="url" className="input-field" />
              {errors.profilePictureUrl && <p className="text-red-400 text-sm mt-1">{errors.profilePictureUrl.message}</p>}
            </div>

            {/* Instagram */}
            <div>
              <label className="input-label">Instagram Handle</label>
              <div className="flex items-center">
                <span className="px-3 py-3.5 text-gray-400 bg-[#0a0a0a] border-r-0 border border-[#5EFF6E]/15 rounded-l-lg">@</span>
                <input {...register('instagramHandle')} type="text" className="input-field rounded-l-none" />
              </div>
              {errors.instagramHandle && <p className="text-red-400 text-sm mt-1">{errors.instagramHandle.message}</p>}
            </div>

            {/* Commit Status */}
            <div>
              <label className="input-label">Recruiting Status</label>
              <select {...register('commitStatus')} className="input-field">
                <option value="">Not set</option>
                <option value="OPEN">Open to Recruiting</option>
                <option value="VERBALLY_COMMITTED">Verbally Committed</option>
                <option value="SIGNED">Signed</option>
                <option value="NOT_RECRUITING">Not Recruiting</option>
              </select>
              {errors.commitStatus && <p className="text-red-400 text-sm mt-1">{errors.commitStatus.message}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button type="submit" className="btn-primary flex-1">Save Changes</button>
              <button type="button" onClick={() => setViewMode(true)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

// Helper functions
function groupResultsByMeet(results: CompetitionResult[]) {
  const grouped = new Map<string, CompetitionResult[]>();
  results.forEach((result) => {
    const key = `${result.meetName}|${result.meetDate}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(result);
  });

  return Array.from(grouped.values()).map((meetResults) => {
    const firstResult = meetResults[0];
    const byEvent: Record<EventType, CompetitionResult> = {} as Record<EventType, CompetitionResult>;
    let allAroundResult: CompetitionResult | undefined;

    meetResults.forEach((result) => {
      if (result.eventType === 'ALL_AROUND') {
        allAroundResult = result;
      } else {
        byEvent[result.eventType] = result;
      }
    });

    return {
      meetName: firstResult.meetName,
      meetDate: firstResult.meetDate,
      meetLocation: firstResult.location,
      allAroundScore: allAroundResult?.score,
      eventResults: byEvent,
      allResults: meetResults,
    };
  });
}

function prepareChartData(eventStats: EventStatsData) {
  const allProgression: Array<{ date: string; [key: string]: any }> = [];
  const dateMap = new Map<string, any>();

  Object.entries(eventStats).forEach(([event, data]) => {
    if (event === 'ALL_AROUND') return;
    data.scoreProgression.forEach(({ score, date }) => {
      const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown';
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr });
      }
      dateMap.get(dateStr)![event] = score;
    });
  });

  return Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
