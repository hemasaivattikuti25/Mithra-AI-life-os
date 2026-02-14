import React from 'react';

/**
 * Skeleton loading placeholder components.
 * Usage: <SkeletonCard />, <SkeletonLine />, <SkeletonList count={5} />
 */

const shimmer = {
  background: 'linear-gradient(90deg, rgba(var(--color-merino), 0.03) 25%, rgba(var(--color-merino), 0.08) 50%, rgba(var(--color-merino), 0.03) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

export function SkeletonLine({ width = '100%', height = '12px', className = '' }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{ width, height, ...shimmer }}
    />
  );
}

export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <div
      className={`rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size, ...shimmer }}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl p-5 glass-card space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonCircle size={36} />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" height="14px" />
          <SkeletonLine width="40%" height="10px" />
        </div>
      </div>
      <SkeletonLine height="10px" />
      <SkeletonLine width="80%" height="10px" />
    </div>
  );
}

export function SkeletonList({ count = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <SkeletonCircle size={20} />
          <div className="flex-1 space-y-1.5">
            <SkeletonLine width={`${60 + Math.random() * 30}%`} height="12px" />
            <SkeletonLine width={`${30 + Math.random() * 20}%`} height="9px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto pb-24 md:pb-8 animate-pulse">
      {/* Hero card */}
      <div className="rounded-3xl p-8 md:p-10 glass-card space-y-4">
        <SkeletonLine width="120px" height="12px" />
        <SkeletonLine width="280px" height="32px" />
        <SkeletonLine width="200px" height="14px" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl p-5 glass-card space-y-3">
            <SkeletonCircle size={36} />
            <SkeletonLine width="60px" height="24px" />
            <SkeletonLine width="80px" height="10px" />
          </div>
        ))}
      </div>
    </div>
  );
}
