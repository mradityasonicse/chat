import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur shadow-2xl shadow-slate-950/30 p-6 ${
        className || ''
      }`}
      {...props}
    >
      {children}
    </div>
  );
}
