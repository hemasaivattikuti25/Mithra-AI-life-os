import { useState, useEffect, useMemo } from 'react';

/**
 * useAppAge — Progressive onboarding hook
 * 
 * Tracks app install date and user's app "age" to enable
 * progressive feature unlocking and contextual onboarding tips.
 * 
 * Usage:
 *   const { daysUsing, isNewUser, isVeteran, showFeature, tips } = useAppAge();
 *   
 *   if (showFeature('advanced_analytics')) { ... }
 *   if (isNewUser) { showOnboardingTip(tips[0]); }
 */

const STORAGE_KEY = 'mithra-install-date';

// Feature unlock schedule (days since install)
const FEATURE_UNLOCK_DAYS = {
  basic_habits: 0,        // Available immediately
  basic_tasks: 0,         // Available immediately
  journal: 0,             // Available immediately
  focus_timer: 1,         // After 1 day
  blend_workspaces: 3,    // After 3 days
  advanced_analytics: 7,  // After 1 week
  ai_day_planning: 7,     // After 1 week
  streak_freeze: 14,      // After 2 weeks
  share_stats: 3,         // After 3 days
  custom_themes: 7,       // After 1 week
  import_export: 5,       // After 5 days
};

// Progressive onboarding tips based on app age
const ONBOARDING_TIPS = {
  0: [
    { id: 'welcome', title: 'Welcome to Mithra!', message: 'Start by creating your first habit. Tap + to begin.' },
    { id: 'habit-streak', title: 'Build Streaks', message: 'Complete habits daily to build streaks. Consistency is key!' },
  ],
  1: [
    { id: 'focus-intro', title: 'Try Focus Mode', message: 'Use the Focus tab to time your deep work sessions.' },
    { id: 'journal-prompt', title: 'Reflect Daily', message: 'Journal helps you track your thoughts and moods over time.' },
  ],
  3: [
    { id: 'blend-intro', title: 'Unlock Blend', message: 'Collaborate with friends! Create shared workspaces in Blend.' },
    { id: 'dost-tip', title: 'Chat with Dost', message: 'Dost can help you summarize your day. Try saying "Plan my day".' },
  ],
  7: [
    { id: 'analytics-intro', title: 'Check Your Analytics', message: 'You\'ve been using Mithra for a week! Review your progress in Analytics.' },
    { id: 'ai-planning', title: 'AI Day Planning', message: 'Ask Dost to "plan my day" for an AI-generated schedule based on your tasks.' },
  ],
  14: [
    { id: 'streak-freeze', title: 'Streak Freeze Unlocked', message: 'Protect your streaks! You can now use streak freeze when you miss a day.' },
    { id: 'veteran-tip', title: 'You\'re a Veteran!', message: '2 weeks strong. Consider exporting your data as a backup.' },
  ],
  30: [
    { id: 'monthly-review', title: 'Monthly Review', message: 'It\'s been a month! Review your habit consistency in the heatmap.' },
  ],
};

export function useAppAge() {
  const [installDate, setInstallDate] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Date(stored);
    
    // First time — set install date
    const now = new Date();
    localStorage.setItem(STORAGE_KEY, now.toISOString());
    return now;
  });

  // Days since install
  const daysUsing = useMemo(() => {
    const now = new Date();
    const diff = now.getTime() - installDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [installDate]);

  // User categories
  const isNewUser = daysUsing < 3;
  const isVeteran = daysUsing >= 14;
  const isSuperVeteran = daysUsing >= 30;

  // Check if a feature should be shown
  const showFeature = (featureKey) => {
    const unlockDay = FEATURE_UNLOCK_DAYS[featureKey];
    if (unlockDay === undefined) return true; // Unknown features are always shown
    return daysUsing >= unlockDay;
  };

  // Get days until a feature unlocks (returns 0 if already unlocked)
  const daysUntilFeature = (featureKey) => {
    const unlockDay = FEATURE_UNLOCK_DAYS[featureKey];
    if (unlockDay === undefined) return 0;
    return Math.max(0, unlockDay - daysUsing);
  };

  // Get relevant tips for current app age
  const tips = useMemo(() => {
    const allTips = [];
    const shownTips = JSON.parse(localStorage.getItem('mithra-shown-tips') || '[]');
    
    Object.entries(ONBOARDING_TIPS).forEach(([day, dayTips]) => {
      if (daysUsing >= parseInt(day)) {
        dayTips.forEach(tip => {
          if (!shownTips.includes(tip.id)) {
            allTips.push(tip);
          }
        });
      }
    });
    
    return allTips;
  }, [daysUsing]);

  // Mark a tip as shown
  const dismissTip = (tipId) => {
    const shownTips = JSON.parse(localStorage.getItem('mithra-shown-tips') || '[]');
    if (!shownTips.includes(tipId)) {
      shownTips.push(tipId);
      localStorage.setItem('mithra-shown-tips', JSON.stringify(shownTips));
    }
  };

  // Get user tier for gamification
  const userTier = useMemo(() => {
    if (daysUsing >= 90) return { name: 'Stoic Master', level: 5, color: '#FFD700' };
    if (daysUsing >= 30) return { name: 'Disciplined', level: 4, color: '#C2185B' };
    if (daysUsing >= 14) return { name: 'Committed', level: 3, color: '#8B5CF6' };
    if (daysUsing >= 7) return { name: 'Consistent', level: 2, color: '#3B82F6' };
    if (daysUsing >= 3) return { name: 'Explorer', level: 1, color: '#22D3EE' };
    return { name: 'Newcomer', level: 0, color: '#6B7280' };
  }, [daysUsing]);

  return {
    installDate,
    daysUsing,
    isNewUser,
    isVeteran,
    isSuperVeteran,
    showFeature,
    daysUntilFeature,
    tips,
    dismissTip,
    userTier,
    FEATURE_UNLOCK_DAYS,
  };
}

export default useAppAge;
