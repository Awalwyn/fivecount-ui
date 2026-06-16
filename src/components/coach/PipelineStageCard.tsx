'use client';

import { useRouter } from 'next/navigation';
import { PipelineStage } from '@/lib/api/recruiting';
import { PIPELINE_COLORS } from '@/lib/constants/recruitingColors';
import { StatCard } from './StatCard';

interface PipelineStageCardProps {
  stage: PipelineStage;
  count: number;
}

export function PipelineStageCard({ stage, count }: PipelineStageCardProps) {
  const router = useRouter();
  const color = PIPELINE_COLORS[stage];

  const handleClick = () => {
    router.push(`/dashboard/recruiting?stage=${stage}`);
  };

  return (
    <StatCard
      label={color.label}
      value={count}
      borderColor={color.tailwind}
      onClick={handleClick}
      size="small"
    />
  );
}
