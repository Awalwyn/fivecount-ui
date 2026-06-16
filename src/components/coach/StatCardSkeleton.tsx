'use client';

interface StatCardSkeletonProps {
  size?: 'small' | 'large';
  count?: number;
}

export function StatCardSkeleton({ size = 'small', count = 1 }: StatCardSkeletonProps) {
  const sizeClasses = size === 'large' ? 'w-96' : 'w-64';
  const cards = Array.from({ length: count });

  return (
    <>
      {cards.map((_, i) => (
        <div key={i} className={`${sizeClasses} border-l-4 border-gray-700 bg-[#1f1f1f] border-r border-b border-t border-[#2f2f2f] rounded-lg p-6`}>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-24 animate-pulse" />
            <div className="h-8 bg-gray-700 rounded w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
}
