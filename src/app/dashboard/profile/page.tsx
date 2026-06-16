'use client';

import { useAuth } from '@/hooks/useAuth';
import { AthleteProfilePage } from '@/components/athlete/AthleteProfilePage';
import { CoachProfile } from '@/components/coach/CoachProfile';

export default function ProfilePage() {
  const { role } = useAuth();

  if (role === 'COACH') {
    return <CoachProfile />;
  }

  return <AthleteProfilePage />;
}
