import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Mithra Notification & Haptics Engine
 * 
 * Handles local notifications that survive app kills on Mobile
 * and provides tactile feedback for key interactions.
 */

class NotificationManager {
    constructor() {
        this.isNative = Capacitor.isNativePlatform();
    }

    /**
     * Request permissions for notifications.
     * Should be called during onboarding or in settings.
     */
    async requestPermissions() {
        if (this.isNative) {
            const status = await LocalNotifications.requestPermissions();
            return status.display === 'granted';
        }

        if ('Notification' in window) {
            const status = await Notification.requestPermission();
            return status === 'granted';
        }
        return false;
    }

    /**
     * Trigger a physical haptic pulse (Mobile only)
     */
    async haptic(style = ImpactStyle.Medium) {
        if (this.isNative) {
            try {
                await Haptics.impact({ style });
            } catch { }
        }
    }

    async hapticLight() { await this.haptic(ImpactStyle.Light); }
    async hapticMedium() { await this.haptic(ImpactStyle.Medium); }
    async hapticHeavy() { await this.haptic(ImpactStyle.Heavy); }

    /**
     * Schedule a persistent task reminder
     */
    async scheduleTaskReminder(task, minutesBefore = 15) {
        if (!task.dueDate) return;

        const dueTime = new Date(task.dueDate).getTime();
        const notifyAt = new Date(dueTime - minutesBefore * 60 * 1000);

        if (notifyAt < new Date()) {
            return;
        }

        if (this.isNative) {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: task.id ? (parseInt(task.id.toString().replace(/\D/g, '').slice(-6), 10) || Math.floor(Math.random() * 999999)) : Math.floor(Math.random() * 1000000),
                        title: '⏰ Task Reminder',
                        body: `"${task.title}" is due in ${minutesBefore} minutes!`,
                        schedule: { at: notifyAt },
                        sound: 'beep.wav',
                        extra: { url: '/tasks', id: task.id }
                    }
                ]
            });
        } else {
            // Web fallback (volatile - only works if tab is open)
            const delay = notifyAt.getTime() - Date.now();
            // Clamp to max safe setTimeout value (~24.8 days) to prevent immediate firing
            const MAX_DELAY = 2147483647; // 2^31 - 1 ms
            if (delay > 0 && delay <= MAX_DELAY) {
                setTimeout(() => {
                    new Notification('⏰ Task Reminder', {
                        body: `"${task.title}" is due in ${minutesBefore} minutes!`,
                    });
                }, delay);
            }
        }
    }

    /**
     * Schedule a persistent habit reminder
     */
    async scheduleHabitReminder(habit) {
        if (!habit.scheduleTime || !this.isNative) return;

        // Parse HH:mm
        const [hour, minute] = habit.scheduleTime.split(':').map(Number);

        await LocalNotifications.schedule({
            notifications: [
                {
                    id: habit.id ? (parseInt(habit.id.toString().replace(/\D/g, '').slice(-6), 10) || Math.floor(Math.random() * 999999)) : Math.floor(Math.random() * 1000000),
                    title: '🔥 Habit Time',
                    body: `It's time for: ${habit.title}. Keep your streak alive!`,
                    schedule: {
                        on: { hour, minute },
                        repeats: true
                    },
                    extra: { url: '/habits', id: habit.id }
                }
            ]
        });
    }

    /**
     * Schedule daily briefing notification at 8am
     * Shows pending tasks and habits for the day
     */
    async scheduleDailyBriefing(tasks = [], habits = [], hour = 8, minute = 0) {
        const pendingTasks = tasks.filter(t => !t.completed && !t.done);
        const pendingHabits = habits.filter(h => !h.todayDone);
        
        const taskCount = pendingTasks.length;
        const habitCount = pendingHabits.length;
        
        // Build notification body
        let body = '☀️ Good morning! ';
        if (taskCount > 0 && habitCount > 0) {
            body += `You have ${taskCount} task${taskCount > 1 ? 's' : ''} and ${habitCount} habit${habitCount > 1 ? 's' : ''} to tackle today.`;
        } else if (taskCount > 0) {
            body += `You have ${taskCount} task${taskCount > 1 ? 's' : ''} pending today.`;
        } else if (habitCount > 0) {
            body += `${habitCount} habit${habitCount > 1 ? 's' : ''} waiting for you today!`;
        } else {
            body += `Your slate is clean. Set some goals in Mithra!`;
        }
        
        // Add top priority task if exists
        const highPriorityTask = pendingTasks.find(t => t.priority === 'high');
        if (highPriorityTask) {
            body += ` 🔴 Top priority: "${highPriorityTask.title}"`;
        }

        const notificationId = 999001; // Fixed ID for daily briefing

        if (this.isNative) {
            // Cancel existing daily briefing first
            try {
                await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
            } catch { /* ignore */ }
            
            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: notificationId,
                        title: '🌅 Your Daily Briefing',
                        body,
                        schedule: {
                            on: { hour, minute },
                            repeats: true
                        },
                        sound: 'beep.wav',
                        extra: { url: '/dashboard' }
                    }
                ]
            });
        } else {
            // Web fallback - store preference and check on next load
            localStorage.setItem('mithra-daily-briefing', JSON.stringify({ hour, minute, enabled: true }));
            
            // If we're past the scheduled time today, schedule for tomorrow
            const now = new Date();
            const scheduledTime = new Date();
            scheduledTime.setHours(hour, minute, 0, 0);
            
            if (now > scheduledTime) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }
            
            const delay = scheduledTime.getTime() - now.getTime();
            const MAX_DELAY = 2147483647;
            
            if (delay > 0 && delay <= MAX_DELAY) {
                setTimeout(() => {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('🌅 Your Daily Briefing', { body });
                    }
                }, delay);
            }
        }
    }

    /**
     * Check and show daily briefing on app open (for web)
     */
    checkWebDailyBriefing(tasks = [], habits = []) {
        if (this.isNative) return; // Native handles scheduling natively
        
        const stored = localStorage.getItem('mithra-daily-briefing');
        if (!stored) return;
        
        try {
            const { hour, minute, enabled, lastShown } = JSON.parse(stored);
            if (!enabled) return;
            
            const now = new Date();
            const today = now.toDateString();
            
            // Check if we should show (within 2 hours of scheduled time, not shown today)
            if (lastShown === today) return;
            
            const scheduledTime = new Date();
            scheduledTime.setHours(hour, minute, 0, 0);
            
            const diffMs = now.getTime() - scheduledTime.getTime();
            const twoHours = 2 * 60 * 60 * 1000;
            
            // If we're within 2 hours after scheduled time, show the notification
            if (diffMs >= 0 && diffMs <= twoHours) {
                const pendingTasks = tasks.filter(t => !t.completed && !t.done);
                const pendingHabits = habits.filter(h => !h.todayDone);
                
                let body = '☀️ Good morning! ';
                if (pendingTasks.length > 0) {
                    body += `${pendingTasks.length} tasks pending. `;
                }
                if (pendingHabits.length > 0) {
                    body += `${pendingHabits.length} habits to complete.`;
                }
                
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('🌅 Your Daily Briefing', { body });
                }
                
                // Mark as shown today
                localStorage.setItem('mithra-daily-briefing', JSON.stringify({ 
                    hour, minute, enabled, lastShown: today 
                }));
            }
        } catch { }
    }

    async cancelAll() {
        if (this.isNative) {
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel(pending);
            }
        }
    }
}

export const notificationManager = new NotificationManager();

export default notificationManager;
