import React from 'react';

interface BadgeProps {
  count: number;
  visible?: boolean;
}

export function Badge({ count, visible = true }: BadgeProps) {
  if (!visible || count === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  );
}
