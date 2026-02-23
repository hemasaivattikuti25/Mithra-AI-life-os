import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { notificationManager } from '../services/notifications';

/**
 * PullToRefresh wrapper component
 * Provides native-like gesture to refresh state on mobile.
 */
export default function PullToRefresh({ onRefresh, children }) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef(null);
    const startY = useRef(0);
    const controls = useAnimation();

    const PULL_THRESHOLD = 80;

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].pageY;
        } else {
            startY.current = -1;
        }
    };

    const handleTouchMove = (e) => {
        if (startY.current === -1 || isRefreshing) return;

        const currentY = e.touches[0].pageY;
        const diff = currentY - startY.current;

        if (diff > 0) {
            // Resistance calculation
            const distance = Math.pow(diff, 0.85);
            setPullDistance(distance);

            // Haptic nudge exactly at threshold
            if (distance >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD) {
                notificationManager.hapticLight();
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance >= PULL_THRESHOLD) {
            setIsRefreshing(true);
            setPullDistance(PULL_THRESHOLD);
            notificationManager.hapticMedium();

            if (onRefresh) {
                await onRefresh();
            }

            setTimeout(() => {
                setIsRefreshing(false);
                setPullDistance(0);
            }, 500);
        } else {
            setPullDistance(0);
        }
        startY.current = -1;
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-x-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
                style={{ transform: `translateY(${pullDistance - 40}px)`, opacity: pullDistance / PULL_THRESHOLD }}
            >
                <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: (pullDistance / PULL_THRESHOLD) * 360 }}
                    transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                    className="bg-[var(--glass-bg)] border border-[var(--glass-border-hover)] p-2 rounded-full shadow-lg backdrop-blur-md"
                >
                    <RefreshCw size={20} className="text-[var(--accent-color)]" />
                </motion.div>
            </div>

            <motion.div
                animate={{ y: pullDistance }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
