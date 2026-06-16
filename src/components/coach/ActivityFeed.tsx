'use client';

import { CoachActivity, ACTIVITY_TYPES } from '@/lib/api/recruiting';

interface ActivityFeedProps {
  activities: CoachActivity[];
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'NEW_SCORE':
      return '📊';
    case 'NEW_POST':
      return '📝';
    case 'REPLY':
      return '💬';
    case 'PROFILE_VIEW':
      return '👀';
    case 'COMMIT':
      return '✅';
    default:
      return '•';
  }
}

function getActivityLabel(type: string): string {
  switch (type) {
    case 'NEW_SCORE':
      return 'New Score';
    case 'NEW_POST':
      return 'New Post';
    case 'REPLY':
      return 'Reply';
    case 'PROFILE_VIEW':
      return 'Profile View';
    case 'COMMIT':
      return 'Committed';
    default:
      return 'Activity';
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg p-4">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-start gap-3 py-2 border-b border-[#2f2f2f] last:border-0">
          <span className="text-xl">{getActivityIcon(activity.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {getActivityLabel(activity.type)}: <span className="text-[#5EFF6E]">{activity.athleteName}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{activity.detail}</p>
          </div>
          <p className="text-xs text-gray-600 flex-shrink-0">{formatTime(activity.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
