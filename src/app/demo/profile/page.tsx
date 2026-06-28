'use client';

import { useDemo } from '@/components/demo/DemoContext';
import { AthleteProfileDemo } from '@/components/demo/pages/AthleteProfileDemo';
import { CoachProfileDemo } from '@/components/demo/pages/CoachProfileDemo';

export default function DemoProfile() {
  const { role } = useDemo();
  return role === 'COACH' ? <CoachProfileDemo /> : <AthleteProfileDemo />;
}
