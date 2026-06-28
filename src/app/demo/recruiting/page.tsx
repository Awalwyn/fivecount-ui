'use client';

import { useDemo } from '@/components/demo/DemoContext';
import { RecruitingDemo } from '@/components/demo/pages/RecruitingDemo';

export default function DemoRecruiting() {
  const { role } = useDemo();

  if (role === 'ATHLETE') {
    return (
      <div className="p-8">
        <h1 className="heading-display text-4xl mb-4">Recruiting</h1>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-8 text-center max-w-md">
          <p className="text-[#a0a0a0] mb-4">This section is only available to coaches.</p>
          <p className="text-sm text-[#a0a0a0]">As an athlete, focus on building your profile and posting your best scores to attract coaches.</p>
        </div>
      </div>
    );
  }

  return <RecruitingDemo />;
}
