'use client';

import { CommitStatus } from '@/lib/api/athletes';

type StatusVariant = CommitStatus;

interface StatusConfig {
  label: string;
  emoji: string;
}

const STATUS_CONFIG: Record<StatusVariant, StatusConfig> = {
  SIGNED: {
    label: 'Signed',
    emoji: '✅',
  },
  OPEN_TO_RECRUITING: {
    label: 'Open to Recruiting',
    emoji: '🟢',
  },
  VERBALLY_COMMITTED: {
    label: 'Verbally Committed',
    emoji: '🤝',
  },
  NOT_RECRUITING: {
    label: 'Not Recruiting',
    emoji: '⛔',
  },
};

interface RecruitingStatusDisplayProps {
  status: StatusVariant | undefined;
  className?: string;
}

export const RecruitingStatusDisplay = ({ status, className }: RecruitingStatusDisplayProps) => {
  if (!status) {
    return <span className="text-gray-400">Not set</span>;
  }

  const config = STATUS_CONFIG[status];

  return (
    <div className={`flex flex-col items-center gap-1 ${className || ''}`}>
      <span className="text-4xl">{config.emoji}</span>
      <span className="text-xs text-gray-400">{config.label}</span>
    </div>
  );
};
