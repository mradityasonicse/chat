import React from 'react';

interface PresenceIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PresenceIndicator({ isOnline, size = 'md' }: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-slate-500'
      } animate-pulse`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
}
