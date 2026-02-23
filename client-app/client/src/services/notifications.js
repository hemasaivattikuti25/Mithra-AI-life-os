/**
 * Mithra Notification Service
 *
 * Handles:
 * - Service worker registration
 * - Push notification permission requests
 * - Local notification scheduling (task reminders, habit streaks)
 *
 * No external dependencies. Uses the native Notification API + Service Worker.
 */

const SW_PATH = '/sw.js';

let swRegistration = null;

/**
 * Register the service worker (call once at app startup)
 */
export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.info('[Notifications] Service workers not supported.');
        return null;
    }

    try {
        swRegistration = await navigator.serviceWorker.register(SW_PATH);
        console.info('[Notifications] Service worker registered.');
        return swRegistration;
    } catch (err) {
        console.warn('[Notifications] SW registration failed:', err);
        return null;
    }
}

/**
 * Request notification permission
 * Returns: 'granted' | 'denied' | 'default'
 */
export async function requestPermission() {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';

    return await Notification.requestPermission();
}

/**
 * Show a local push notification (fires immediately)
 */
export function showNotification(title, options = {}) {
    if (Notification.permission !== 'granted') return;

    if (swRegistration) {
        swRegistration.showNotification(title, {
            icon: '/assets/logo.png',
            badge: '/assets/logo.png',
            vibrate: [100, 50, 100],
            ...options,
        });
    } else {
        // Fallback: use Notification API directly
        new Notification(title, {
            icon: '/assets/logo.png',
            ...options,
        });
    }
}

/**
 * Schedule a task reminder notification
 * @param {Object} task - { title, dueDate }
 * @param {number} minutesBefore - minutes before due to notify (default: 15)
 */
export function scheduleTaskReminder(task, minutesBefore = 15) {
    if (!task?.dueDate || Notification.permission !== 'granted') return null;

    const dueTime = new Date(task.dueDate).getTime();
    const notifyAt = dueTime - minutesBefore * 60 * 1000;
    const delay = notifyAt - Date.now();

    if (delay <= 0) return null; // Already past

    const timerId = setTimeout(() => {
        showNotification('⏰ Task Reminder', {
            body: `"${task.title}" is due in ${minutesBefore} minutes!`,
            data: { url: '/#/tasks', type: 'task_reminder' },
            tag: `task-${task.id || task.title}`,
        });
    }, delay);

    return timerId;
}

/**
 * Send a habit streak notification
 * @param {Object} habit - { title, streak }
 */
export function notifyHabitStreak(habit) {
    if (Notification.permission !== 'granted') return;

    const milestones = [3, 7, 14, 21, 30, 50, 100, 365];
    if (!milestones.includes(habit.streak)) return; // Only notify on milestones

    showNotification('🔥 Streak Milestone!', {
        body: `"${habit.title}" — ${habit.streak} day streak! Keep it up!`,
        data: { url: '/#/habits', type: 'habit_streak' },
        tag: `streak-${habit.title}`,
    });
}

/**
 * Send a daily summary notification (for the morning briefing)
 */
export function notifyDailySummary(taskCount, habitCount) {
    if (Notification.permission !== 'granted') return;

    showNotification('☀️ Good Morning!', {
        body: `You have ${taskCount} tasks and ${habitCount} habits today. Let's crush it!`,
        data: { url: '/#/dashboard', type: 'daily_summary' },
        tag: 'daily-summary',
    });
}
