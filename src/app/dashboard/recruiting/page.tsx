'use client';

import { PipelineBoard } from '@/components/coach/PipelineBoard';

export default function RecruitingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-white mb-2">Recruiting Pipeline</h1>
        <p className="text-gray-400">Drag prospects between stages to update their status</p>
      </div>

      <PipelineBoard />
    </div>
  );
}
