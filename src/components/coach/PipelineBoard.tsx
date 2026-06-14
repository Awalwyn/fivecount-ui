'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PIPELINE_STAGES, PipelineStage, Prospect } from '@/lib/api/recruiting';

const STAGE_ACCENT: Record<PipelineStage, string> = {
  WATCHING: 'border-t-gray-500',
  CONTACTED: 'border-t-blue-400',
  IN_TALKS: 'border-t-amber-400',
  OFFERED: 'border-t-purple-400',
  COMMITTED: 'border-t-[#5EFF6E]',
};

interface PipelineBoardProps {
  prospects: Prospect[];
  onStageChange: (prospectId: string, stage: PipelineStage) => void;
}

export function PipelineBoard({ prospects, onStageChange }: PipelineBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  const handleDrop = (stage: PipelineStage) => {
    if (draggingId) {
      onStageChange(draggingId, stage);
    }
    setDraggingId(null);
    setDragOverStage(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {PIPELINE_STAGES.map((stage) => {
        const stageProspects = prospects.filter((p) => p.stage === stage.id);
        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStage(stage.id);
            }}
            onDragLeave={() => setDragOverStage((s) => (s === stage.id ? null : s))}
            onDrop={() => handleDrop(stage.id)}
            className={`bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl p-3 transition-colors ${
              dragOverStage === stage.id ? 'border-[#5EFF6E]/50 bg-[#5EFF6E]/5' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-white text-sm font-semibold">{stage.label}</h3>
              <span className="text-gray-500 text-xs bg-[#1f1f1f] rounded-full px-2 py-0.5">
                {stageProspects.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[120px]">
              {stageProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  draggable
                  onDragStart={() => setDraggingId(prospect.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className={`bg-[#161616] border-t-2 ${STAGE_ACCENT[stage.id]} border-x border-b border-[#1f1f1f] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#333] transition-colors ${
                    draggingId === prospect.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[#5EFF6E] text-xs font-bold flex-shrink-0">
                      {prospect.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/athletes/${prospect.athleteId}`}
                        className="text-white text-sm font-medium truncate hover:text-[#5EFF6E] transition-colors block"
                      >
                        {prospect.name}
                      </Link>
                      <p className="text-gray-500 text-xs">{prospect.gradYear} · {prospect.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{prospect.topEvent}</span>
                    <span className="text-[#5EFF6E] font-bold">{prospect.allAroundAvg.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600 text-[11px] mt-2">{prospect.lastActivity}</p>
                </div>
              ))}
              {stageProspects.length === 0 && (
                <div className="border border-dashed border-[#1f1f1f] rounded-lg h-20 flex items-center justify-center">
                  <p className="text-gray-600 text-xs">Drop here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
