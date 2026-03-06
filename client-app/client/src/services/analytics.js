/**
 * Mithra Analytics — Lightweight event tracking stub
 *
 * This module provides a zero-dependency analytics interface.
 * All calls are no-ops by default. To enable PostHog:
 *
 *   1. npm install posthog-js
 *   2. Add VITE_POSTHOG_KEY=phc_xxx to .env
 *   3. Uncomment the PostHog import in this file
 *
 * Without PostHog, events are logged to console in dev mode only.
 */

const DEV = import.meta.env.DEV;

let _capture = () => { };
let _identify = () => { };
let _reset = () => { };

/**
 * Initialize analytics — called once at app startup.
 * Currently a no-op stub. Enable PostHog by following steps above.
 */
export async function initAnalytics() {
    // When PostHog is installed, uncomment the block below:
    //
    // const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
    // if (!POSTHOG_KEY) return;
    // const { default: posthog } = await import('posthog-js');
    // posthog.init(POSTHOG_KEY, {
    //   api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    //   autocapture: false,
    //   capture_pageview: false,
    //   persistence: 'localStorage',
    // });
    // _capture = (e, p) => posthog.capture(e, p);
    // _identify = (id, t) => posthog.identify(id, t);
    // _reset = () => posthog.reset();
}

/** Identify user after login */
export function identifyUser(userId, traits = {}) {
    _identify(userId, traits);
}

/** Reset identity on logout */
export function resetAnalytics() {
    _reset();
}

/** Track a custom event */
export function trackEvent(eventName, properties = {}) {
    _capture(eventName, properties);
}

/* ═══════════════════════════════════════════════════════════════
   Pre-defined event helpers — keeps tracking API consistent
   ═══════════════════════════════════════════════════════════════ */

export const analytics = {
    signUp: (method = 'email') =>
        trackEvent('sign_up', { method }),

    login: (method = 'email') =>
        trackEvent('login', { method }),

    taskCreated: (task = {}) =>
        trackEvent('task_created', {
            priority: task.priority || 'medium',
            has_due_date: !!task.dueDate,
            has_subtasks: (task.subtasks?.length || 0) > 0,
        }),

    aiMessageSent: (messageLength = 0) =>
        trackEvent('ai_message_sent', { message_length: messageLength }),

    habitCreated: (category = '') =>
        trackEvent('habit_created', { category }),

    blendCreated: (name = '') =>
        trackEvent('blend_created', { workspace_name: name }),

    blendJoined: () =>
        trackEvent('blend_joined'),

    pageView: (pageName) =>
        trackEvent('$pageview', { page: pageName }),
};
