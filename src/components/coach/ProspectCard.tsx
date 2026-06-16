'use client';

import Link from 'next/link';
import { Prospect, PipelineStage } from '@/lib/api/recruiting';
import { PIPELINE_COLORS } from '@/lib/constants/recruitingColors';

interface ProspectCardProps {
  prospect: Prospect;
  stage: PipelineStage;
}

export function ProspectCard({ prospect, stage }: ProspectCardProps) {
  const names = prospect.athleteName.split(' ');
  const initials = `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`.toUpperCase();
  const stageColor = PIPELINE_COLORS[stage];
  const borderColorClass = `border-${stageColor.tailwind.split('-')[0]}-${stageColor.tailwind.split('-')[1]}`;

  return (
    <Link href={`/dashboard/athletes/${prospect.athleteId}`}>
      <div
        className={`border-l-4 bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow space-y-2`}
        style={{ borderLeftColor: stageColor.hex }}
      >
        {/* Header: Avatar + Name */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: stageColor.hex }}
          >
            {initials}
          </div>
          <h3 className="font-semibold text-sm text-gray-900 truncate">
            {prospect.athleteName}
          </h3>
        </div>

        {/* Metadata: Year + State */}
        <p className="text-xs text-gray-600">
          {prospect.gradYear} • {prospect.state}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Athletics: Top Event + AA + GPA (if available) */}
        <div className="space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-medium">{prospect.topEvent.name}</span>
            <span className="text-gray-600">: {prospect.topEvent.score.toFixed(1)}</span>
          </p>

          <p className="text-xs font-medium text-gray-900">
            AA: {prospect.allAroundAvg.toFixed(1)}
          </p>
        </div>
      </div>
    </Link>
  );
}
