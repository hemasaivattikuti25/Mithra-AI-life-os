import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   NETWORK STATUS — Banner that shows when offline/back online
   ═══════════════════════════════════════════════════════════════ */
export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);
  const [justCameBack, setJustCameBack] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
      setJustCameBack(false);
    };

    const goOnline = () => {
      setIsOffline(false);
      setJustCameBack(true);
      // Show "back online" for 3s then hide
      setTimeout(() => {
        setShowBanner(false);
        setJustCameBack(false);
      }, 3000);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-[9999] py-2 px-4 text-center text-sm font-medium
            ${isOffline ? 'bg-amber-500 text-black' : 'bg-green-500 text-white'}`}
        >
          {isOffline ? (
            <span className="flex items-center justify-center gap-2">
              <WifiOff size={16} />
              You're offline — changes will sync when you reconnect
            </span>
          ) : (
            <span>✓ Back online — syncing your data</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
