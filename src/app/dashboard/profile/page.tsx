'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAthleteProfile } from '@/lib/api/athletes';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  gradYear: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => val >= 2020 && val <= 2050, 'Grad year must be between 2020 and 2050'),
  clubName: z.string().min(1, 'Club name is required').max(100),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(2),
  bio: z.string().max(500, 'Bio must be 500 characters or less'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gradYear: new Date().getFullYear(),
      clubName: '',
      city: '',
      state: '',
      bio: '',
    },
  });

  async function onSubmit(data: ProfileFormData) {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await createAthleteProfile(data);
      router.push('/dashboard/dashboard');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create profile'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Profile</h1>
        <p className="text-gray-400">Create your athlete profile</p>
      </div>

      <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 max-w-2xl">
        {submitError && (
          <div className="error-message mb-6">{submitError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">First Name</label>
              <input
                {...register('firstName')}
                type="text"
                className="input-field"
                placeholder="John"
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="input-label">Last Name</label>
              <input
                {...register('lastName')}
                type="text"
                className="input-field"
                placeholder="Doe"
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Grad Year */}
          <div>
            <label className="input-label">Graduation Year</label>
            <input
              {...register('gradYear')}
              type="number"
              className="input-field"
              placeholder="2026"
              disabled={isSubmitting}
            />
            {errors.gradYear && (
              <p className="text-red-400 text-sm mt-1">{errors.gradYear.message}</p>
            )}
          </div>

          {/* Club Name */}
          <div>
            <label className="input-label">Club Name</label>
            <input
              {...register('clubName')}
              type="text"
              className="input-field"
              placeholder="e.g., Ohio State Gymnastics"
              disabled={isSubmitting}
            />
            {errors.clubName && (
              <p className="text-red-400 text-sm mt-1">{errors.clubName.message}</p>
            )}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="input-label">City</label>
              <input
                {...register('city')}
                type="text"
                className="input-field"
                placeholder="Columbus"
                disabled={isSubmitting}
              />
              {errors.city && (
                <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <label className="input-label">State</label>
              <input
                {...register('state')}
                type="text"
                maxLength={2}
                className="input-field"
                placeholder="OH"
                disabled={isSubmitting}
              />
              {errors.state && (
                <p className="text-red-400 text-sm mt-1">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="input-label">Bio</label>
            <textarea
              {...register('bio')}
              className="input-field resize-none"
              placeholder="Tell coaches about your gymnastics journey..."
              rows={4}
              disabled={isSubmitting}
            />
            {errors.bio && (
              <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner border-[#0a0a0a]"></span>
                Creating Profile
              </span>
            ) : (
              'Create Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
