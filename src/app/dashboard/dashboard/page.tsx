'use client';

import { useAuth } from '@/hooks/useAuth';
import { AthleteDashboard } from '@/components/athlete/AthleteDashboard';
import { CoachDashboard } from '@/components/coach/CoachDashboard';

export default function DashboardPage() {
  const { role } = useAuth();

  if (role === 'COACH') {
    return <CoachDashboard />;
  }

  return <AthleteDashboard />;
}
