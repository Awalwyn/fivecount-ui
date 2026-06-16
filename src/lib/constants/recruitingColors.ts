import { PipelineStage } from '@/lib/api/recruiting';

export const PIPELINE_COLORS: Record<PipelineStage, { tailwind: string; hex: string; label: string }> = {
  WATCHING: {
    tailwind: 'gray-500',
    hex: '#6B7280',
    label: 'Watching',
  },
  CONTACTED: {
    tailwind: 'blue-500',
    hex: '#3B82F6',
    label: 'Contacted',
  },
  IN_TALKS: {
    tailwind: 'amber-500',
    hex: '#F59E0B',
    label: 'In Talks',
  },
  OFFERED: {
    tailwind: 'purple-500',
    hex: '#A855F7',
    label: 'Offered',
  },
  COMMITTED: {
    tailwind: 'green-500',
    hex: '#10B981',
    label: 'Committed',
  },
};
