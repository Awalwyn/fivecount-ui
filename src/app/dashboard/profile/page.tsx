'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  createAthleteProfile,
  updateAthleteProfile,
  getAthleteByUserId,
  AthleteProfile,
} from '@/lib/api/athletes';

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

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<AthleteProfile | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

  // Load existing profile if it exists
  useEffect(() => {
    if (!user?.id) return;

    async function loadProfile() {
      try {
        setProfileLoading(true);
        const profile = await getAthleteByUserId(user!.id);
        setExistingProfile(profile);
        setIsEditMode(true);

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
      } catch (error) {
        // No existing profile - set up form with signup data
        setIsEditMode(false);
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

  async function onSubmit(data: ProfileFormData) {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const cleanData = {
        ...data,
        profilePictureUrl: data.profilePictureUrl || undefined,
        instagramHandle: data.instagramHandle || undefined,
      };

      if (isEditMode && existingProfile) {
        await updateAthleteProfile(existingProfile.id, cleanData);
      } else {
        await createAthleteProfile(cleanData);
      }

      router.push('/dashboard/dashboard');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} profile`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="spinner border-[#0a0a0a]"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">
          {isEditMode ? 'Edit Profile' : 'Complete Your Profile'}
        </h1>
        <p className="text-gray-400">
          {isEditMode ? 'Update your athlete information' : 'Add your details so coaches can find you'}
        </p>
      </div>

      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl">
        {submitError && <div className="error-message mb-6">{submitError}</div>}

        {/* Username Display */}
        {user?.user_metadata?.username && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-[#0a0a0a] border border-[#5EFF6E]/20">
            <span className="text-gray-500 text-sm">Username:</span>
            <span className="text-[#5EFF6E] text-sm font-mono">@{user.user_metadata.username}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">First Name <span className="text-red-500">*</span></label>
              <input {...register('firstName')} type="text" className="input-field" disabled={isSubmitting} />
              {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="input-label">Last Name <span className="text-red-500">*</span></label>
              <input {...register('lastName')} type="text" className="input-field" disabled={isSubmitting} />
              {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Grad Year */}
          <div>
            <label className="input-label">Graduation Year <span className="text-red-500">*</span></label>
            <input {...register('gradYear')} type="number" className="input-field" disabled={isSubmitting} />
            {errors.gradYear && <p className="text-red-400 text-sm mt-1">{errors.gradYear.message}</p>}
          </div>

          {/* Club Name */}
          <div>
            <label className="input-label">Club Name <span className="text-red-500">*</span></label>
            <input {...register('clubName')} type="text" className="input-field" placeholder="e.g., Ohio State Gymnastics" disabled={isSubmitting} />
            {errors.clubName && <p className="text-red-400 text-sm mt-1">{errors.clubName.message}</p>}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="input-label">City <span className="text-red-500">*</span></label>
              <input {...register('city')} type="text" className="input-field" placeholder="Columbus" disabled={isSubmitting} />
              {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="input-label">State <span className="text-red-500">*</span></label>
              <input {...register('state')} type="text" maxLength={2} className="input-field" placeholder="OH" disabled={isSubmitting} />
              {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state.message}</p>}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="input-label">Bio</label>
            <textarea {...register('bio')} className="input-field resize-none" placeholder="Tell coaches about your gymnastics journey..." rows={4} disabled={isSubmitting} />
            {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>}
          </div>

          {/* Profile Picture */}
          <div>
            <label className="input-label">Profile Picture URL</label>
            <input {...register('profilePictureUrl')} type="url" className="input-field" placeholder="https://example.com/photo.jpg (optional)" disabled={isSubmitting} />
            {errors.profilePictureUrl && <p className="text-red-400 text-sm mt-1">{errors.profilePictureUrl.message}</p>}
          </div>

          {/* Instagram */}
          <div>
            <label className="input-label">Instagram Handle</label>
            <div className="flex items-center">
              <span className="px-3 py-3.5 text-gray-400 bg-[#0a0a0a] border-r-0 border border-[#5EFF6E]/15 rounded-l-lg">@</span>
              <input {...register('instagramHandle')} type="text" className="input-field rounded-l-none" placeholder="yourhandle (optional)" disabled={isSubmitting} />
            </div>
            {errors.instagramHandle && <p className="text-red-400 text-sm mt-1">{errors.instagramHandle.message}</p>}
          </div>

          {/* Commit Status */}
          <div>
            <label className="input-label">Recruiting Status</label>
            <select {...register('commitStatus')} className="input-field" disabled={isSubmitting}>
              <option value="">Not set</option>
              <option value="OPEN">Open to Recruiting</option>
              <option value="VERBALLY_COMMITTED">Verbally Committed</option>
              <option value="SIGNED">Signed</option>
              <option value="NOT_RECRUITING">Not Recruiting</option>
            </select>
            {errors.commitStatus && <p className="text-red-400 text-sm mt-1">{errors.commitStatus.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner border-[#0a0a0a]"></span>
                {isEditMode ? 'Saving...' : 'Creating Profile...'}
              </span>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
