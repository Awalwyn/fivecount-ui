'use client';

import { useDemo } from '@/components/demo/DemoContext';
import { AthleteDemo } from '@/components/demo/pages/AthleteDemo';
import { CoachDemo } from '@/components/demo/pages/CoachDemo';

export default function DemoDashboard() {
  const { role } = useDemo();
  return role === 'COACH' ? <CoachDemo /> : <AthleteDemo />;
}
