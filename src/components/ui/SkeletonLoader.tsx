import React from 'react';

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
}

export function PageSkeleton() {
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <SkeletonLoader className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonLoader className="h-24 w-full rounded-2xl" />
        <SkeletonLoader className="h-24 w-full rounded-2xl" />
      </div>
      <SkeletonLoader className="h-48 w-full rounded-2xl" />
    </div>
  );
}
