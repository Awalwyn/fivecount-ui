'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { createCoachProfile, updateCoachProfile, CoachProfile } from '@/lib/api/coaches';

const coachProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  program: z.string().min(1, 'University name is required').max(100),
  position: z.string().min(1, 'Position is required').max(100),
  email: z.string().email('Valid email required').refine(
    (email) => email.endsWith('.edu'),
    'Must use a .edu email address'
  ),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().or(z.literal('')),
  city: z.string().max(50).optional().or(z.literal('')),
  state: z.string().max(2).optional().or(z.literal('')),
});

type CoachProfileFormData = z.infer<typeof coachProfileSchema>;

interface CoachProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: CoachProfile) => void;
  existingProfile?: CoachProfile | null;
}

export function CoachProfileFormModal({
  isOpen,
  onClose,
  onSuccess,
  existingProfile = null,
}: CoachProfileFormModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = existingProfile !== null && existingProfile !== undefined;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(coachProfileSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      program: '',
      position: '',
      email: '',
      bio: '',
      city: '',
      state: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && existingProfile) {
      reset({
        firstName: existingProfile.firstName || '',
        lastName: existingProfile.lastName || '',
        program: existingProfile.program || '',
        position: existingProfile.position || '',
        email: existingProfile.email || user?.email || '',
        bio: existingProfile.bio || '',
        city: existingProfile.city || '',
        state: existingProfile.state || '',
      });
    } else {
      reset({
        firstName: user?.user_metadata?.firstName || '',
        lastName: user?.user_metadata?.lastName || '',
        program: '',
        position: '',
        email: user?.email || '',
        bio: '',
        city: '',
        state: '',
      });
    }
  }, [isOpen, isEditMode, existingProfile, user, reset]);

  async function onSubmit(data: CoachProfileFormData) {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const cleanData = {
        firstName: data.firstName,
        lastName: data.lastName,
        program: data.program,
        position: data.position,
        email: data.email,
        bio: data.bio || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
      };

      let result: CoachProfile;
      if (isEditMode && existingProfile) {
        result = await updateCoachProfile(cleanData);
      } else {
        result = await createCoachProfile(cleanData);
      }

      // Update Supabase user metadata with new name
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        });
      } catch (supabaseError) {
        console.error('Failed to update Supabase metadata:', supabaseError);
      }

      onSuccess(result);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-display text-2xl text-white">
            {isEditMode ? 'Edit Coach Profile' : 'Complete Your Coach Profile'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {submitError && <div className="bg-red-950/20 border border-red-700/30 rounded-lg p-3 mb-6 text-red-400 text-sm">{submitError}</div>}

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

          {/* Program & Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">University <span className="text-red-500">*</span></label>
              <input {...register('program')} type="text" className="input-field" placeholder="e.g., Stanford University" disabled={isSubmitting} />
              {errors.program && <p className="text-red-400 text-sm mt-1">{errors.program.message}</p>}
            </div>
            <div>
              <label className="input-label">Position <span className="text-red-500">*</span></label>
              <input {...register('position')} type="text" className="input-field" placeholder="e.g., Head Coach" disabled={isSubmitting} />
              {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="input-label">Email (.edu) <span className="text-red-500">*</span></label>
            <input {...register('email')} type="email" className="input-field" placeholder="coach@university.edu" disabled={isSubmitting} />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="input-label">Bio</label>
            <textarea {...register('bio')} className="input-field resize-none" placeholder="Tell athletes about your program..." rows={3} disabled={isSubmitting} />
            {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio.message}</p>}
          </div>

          {/* City & State */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="input-label">City</label>
              <input {...register('city')} type="text" className="input-field" disabled={isSubmitting} />
              {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="input-label">State</label>
              <input {...register('state')} type="text" maxLength={2} className="input-field" placeholder="CA" disabled={isSubmitting} />
              {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state.message}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner border-[#0a0a0a]"></span>
                  {isEditMode ? 'Saving...' : 'Completing...'}
                </span>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Complete Profile'
              )}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
