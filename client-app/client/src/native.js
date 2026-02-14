/**
 * Mithra Native Bridge — Capacitor integration layer
 * Provides native Android features when running in Capacitor,
 * falls back to web APIs when running in browser.
 */
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapApp } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { Browser } from '@capacitor/browser';

/** Is the app running inside a native Capacitor shell? */
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

/* ─── Status Bar ─── */
export const configureStatusBar = async (isDark = true) => {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color: isDark ? '#050505' : '#FFFFFF' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) { console.warn('StatusBar config failed:', e); }
};

/* ─── Splash Screen ─── */
export const hideSplash = async () => {
  if (!isNative) return;
  try { await SplashScreen.hide(); } catch (e) { /* silent */ }
};

/* ─── Haptics ─── */
export const hapticLight = async () => {
  if (!isNative) return;
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { /* silent */ }
};
export const hapticMedium = async () => {
  if (!isNative) return;
  try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { /* silent */ }
};
export const hapticHeavy = async () => {
  if (!isNative) return;
  try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) { /* silent */ }
};

/* ─── Local Notifications ─── */
export const requestNotificationPermission = async () => {
  try {
    if (isNative) {
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } else {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  } catch (e) { return false; }
};

export const scheduleNotification = async ({ id, title, body, at }) => {
  try {
    if (isNative) {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: typeof id === 'number' ? id : Math.floor(Math.random() * 100000),
          schedule: { at: new Date(at) },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#22d3ee',
        }],
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      // Web fallback — schedule with setTimeout
      const delay = new Date(at).getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => new Notification(title, { body, icon: '/vite.svg' }), delay);
      }
    }
  } catch (e) { console.warn('Notification scheduling failed:', e); }
};

export const cancelAllNotifications = async () => {
  if (!isNative) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  } catch (e) { /* silent */ }
};

/* ─── Network ─── */
export const getNetworkStatus = async () => {
  try {
    if (isNative) {
      return await Network.getStatus();
    }
    return { connected: navigator.onLine, connectionType: 'wifi' };
  } catch (e) {
    return { connected: true, connectionType: 'unknown' };
  }
};

export const onNetworkChange = (callback) => {
  if (isNative) {
    return Network.addListener('networkStatusChange', callback);
  }
  const handler = () => callback({ connected: navigator.onLine, connectionType: 'unknown' });
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return { remove: () => { window.removeEventListener('online', handler); window.removeEventListener('offline', handler); } };
};

/* ─── Preferences (Native key-value storage) ─── */
export const nativeStorage = {
  get: async (key) => {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      }
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set: async (key, value) => {
    if (isNative) {
      await Preferences.set({ key, value: JSON.stringify(value) });
    }
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
  },
  remove: async (key) => {
    if (isNative) await Preferences.remove({ key });
    localStorage.removeItem(key);
  },
};

/* ─── Open URL in native browser ─── */
export const openUrl = async (url) => {
  if (isNative) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

/* ─── Back Button Handler (Android) ─── */
export const setupBackButton = (navigateBack) => {
  if (!isNative) return { remove: () => { } };
  return CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      navigateBack();
    } else {
      CapApp.exitApp();
    }
  });
};

/* ─── Keyboard Listeners ─── */
export const setupKeyboard = () => {
  if (!isNative) return;
  try {
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.setProperty('--keyboard-height', '0px');
      document.body.classList.remove('keyboard-open');
    });
  } catch (e) { /* silent */ }
};

/* ─── Initialize all native features ─── */
export const initNative = async () => {
  if (!isNative) return;
  try {
    await configureStatusBar(true);
    setupKeyboard();
    // Hide splash after small delay to let React render
    setTimeout(() => hideSplash(), 300);
  } catch (e) { console.warn('Native init failed:', e); }
};
