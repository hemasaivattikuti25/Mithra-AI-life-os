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
            } catch (e) {
                console.warn('Haptics not available');
            }
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
            console.info('[Notifications] Reminder time is in the past, skipping.');
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

export const registerServiceWorker = () => {
    if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.error('ServiceWorker registration failed: ', err);
            });
        });
    }
};

export default notificationManager;
