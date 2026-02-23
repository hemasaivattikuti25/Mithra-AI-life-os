import React from 'react';

/**
 * Reusable shimmer skeleton components for loading states.
 * Usage: <DashboardSkeleton />, <TasksSkeleton />, etc.
 */

const Bone = ({ className = '' }) => (
    <div
        className={`rounded-xl animate-pulse ${className}`}
        style={{ background: 'var(--glass-border, rgba(255,255,255,0.06))' }}
    />
);

const GlassShell = ({ children, className = '' }) => (
    <div
        className={`rounded-2xl p-6 border border-[var(--glass-border)] ${className}`}
        style={{ background: 'var(--glass-bg, rgba(20,20,30,0.6))' }}
    >
        {children}
    </div>
);

/* ─── Dashboard ─── */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in">
            {/* Greeting */}
            <div className="space-y-3">
                <Bone className="h-8 w-64" />
                <Bone className="h-4 w-40" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <GlassShell key={i} className="space-y-3">
                        <Bone className="h-3 w-20" />
                        <Bone className="h-8 w-16" />
                    </GlassShell>
                ))}
            </div>

            {/* Main card */}
            <GlassShell className="space-y-4">
                <Bone className="h-5 w-48" />
                <Bone className="h-40 w-full" />
            </GlassShell>

            {/* Two columns */}
            <div className="grid md:grid-cols-2 gap-4">
                <GlassShell className="space-y-3">
                    <Bone className="h-4 w-32" />
                    {[...Array(4)].map((_, i) => <Bone key={i} className="h-10 w-full" />)}
                </GlassShell>
                <GlassShell className="space-y-3">
                    <Bone className="h-4 w-32" />
                    {[...Array(3)].map((_, i) => <Bone key={i} className="h-12 w-full" />)}
                </GlassShell>
            </div>
        </div>
    );
}

/* ─── Tasks ─── */
export function TasksSkeleton() {
    return (
        <div className="space-y-4 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Bone className="h-7 w-36" />
                <Bone className="h-9 w-28 rounded-xl" />
            </div>
            {/* Filter tabs */}
            <div className="flex gap-2">
                {[...Array(4)].map((_, i) => <Bone key={i} className="h-8 w-20 rounded-full" />)}
            </div>
            {/* Task list */}
            <GlassShell className="space-y-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Bone className="h-5 w-5 rounded-md flex-shrink-0" />
                        <Bone className="h-5 flex-1" />
                        <Bone className="h-4 w-16 rounded-full" />
                    </div>
                ))}
            </GlassShell>
        </div>
    );
}

/* ─── Habits ─── */
export function HabitsSkeleton() {
    return (
        <div className="space-y-4 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Bone className="h-7 w-40" />
                <Bone className="h-9 w-28 rounded-xl" />
            </div>
            {/* Habit cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <GlassShell key={i} className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Bone className="h-10 w-10 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Bone className="h-4 w-32" />
                                <Bone className="h-3 w-24" />
                            </div>
                        </div>
                        <Bone className="h-2 w-full rounded-full" />
                        {/* Mini heatmap */}
                        <div className="flex gap-1">
                            {[...Array(14)].map((_, j) => <Bone key={j} className="h-3 w-3 rounded-sm" />)}
                        </div>
                    </GlassShell>
                ))}
            </div>
        </div>
    );
}

/* ─── Journal ─── */
export function JournalSkeleton() {
    return (
        <div className="space-y-4 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <Bone className="h-7 w-36" />
                <Bone className="h-9 w-32 rounded-xl" />
            </div>
            {/* Journal entries */}
            {[...Array(3)].map((_, i) => (
                <GlassShell key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Bone className="h-5 w-40" />
                        <Bone className="h-4 w-20" />
                    </div>
                    <Bone className="h-4 w-full" />
                    <Bone className="h-4 w-3/4" />
                    <div className="flex gap-2 pt-1">
                        {[...Array(3)].map((_, j) => <Bone key={j} className="h-5 w-14 rounded-full" />)}
                    </div>
                </GlassShell>
            ))}
        </div>
    );
}

/* ─── Generic Page Skeleton ─── */
export function PageSkeleton() {
    return (
        <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <Bone className="h-8 w-48" />
            <GlassShell className="space-y-4">
                <Bone className="h-5 w-64" />
                <Bone className="h-32 w-full" />
                <Bone className="h-4 w-full" />
                <Bone className="h-4 w-2/3" />
            </GlassShell>
        </div>
    );
}
