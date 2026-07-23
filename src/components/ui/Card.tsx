import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/80 border border-white/5 backdrop-blur-xl rounded-2xl p-5 shadow-xl ${
        hoverable ? 'hover:border-emerald-500/30 hover:bg-slate-900/95 transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
