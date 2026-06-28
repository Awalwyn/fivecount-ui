'use client';

import { useState } from 'react';
import { demoProspects } from '../data/mockData';
import { Prospect, PipelineStage } from '@/lib/api/recruiting';
import { GripVertical } from 'lucide-react';

const PIPELINE_STAGES: { stage: PipelineStage; label: string; color: string }[] = [
  { stage: 'WATCHING', label: 'Watching', color: '#6B7280' },
  { stage: 'CONTACTED', label: 'Contacted', color: '#3B82F6' },
  { stage: 'IN_TALKS', label: 'In Talks', color: '#F59E0B' },
  { stage: 'OFFERED', label: 'Offered', color: '#A855F7' },
  { stage: 'COMMITTED', label: 'Committed', color: '#10B981' },
];

function ProspectCard({ prospect, onDragStart }: { prospect: Prospect; onDragStart: (e: React.DragEvent, prospect: Prospect) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, prospect)}
      className="bg-[#0a0a0a] border border-[#1f1f1f] rounded p-4 cursor-grab active:cursor-grabbing hover:border-[#5EFF6E] transition-colors group"
    >
      <div className="flex items-start gap-2 mb-3">
        <GripVertical size={16} className="text-[#a0a0a0] opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{prospect.name}</p>
          <p className="text-xs text-[#a0a0a0]">Class of {prospect.gradYear}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <p className="text-[#a0a0a0]">Top Event</p>
          <p className="text-[#5EFF6E]">{prospect.topEvent}</p>
        </div>
        <div className="flex justify-between">
          <div>
            <p className="text-[#a0a0a0]">AA Avg</p>
            <p className="text-[#ffffff] font-semibold">{prospect.allAroundAvg}</p>
          </div>
          <div>
            <p className="text-[#a0a0a0]">Score</p>
            <p className="text-[#ffffff] font-semibold">{prospect.topEventScore}</p>
          </div>
        </div>
        {prospect.gpa && (
          <div>
            <p className="text-[#a0a0a0]">GPA</p>
            <p className="text-[#ffffff] font-semibold">{prospect.gpa}</p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#1f1f1f]">
        <p className="text-xs text-[#a0a0a0]">{prospect.state}</p>
      </div>
    </div>
  );
}

function PipelineColumn({
  stage,
  label,
  color,
  prospects,
  onDragStart,
  onDrop,
}: {
  stage: PipelineStage;
  label: string;
  color: string;
  prospects: Prospect[];
  onDragStart: (e: React.DragEvent, prospect: Prospect) => void;
  onDrop: (stage: PipelineStage) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="flex flex-col bg-[#0a0a0a] rounded-lg border border-[#1f1f1f] overflow-hidden min-w-80 flex-1">
      <div className="p-4 border-b border-[#1f1f1f]" style={{ borderBottomColor: color }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-sm">{label}</h3>
        </div>
        <p className="text-lg font-semibold" style={{ color }}>{prospects.length}</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => {
          onDrop(stage);
          setDragOver(false);
        }}
        className={`flex-1 p-4 space-y-3 overflow-y-auto transition-colors ${
          dragOver ? 'bg-[#1f1f1f]' : ''
        }`}
      >
        {prospects.length === 0 && !dragOver && (
          <div className="text-center py-8 text-[#a0a0a0] text-sm">Drag prospects here</div>
        )}
        {prospects.map((prospect) => (
          <ProspectCard key={prospect.id} prospect={prospect} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

export function RecruitingDemo() {
  const [prospects, setProspects] = useState<Prospect[]>(demoProspects);
  const [draggedProspect, setDraggedProspect] = useState<Prospect | null>(null);

  const handleDragStart = (e: React.DragEvent, prospect: Prospect) => {
    setDraggedProspect(prospect);
  };

  const handleDrop = (newStage: PipelineStage) => {
    if (draggedProspect) {
      setProspects(
        prospects.map((p) =>
          p.id === draggedProspect.id ? { ...p, stage: newStage } : p
        )
      );
      setDraggedProspect(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="heading-display text-4xl mb-2">Recruiting Pipeline</h1>
        <p className="text-[#a0a0a0]">Drag prospects between stages to manage your pipeline</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(({ stage, label, color }) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            label={label}
            color={color}
            prospects={prospects.filter((p) => p.stage === stage)}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
