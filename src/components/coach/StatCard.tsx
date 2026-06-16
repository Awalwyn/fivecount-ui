'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value?: string | number;
  borderColor?: string;
  onClick?: () => void;
  children?: ReactNode;
  size?: 'small' | 'large';
}

export function StatCard({
  label,
  value,
  borderColor = 'blue-500',
  onClick,
  children,
  size = 'small',
}: StatCardProps) {
  const sizeClasses = size === 'large' ? 'w-96' : 'w-64';
  const borderClass = `border-l-4 border-${borderColor}`;

  return (
    <div
      className={`${sizeClasses} ${borderClass} bg-[#1f1f1f] border-r border-b border-t border-[#2f2f2f] rounded-lg p-6 ${
        onClick ? 'cursor-pointer hover:bg-[#252525] transition-colors' : ''
      }`}
      onClick={onClick}
    >
      <h3 className="text-sm font-medium text-gray-500 mb-2">{label}</h3>
      {children || <p className="text-4xl font-bold text-white">{value}</p>}
    </div>
  );
}
