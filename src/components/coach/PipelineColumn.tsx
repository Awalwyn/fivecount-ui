'use client';

import { Prospect, PipelineStage } from '@/lib/api/recruiting';
import { PIPELINE_COLORS } from '@/lib/constants/recruitingColors';
import { ProspectCard } from './ProspectCard';

interface PipelineColumnProps {
  stage: PipelineStage;
  prospects: Prospect[];
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, stage: PipelineStage) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, prospectId: string) => void;
}

export function PipelineColumn({
  stage,
  prospects,
  onDragOver,
  onDrop,
  onDragStart,
}: PipelineColumnProps) {
  const stageColor = PIPELINE_COLORS[stage];

  return (
    <div className="min-w-[320px] flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-semibold text-gray-900">{stageColor.label}</h2>
        <span
          className="text-white text-xs font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: stageColor.hex }}
        >
          {prospects.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
          onDragOver?.(e);
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
          onDrop?.(e, stage);
        }}
        className="min-h-[400px] bg-gray-50 rounded-lg p-3 space-y-3 border-2 border-gray-200 transition-colors flex-1 flex flex-col"
      >
        {prospects.length === 0 ? (
          <div className="text-center py-8 text-gray-500 flex items-center justify-center flex-1">
            <div>
              <p className="text-sm">No prospects in this stage</p>
              <p className="text-xs mt-1">Drag from another column</p>
            </div>
          </div>
        ) : (
          prospects.map((prospect) => (
            <div
              key={prospect.athleteId}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('prospectId', prospect.athleteId);
                onDragStart?.(e, prospect.athleteId);
              }}
              className="cursor-move hover:opacity-80 transition-opacity"
            >
              <ProspectCard prospect={prospect} stage={stage} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
