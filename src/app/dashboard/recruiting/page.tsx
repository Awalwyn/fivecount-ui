'use client';

import { useState, useEffect } from 'react';
import { getProspects, PipelineStage, Prospect } from '@/lib/api/recruiting';
import { PipelineBoard } from '@/components/coach/PipelineBoard';

export default function RecruitingPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProspects()
      .then(setProspects)
      .finally(() => setLoading(false));
  }, []);

  const handleStageChange = (prospectId: string, stage: PipelineStage) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, stage } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="heading-display text-4xl text-white mb-2">Recruiting Pipeline</h1>
          <p className="text-gray-400">
            Track prospects through your recruiting stages. Drag cards to update their status.
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-[#5EFF6E]">{prospects.length}</p>
          <p className="text-gray-500 text-xs uppercase tracking-wide">Total Prospects</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="spinner" />
        </div>
      ) : (
        <PipelineBoard prospects={prospects} onStageChange={handleStageChange} />
      )}
    </div>
  );
}
