import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Trash2, Calendar, Wifi, WifiOff,
  Plus, Edit3, CheckCircle2, Circle, Flame, FileText,
  Upload, AlertTriangle, Clock, BarChart3, Sparkles,
  X, FileSpreadsheet, Image as ImageIcon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData, getUserScopedKey } from '../context/DataContext';
import { authService } from '../services/firebaseClient';
import { apiFetch, isFirebaseConfigured } from '../services/firebaseClient';
import { format, addDays, parse } from 'date-fns';
import clsx from 'clsx';

/* =========================================
   API Configuration
   ========================================= */
const API_BASE = import.meta.env.VITE_API_URL || null;
const isAPIConfigured = !!API_BASE;

/* ═══════════════════════════════════════════════════════════════
   DOST MODE — AI Agent
   ═══════════════════════════════════════════════════════════════ */

const INITIAL_MSG = [
  {
    id: 1, sender: 'ai', type: 'text',
    content: "Hey! I'm Dost — your AI companion. Here's what I can do:\n\n� **Tasks** — \"Call amma at 3pm\" or \"Add task: report by Friday\"\n🔥 **Habits** — \"I want to go gym for next 20 days\"\n📅 **Events** — \"Class from 2-7pm\" or \"Schedule meeting at 10am\"\n✨ **Smart Schedule** — \"Plan my day\" for an optimized AI day plan\n📊 **Summary** — \"Summarize my day\" or \"How are my habits?\"\n🎤 **Voice** — Tap the mic to speak\n\nWhat would you like to do?"
  },
];

/* ═══════════════════════════════
   INTENT PARSER — detects user commands
   ═══════════════════════════════ */
function parseIntent(input, tasks, habits) {
  const lower = input.toLowerCase().trim();

  // ── SMART SCHEDULE ──
  if (/smart\s*schedule|plan\s+my\s+day|organize\s+my\s+day|create\s+(?:a\s+)?schedule|make\s+(?:a\s+)?schedule|schedule\s+my\s+day|productive\s+day/i.test(lower)) {
    return { type: 'smart_schedule' };
  }

  // ── SCHEDULE CONFIRMATION ──
  if (/^(?:yes|yeah|yep|sure|ok|okay|apply|go\s+ahead|do\s+it|change|update|confirm|sounds\s+good|let'?s\s+do\s+it)[\s!.]*$/i.test(lower)) {
    return { type: 'schedule_apply_yes' };
  }

  // ── SCHEDULE UNDO ──
  if (/undo\s*schedule|revert\s*(?:schedule)?|restore\s*(?:plan)?|go\s+back\s+(?:to\s+)?(?:original|my)\s*(?:plan)?|bring\s+back(?:\s+my\s+plan)?/i.test(lower)) {
    return { type: 'schedule_undo' };
  }

  // ── DURATION-BASED TIMED EVENT ("work out for 1 hour at 8 AM", "meditate for 30 min at 7am") ──
  // Must come BEFORE task/habit detection
  const durationEventMatch = input.match(
    /(?:i\s+(?:want\s+to|will|need\s+to)|let\s+me|schedule|do|plan)?\s*(.+?)\s+for\s+(\d+(?:\.\d+)?)\s*(hour|hr|hrs|minute|min|mins)s?\s*(?:(?:at|@|starting)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?))?(?:\s+(?:on\s+)?(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday))?/i
  );
  if (durationEventMatch) {
    const activityRaw = durationEventMatch[1].trim();
    const amount = parseFloat(durationEventMatch[2]);
    const unit = durationEventMatch[3].toLowerCase();
    const timeStr = durationEventMatch[4];
    const dateStr = durationEventMatch[5];
    const durationMins = unit.startsWith('hour') || unit.startsWith('hr') ? Math.round(amount * 60) : Math.round(amount);

    // Only treat as event if it has a time anchor OR it sounds like an activity (not generic)
    const isActivity = /work\s*out|workout|exercise|gym|run|jog|swim|yoga|meditat|study|read|code|practice|call|meet|class|session|team/i.test(activityRaw);
    if (timeStr || isActivity) {
      const title = activityRaw.replace(/^(?:i\s+(?:want\s+to|will)|let\s+me|schedule|do|plan)\s*/i, '').trim();
      const eventDate = dateStr ? parseFuzzyDate(dateStr) : new Date();
      if (timeStr) {
        const pt = parseClockTime(timeStr);
        if (pt) eventDate.setHours(pt.hour, pt.minute, 0, 0);
      }
      const endDate = new Date(eventDate.getTime() + durationMins * 60 * 1000);
      const timeLabel = timeStr || `${durationMins}min`;
      return { type: 'create_event', title, eventDate, endDate, durationMins, time: timeLabel, isBlock: true };
    }
  }

  // ── CREATE TASK (standard) ──
  const addTaskMatch = input.match(/(?:add|create|new|make)\s+(?:a\s+)?(?:task|todo)[:\s]+(.+)/i) ||
    input.match(/(?:remind me to|i need to|i have to)\s+(.+)/i);

  if (addTaskMatch) {
    const rest = addTaskMatch[1].trim();
    const byMatch = rest.match(/(.+?)\s+by\s+(tomorrow|today|next\s+week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i);
    let title = rest, dueDate = new Date();
    if (byMatch) { title = byMatch[1].trim(); dueDate = parseFuzzyDate(byMatch[2]); }
    const timeMatch = rest.match(/(?:at|@)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    let hasTime = false;
    if (timeMatch) {
      const pt = parseClockTime(timeMatch[1]);
      if (pt) { dueDate = new Date(dueDate); dueDate.setHours(pt.hour, pt.minute, 0, 0); hasTime = true; }
    }
    let priority = 'medium';
    if (/urgent|asap|critical|important|high/i.test(rest)) priority = 'high';
    if (/low\s*priority|whenever|eventually/i.test(rest)) priority = 'low';
    return { type: 'create_task', title, dueDate, priority, hasTime, listId: 'dost' };
  }

  // ── PERSON-BASED TASK (call/meet/text someone) — detects time and saves as event if time given ──
  const personTaskMatch = input.match(/^(?:call|ring|phone|message|text|meet|ping|talk\s+to)\s+([\w\s]+?)(?:\s+(?:at|@)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?))?(?:\s+(?:on\s+)?(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday))?[\s.,!]*$/i);
  if (personTaskMatch) {
    const person = personTaskMatch[1].trim();
    const timeStr = personTaskMatch[2];
    const dateStr = personTaskMatch[3];
    let dueDate = dateStr ? parseFuzzyDate(dateStr) : new Date();
    let hasTime = false;
    if (timeStr) {
      const pt = parseClockTime(timeStr);
      if (pt) { dueDate.setHours(pt.hour, pt.minute, 0, 0); hasTime = true; }
    }
    const verb = input.match(/^(call|ring|phone|message|text|meet|ping|talk\s+to)/i)?.[1] || 'Call';
    const verbTitle = verb.charAt(0).toUpperCase() + verb.slice(1).replace(/\s+to$/i, '');
    const title = `${verbTitle} ${person}`;
    // If a time is specified, create both a task AND a calendar event
    if (hasTime) {
      const endDate = new Date(dueDate.getTime() + 30 * 60 * 1000); // 30min default
      return { type: 'create_task_and_event', title, dueDate, endDate, priority: 'medium', hasTime, listId: 'dost', time: timeStr };
    }
    return { type: 'create_task', title, dueDate, priority: 'medium', hasTime, listId: 'dost' };
  }

  // ── CREATE EVENT (time-range block: class from 2-7, yoga 6-7am) ──
  const timeRangeBlockMatch = input.match(/(?:class|lecture|study\s*(?:session)?|training|workshop|session|appointment|yoga|gym\s*class|spinning|dance|tuition|college|school)\s+(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (timeRangeBlockMatch) {
    const titleMatch = input.match(/^([\w\s]+?)(?:\s+from|\s+\d)/i);
    const title = (titleMatch?.[1]?.trim() || 'Event').replace(/^\s*(a|an|the)\s+/i, '');
    const start = parseClockTime(timeRangeBlockMatch[1]);
    const end = parseClockTime(timeRangeBlockMatch[2]);
    const eventDate = new Date();
    const endDate = new Date();
    if (start) eventDate.setHours(start.hour, start.minute, 0, 0);
    if (end) endDate.setHours(end.hour, end.minute, 0, 0);
    return { type: 'create_event', title, eventDate, endDate, time: `${timeRangeBlockMatch[1]} – ${timeRangeBlockMatch[2]}`, isBlock: true };
  }

  // ── CREATE EVENT/MEETING (standard) ──
  const eventMatch = input.match(/(?:add|create|schedule|set|book)\s+(?:a\s+|an\s+|me\s+(?:a\s+|an\s+)?)?(?:meeting|event|appointment|call|session)[:\s]+(.+)/i)
    || input.match(/(?:add|create|schedule|set|book)\s+(?:a\s+|an\s+|me\s+(?:a\s+|an\s+)?)(.+?)(?:\s+(?:meeting|event|appointment|call))/i);
  if (eventMatch) {
    const rest = eventMatch[1].trim();
    // Use a wider time regex to capture AM/PM reliably
    const timeStr = rest.match(/(?:at|@)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)?.[1];
    const dateMatch = rest.match(/(?:on\s+|)(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    const durMatch = rest.match(/(?:for)\s+(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)/i);
    let title = rest
      .replace(/(?:at|@)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, '')
      .replace(/(?:for)\s+\d+(?:\.\d+)?\s*(?:hour|hr|minute|min)s?/i, '')
      .replace(/(?:on\s+)?(?:tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, '')
      .replace(/^\s*[,\s]+|[,\s]+$/g, '').trim();
    if (!title) title = 'Meeting';
    // Start from a clean date (midnight) so setHours is precise
    const baseDateSrc = dateMatch ? parseFuzzyDate(dateMatch[1]) : new Date();
    const eventDate = new Date(baseDateSrc);
    eventDate.setSeconds(0, 0);
    if (timeStr) {
      const pt = parseClockTime(timeStr); // uses the fixed parseClockTime, no inline AM/PM hack
      if (pt) eventDate.setHours(pt.hour, pt.minute, 0, 0);
    }
    let endDate = null;
    if (durMatch) {
      const dMins = durMatch[2].startsWith('hour') || durMatch[2].startsWith('hr')
        ? Math.round(parseFloat(durMatch[1]) * 60) : Math.round(parseFloat(durMatch[1]));
      endDate = new Date(eventDate.getTime() + dMins * 60 * 1000);
    }
    return { type: 'create_event', title, eventDate, endDate, time: timeStr || null };
  }

  // ── NATURAL HABIT with time, duration and date extraction ──
  // Extended to catch ANY activity, not just a fixed list
  const habitTimeMatch = input.match(
    /(?:i\s+(?:want\s+to|will|would\s+like\s+to|plan\s+to)|let\s+me|starting|i\s+should)\s+(.+?)(?:\s+(?:at|@)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?))?(?:\s+for\s+(\d+)\s*(days?|weeks?|months?))?(?:\s+for\s+(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)s?)?[\s.,!]*$/i
  );
  if (habitTimeMatch) {
    const activityRaw = habitTimeMatch[1].trim();
    const timeStr = habitTimeMatch[2];
    const durationDaysAmt = habitTimeMatch[3];
    const durationDaysUnit = habitTimeMatch[4];
    const durationMinsAmt = habitTimeMatch[5];
    const durationMinsUnit = habitTimeMatch[6];

    // Only treat this as a habit if it contains habit-like language
    const HABIT_TRIGGERS = /gym|meditat|yoga|run|exercise|workout|jog|swim|read|study|walk|stretch|practice|journa|code|write|draw|paint|cook|diet|fast|wake|sleep|breath|gratitude|reflect/i;
    if (HABIT_TRIGGERS.test(activityRaw)) {
      // Extract activity title
      const cleanActivity = activityRaw
        .replace(/^(?:go\s+(?:to\s+(?:the?\s+)?)?|do\s+|start\s+|practice\s+)/i, '')
        .trim();
      const title = cleanActivity.charAt(0).toUpperCase() + cleanActivity.slice(1);

      // Schedule time
      let scheduleTime = '07:00';
      if (timeStr) {
        const pt = parseClockTime(timeStr);
        if (pt) scheduleTime = `${String(pt.hour).padStart(2, '0')}:${String(pt.minute).padStart(2, '0')}`;
      } else if (/evening|night/i.test(input)) {
        scheduleTime = '18:00';
      } else if (/afternoon/i.test(input)) {
        scheduleTime = '15:00';
      }

      // Streak goal from days/weeks/months
      let streakGoal = 30;
      if (durationDaysAmt && durationDaysUnit) {
        const n = parseInt(durationDaysAmt);
        if (durationDaysUnit.startsWith('week')) streakGoal = n * 7;
        else if (durationDaysUnit.startsWith('month')) streakGoal = n * 30;
        else streakGoal = n;
      } else {
        // Try parseDurationDays fallback
        const fd = parseDurationDays(input);
        if (fd) streakGoal = fd;
      }

      // Focus duration in minutes
      let focusDuration = 30;
      if (durationMinsAmt && durationMinsUnit) {
        const n = parseFloat(durationMinsAmt);
        focusDuration = durationMinsUnit.startsWith('hour') || durationMinsUnit.startsWith('hr')
          ? Math.round(n * 60) : Math.round(n);
      }

      const category = detectCategory(title);
      return { type: 'create_habit', title, duration: focusDuration, category, streakGoal, scheduleTime };
    }
  }

  // ── CREATE HABIT (standard: add habit: ...) ──
  const addHabitMatch = input.match(/(?:add|create|new|start)\s+(?:a\s+)?habit[:\s]+(.+)/i);
  if (addHabitMatch) {
    const rest = addHabitMatch[1].trim();
    const durMinsMatch = rest.match(/(?:for\s+)?(\d+)\s*(?:min|minutes?)/i);
    const timeStr = rest.match(/(?:at|@)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)?.[1];
    let title = rest, duration = 30;
    if (durMinsMatch) { title = rest.replace(durMinsMatch[0], '').trim(); duration = parseInt(durMinsMatch[1]); }
    const goalDays = parseDurationDays(rest);
    const cleanTitle = title
      .replace(/\s+for\s+(?:next\s+)?\d+\s*(?:days?|weeks?|months?)/i, '')
      .replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, '')
      .trim();

    let scheduleTime = '07:00';
    if (timeStr) {
      const pt = parseClockTime(timeStr);
      if (pt) scheduleTime = `${String(pt.hour).padStart(2, '0')}:${String(pt.minute).padStart(2, '0')}`;
    } else if (/evening|night/i.test(rest)) {
      scheduleTime = '18:00';
    } else if (/afternoon/i.test(rest)) {
      scheduleTime = '15:00';
    }
    const category = detectCategory(cleanTitle);
    return { type: 'create_habit', title: cleanTitle, duration, category, streakGoal: goalDays || 30, scheduleTime };
  }

  // ── NATURAL HABIT (I want to go gym for 20 days) — simple fallback ──
  const wantHabitMatch = input.match(/(?:i\s+want\s+to|i\s+(?:will|plan\s+to|gonna|going\s+to)|let\s+me|starting|i\s+should)\s+(?:go\s+(?:to\s+(?:the?\s+)?)?|do\s+|start\s+|practice\s+)?(?:gym|meditat|yoga|run|exercise|workout|jog|swim|read|study|walk|stretch)/i)
    || input.match(/(?:gym|meditation|yoga|running|jogging|swimming|reading|workout|walking|stretching)\s+(?:every\s+(?:day|morning|evening)|for\s+(?:next\s+)?\d+\s*(?:days?|weeks?|months?))/i);
  if (wantHabitMatch) {
    const actMatch = input.match(/(?:gym|meditat(?:ion|e)?|yoga|run(?:ning)?|exercis(?:e|ing)?|workout|jog(?:ging)?|swim(?:ming)?|read(?:ing)?|study(?:ing)?|walk(?:ing)?|stretch(?:ing)?)/i);
    const rawAct = actMatch?.[0] || 'Exercise';
    const title = rawAct.charAt(0).toUpperCase() + rawAct.slice(1).toLowerCase()
      .replace(/ning$/, '').replace(/ing$/, '').replace(/ion$/, '').replace(/e$/, '');
    const goalDays = parseDurationDays(input);
    let scheduleTime = '07:00';
    if (/evening|pm\b|night/i.test(input)) scheduleTime = '18:00';
    if (/morning|early/i.test(input)) scheduleTime = '07:00';
    if (/afternoon/i.test(input)) scheduleTime = '15:00';
    // Check for explicit time
    const tStr = input.match(/(?:at|@)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)?.[1];
    if (tStr) {
      const pt = parseClockTime(tStr);
      if (pt) scheduleTime = `${String(pt.hour).padStart(2, '0')}:${String(pt.minute).padStart(2, '0')}`;
    }
    const durationMinsMatch = input.match(/for\s+(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)/i);
    let focusDuration = 30;
    if (durationMinsMatch) {
      const n = parseFloat(durationMinsMatch[1]);
      focusDuration = durationMinsMatch[2].startsWith('hour') || durationMinsMatch[2].startsWith('hr')
        ? Math.round(n * 60) : Math.round(n);
    }
    const category = detectCategory(title);
    return { type: 'create_habit', title, duration: focusDuration, category, streakGoal: goalDays || 30, scheduleTime };
  }

  // ── DELETE OPERATIONS ──
  const deleteMatch = input.match(/(?:delete|remove|cancel|stop)\s+(?:the\s+)?(task|habit)[:\s]*(.+)/i);
  if (deleteMatch) {
    const type = deleteMatch[1].toLowerCase();
    const query = deleteMatch[2].trim().toLowerCase();
    if (type === 'task') {
      const found = tasks.find(t => t.title.toLowerCase().includes(query));
      return { type: 'delete_task', query, found };
    } else {
      const found = habits.find(h => h.title.toLowerCase().includes(query));
      return { type: 'delete_habit', query, found };
    }
  }

  // ── EDIT OPERATIONS ──
  const editMatch = input.match(/(?:edit|update|change|rename)\s+(?:the\s+)?(task|habit)[:\s]*(.+?)(?:\s+to\s+(.+))?$/i);
  if (editMatch) {
    const type = editMatch[1].toLowerCase();
    const query = editMatch[2].trim().toLowerCase();
    const newValue = editMatch[3]?.trim();
    if (type === 'task') {
      const found = tasks.find(t => t.title.toLowerCase().includes(query));
      return { type: 'edit_task', query, newValue, found };
    } else {
      const found = habits.find(h => h.title.toLowerCase().includes(query));
      return { type: 'edit_habit', query, newValue, found };
    }
  }

  // ── COMPLETE TASK ──
  if (/(?:complete|done|finish|mark done)\s+(?:the\s+)?task[:\s]*(.+)/i.test(lower)) {
    const query = input.match(/(?:complete|done|finish|mark done)\s+(?:the\s+)?task[:\s]*(.+)/i)[1].trim().toLowerCase();
    const found = tasks.find(t => t.title.toLowerCase().includes(query) && !t.completed);
    return { type: 'complete_task', query, found };
  }

  if (/how.*(?:are|is).*(?:my\s+)?habits?|habit.*status|my\s+habits?|habits?\s+status|show.*habits?|habits?\??$/i.test(lower)) return { type: 'habit_status' };
  if (/(?:my\s+)?streak|(?:\d+)\s*days?\s*(?:of\s+)?streak|show.*streak|streak.*status/i.test(lower)) return { type: 'habit_status' };
  if (/mood|how.*feel|emotion|feeling|how\s+am\s+i/i.test(lower)) return { type: 'mood_check' };
  if (/summar|overview|daily.*report|weekly.*report|recap|my\s+day|today.*glance/i.test(lower)) return { type: 'summarize' };
  if (/hello|hi|hey|what's up|howdy|good\s*(?:morning|afternoon|evening)/i.test(lower)) return { type: 'greeting' };
  if (/stress|overwhelm|anxious|worried|tired|exhausted/i.test(lower)) return { type: 'wellbeing' };
  if (/motivat|lazy|procrastinat|can't start|stuck/i.test(lower)) return { type: 'motivation' };
  if (/focus|pomodoro|concentrate|distract/i.test(lower)) return { type: 'focus' };
  if (/thank|thanks|appreciate/i.test(lower)) return { type: 'thanks' };

  return { type: 'general', input };
}

/* ── Helper: fuzzy date parser ── */
function parseFuzzyDate(text) {
  const lower = text.toLowerCase();
  const today = new Date();
  if (lower === 'today') return today;
  if (lower === 'tomorrow') return addDays(today, 1);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIdx = days.indexOf(lower);
  if (dayIdx >= 0) {
    const todayDay = today.getDay();
    const diff = ((dayIdx - todayDay) + 7) % 7 || 7;
    return addDays(today, diff);
  }
  try {
    const parsed = parse(text, 'M/d', new Date());
    if (!isNaN(parsed)) return parsed;
  } catch { }
  return today;
}

/* ── Parse a clock time string → { hour, minute } ── */
function parseClockTime(text) {
  if (!text) return null;
  const m = text.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let hour = parseInt(m[1]);
  const minute = parseInt(m[2] || '0');
  const ampm = (m[3] || '').toLowerCase();
  if (ampm === 'pm' && hour < 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;
  // Only assume PM for small numbers WITHOUT explicit am/pm and that feel like daytime
  // e.g. "3" → 15:00, but "2 am" stays 02:00, "11" stays 11 (not 23)
  if (!ampm && hour >= 1 && hour <= 6) hour += 12; // 1–6 with no AMPM → PM (1pm–6pm)
  // hour 7–11 without ampm = stay as-is (morning)
  return { hour, minute };
}

/* ── Parse duration like "next 20 days", "3 weeks" → number of days ── */
function parseDurationDays(text) {
  const m = text.match(/for\s+(?:next\s+)?(\d+)\s*(days?|weeks?|months?)/i);
  if (!m) return null;
  const n = parseInt(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith('week')) return n * 7;
  if (unit.startsWith('month')) return n * 30;
  return n;
}

/* ── Detect category from title ── */
function detectCategory(title) {
  const l = title.toLowerCase();
  if (/exercise|gym|run|walk|workout|yoga|stretch/i.test(l)) return 'Health';
  if (/read|book|study|learn|course|class/i.test(l)) return 'Learning';
  if (/meditat|breath|mindful|calm|relax/i.test(l)) return 'Mindfulness';
  if (/code|work|meeting|email|project|document/i.test(l)) return 'Work';
  return 'Dost';
}

/* ── Build daily summary from real data ── */
function buildSummary(tasks, habits) {
  const today = new Date();
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return true;
    return new Date(t.dueDate).toDateString() === today.toDateString();
  });
  const completed = todayTasks.filter(t => t.completed).length;
  const pending = todayTasks.filter(t => !t.completed).length;
  const highPriority = todayTasks.filter(t => !t.completed && t.priority === 'high').length;

  const habitsDone = habits.filter(h => h.todayDone).length;
  const habitsTotal = habits.length;
  const bestStreakHabit = habits.length > 0
    ? habits.reduce((best, h) => (h.bestStreak || h.streak) > (best.bestStreak || best.streak) ? h : best, habits[0])
    : { title: 'None', streak: 0, bestStreak: 0 };

  let moodText = 'Not logged yet';
  try {
    const moodHistory = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
    const todayMood = moodHistory.filter(m => new Date(m.date).toDateString() === today.toDateString());
    if (todayMood.length > 0) {
      const last = todayMood[todayMood.length - 1];
      moodText = `${last.label} (logged at ${format(new Date(last.date), 'h:mm a')})`;
    }
  } catch { }

  const droppedStreaks = habits.filter(h => h.bestStreak > 3 && h.streak === 0);

  let summary = `📊 **Your Day at a Glance** — ${format(today, 'EEEE, MMMM d')}\n\n`;
  summary += `📋 **Tasks**: ${completed} done, ${pending} pending${highPriority > 0 ? ` (⚠️ ${highPriority} high priority!)` : ''}\n`;
  summary += `🔥 **Habits**: ${habitsDone}/${habitsTotal} completed today\n`;
  summary += `🏆 **Best Streak**: ${bestStreakHabit.title} — ${bestStreakHabit.bestStreak || bestStreakHabit.streak} days\n`;
  summary += `😊 **Mood**: ${moodText}\n`;

  if (droppedStreaks.length > 0) {
    summary += `\n⚠️ **Streak Alerts**: ${droppedStreaks.map(h => h.title).join(', ')} — streaks dropped to 0!`;
  }

  if (pending > 0) {
    summary += `\n\n📌 **Remaining Tasks**:\n`;
    todayTasks.filter(t => !t.completed).slice(0, 5).forEach(t => {
      summary += `  • ${t.title}${t.priority === 'high' ? ' 🔴' : ''}\n`;
    });
  }

  return summary;
}

/* ── Check for scheduling conflicts ── */
function checkConflicts(tasks, newTaskDate) {
  return tasks.filter(t => {
    if (!t.dueDate || t.completed) return false;
    return new Date(t.dueDate).toDateString() === newTaskDate.toDateString();
  });
}

/* ── Build optimal Smart Schedule from today's tasks + habits ── */
function buildSmartSchedule(tasks, habits) {
  const now = new Date();
  const startHour = Math.max(now.getHours() + 1, 7);
  const blocks = [];
  let slot = startHour;

  const addBlock = (id, title, type, emoji, color, durationH, sourceId) => {
    const sh = Math.floor(slot); const sm = slot % 1 >= 0.5 ? 30 : 0;
    const eh = Math.floor(slot + durationH); const em = (slot + durationH) % 1 >= 0.5 ? 30 : 0;
    blocks.push({
      id, title, type, emoji, color, sourceId,
      startTime: `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`,
      endTime: `${String(Math.min(eh, 22)).padStart(2, '0')}:${String(em).padStart(2, '0')}`
    });
    slot += durationH + 0.25; // 15-min gap between blocks
  };

  const pending = tasks.filter(t => !t.completed);
  const todayHabits = habits.filter(h => !h.todayDone);
  const highTasks = pending.filter(t => (t.priority || '').toLowerCase() === 'high');
  const medTasks = pending.filter(t => ['medium', 'med'].includes((t.priority || '').toLowerCase()));
  const lowTasks = pending.filter(t => (t.priority || '').toLowerCase() === 'low');

  if (slot <= 8) addBlock('morning', 'Morning Routine & Hydration', 'break', '🌅', '#f97316', 0.5);

  todayHabits.slice(0, 2).forEach((h, i) =>
    addBlock(`habit-${h.id}`, h.title, 'habit', '🔥', '#f97316', Math.max((h.focusDuration || 25) / 60, 0.5), h.id));

  highTasks.slice(0, 2).forEach((t, i) =>
    addBlock(`high-${t.id}`, t.title, 'task', '🔴', '#ef4444', 1, t.id));

  if (slot > 12 && slot < 14) { addBlock('lunch', 'Lunch Break', 'break', '🍱', '#84cc16', 1); }

  medTasks.slice(0, 2).forEach((t) =>
    addBlock(`med-${t.id}`, t.title, 'task', '🟡', '#f59e0b', 0.75, t.id));

  if (slot < 17) addBlock('focus', 'Deep Focus Session', 'focus', '🎯', '#8b5cf6', 1);

  lowTasks.slice(0, 1).forEach((t) =>
    addBlock(`low-${t.id}`, t.title, 'task', '🟢', '#22c55e', 0.5, t.id));

  if (slot < 21) addBlock('reflect', 'Evening Reflection', 'habit', '📔', '#6366f1', 0.5);

  return blocks.filter(b => parseInt(b.endTime) <= 22);
}

/* ── Save event to calendar localStorage ── */
function saveCalendarEvent(event) {
  try {
    const key = getUserScopedKey('calendar-events');
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(event);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch { }
}

/* ── Check for calendar conflicts at a given time slot ── */
function getCalendarConflicts(eventDate, endDate) {
  try {
    const key = getUserScopedKey('calendar-events');
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newStart = new Date(eventDate).getTime();
    const newEnd = endDate ? new Date(endDate).getTime() : newStart + 3600000;
    return existing.filter(e => {
      const eStart = new Date(e.start).getTime();
      const eEnd = new Date(e.end).getTime();
      // Overlap: new starts before existing ends AND new ends after existing starts
      return newStart < eEnd && newEnd > eStart;
    });
  } catch {
    return [];
  }
}

/* ── Parse CSV text into tasks ── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const titleIdx = headers.findIndex(h => /title|name|task|item/i.test(h));
  const priorityIdx = headers.findIndex(h => /priority|importance/i.test(h));
  const dateIdx = headers.findIndex(h => /date|due|deadline/i.test(h));

  if (titleIdx < 0) return [];

  return lines.slice(1).filter(l => l.trim()).map((line, i) => {
    const cols = line.split(',').map(c => c.trim());
    return {
      id: `import-${Date.now()}-${i}`,
      title: cols[titleIdx] || `Task ${i + 1}`,
      priority: priorityIdx >= 0 ? (cols[priorityIdx] || 'medium').toLowerCase() : 'medium',
      dueDate: dateIdx >= 0 && cols[dateIdx] ? new Date(cols[dateIdx]) : new Date(),
      completed: false,
      starred: false,
      subtasks: [],
      listId: 'default',
      details: '',
    };
  }).filter(t => t.title && t.title !== 'Task');
}


/* ═══════════════════════════════
   DOST MODE COMPONENT
   ═══════════════════════════════ */
export default function DostMode() {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(getUserScopedKey('chat-history'));
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.length > 0 ? parsed : INITIAL_MSG;
      }
    } catch { }
    return INITIAL_MSG;
  });
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [apiError, setApiError] = useState(null); // New error state
  const [isListening, setIsListening] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const pendingEventRef = useRef(null); // stores a conflict-pending event awaiting user confirmation

  const [pendingSchedule, setPendingSchedule] = useState(null);
  const [showSmartReminders, setShowSmartReminders] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    theme, tasks, habits,
    addTask, updateTask, deleteTask, toggleTask,
    addHabit, updateHabit, deleteHabit,
  } = useData();
  const isLight = theme === 'light';

  /* ── Auto-send prefill from navigation state (e.g., Dashboard CTA) ── */
  useEffect(() => {
    if (location.state?.prefill) {
      setInput(location.state.prefill);
      // Clear state so back-navigation doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  /* ── Dynamic welcome message ── */
  const welcomePersonalized = useRef(false);

  const getDynamicWelcome = useCallback(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const incompleteTasks = tasks.filter(t => !t.completed).length;
    const incompleteHabits = habits.filter(h => !h.todayDone).length;
    const topStreak = habits.length > 0
      ? habits.reduce((best, h) => h.streak > best.streak ? h : best, habits[0])
      : null;

    let statusLine = '';
    if (incompleteTasks > 0 || incompleteHabits > 0) {
      const parts = [];
      if (incompleteTasks > 0) parts.push(`**${incompleteTasks}** task${incompleteTasks > 1 ? 's' : ''}`);
      if (incompleteHabits > 0) parts.push(`**${incompleteHabits}** habit${incompleteHabits > 1 ? 's' : ''}`);
      statusLine = `\n\nYou have ${parts.join(' and ')} to tackle today.`;
    } else if (habits.length > 0 || tasks.length > 0) {
      statusLine = '\n\n\u2728 All caught up! Everything is done for today.';
    }

    const streakLine = topStreak && topStreak.streak > 0
      ? `\n\ud83d\udd25 Top streak: **${topStreak.title}** at ${topStreak.streak} days!`
      : '';

    return [{
      id: 1, sender: 'ai', type: 'text',
      content: `${greeting}! I'm **Dost** \u2014 your AI companion in Mithra.${statusLine}${streakLine}\n\nI can create tasks & habits, summarize your day, import files, and more. What would you like to do?`
    }];
  }, [tasks, habits]);

  useEffect(() => {
    if (welcomePersonalized.current) return;
    if (messages.length === 1 && messages[0].id === 1 && messages[0].sender === 'ai' && (habits.length > 0 || tasks.length > 0)) {
      welcomePersonalized.current = true;
      setMessages(getDynamicWelcome());
    }
  }, [habits, tasks, getDynamicWelcome, messages]);

  /* ── Smart Proactive Reminder Chips ── */
  const smartReminderChips = React.useMemo(() => {
    const chips = [];
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    // Overdue tasks (sorted by urgency)
    const overdueTasks = (tasks || []).filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).slice(0, 2);
    overdueTasks.forEach(t => {
      chips.push({
        icon: '⚠️',
        label: `Overdue: ${t.title.slice(0, 28)}${t.title.length > 28 ? '…' : ''}`,
        cmd: `Complete task: ${t.title}`,
        color: 'rgba(239,68,68,0.12)',
        border: 'rgba(239,68,68,0.25)',
        textColor: '#f87171',
        type: 'overdue',
      });
    });

    // Incomplete habits today
    const pendingHabits = (habits || []).filter(h => !h.todayDone).slice(0, 2);
    pendingHabits.forEach(h => {
      chips.push({
        icon: '🔥',
        label: `Habit: ${h.title.slice(0, 26)}${h.title.length > 26 ? '…' : ''}`,
        cmd: `I completed my ${h.title} habit`,
        color: 'rgba(249,115,22,0.10)',
        border: 'rgba(249,115,22,0.22)',
        textColor: '#fb923c',
        type: 'habit',
      });
    });

    // Tasks due today
    const todayTasks = (tasks || []).filter(t => {
      if (t.completed || !t.dueDate) return false;
      return format(new Date(t.dueDate), 'yyyy-MM-dd') === todayStr;
    }).slice(0, 2);
    if (todayTasks.length > 0 && overdueTasks.length === 0) {
      chips.push({
        icon: '📋',
        label: `${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today`,
        cmd: `Summarize my day`,
        color: 'rgba(6,182,212,0.08)',
        border: 'rgba(6,182,212,0.2)',
        textColor: 'var(--accent-color)',
        type: 'summary',
      });
    }

    // If all is caught up and there are habits/tasks, suggest planning
    if (chips.length === 0 && ((tasks || []).length > 0 || (habits || []).length > 0)) {
      chips.push({
        icon: '✨',
        label: 'Plan my day',
        cmd: 'Plan my day',
        color: 'rgba(168,85,247,0.08)',
        border: 'rgba(168,85,247,0.18)',
        textColor: '#a78bfa',
        type: 'plan',
      });
    }

    return chips.slice(0, 4);
  }, [tasks, habits]);

  /* ── Execute NLP-detected actions silently ── */
  const executeCasualActions = useCallback(async (actions) => {
    if (!actions || actions.length === 0) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'complete_habit': {
            // Mark habit as done today (update local state + API)
            const habit = habits.find(h => h.id === action.habit_id);
            if (habit && !habit.todayDone) {
              const newDates = [...(habit.completedDates || []), today];
              const newStreak = (habit.streak || 0) + 1;
              const updated = {
                ...habit,
                completedDates: newDates,
                streak: newStreak,
                bestStreak: Math.max(newStreak, habit.bestStreak || 0),
                todayDone: true
              };
              updateHabit(updated);
              // Sync to API
              if (isFirebaseConfigured) {
                apiFetch(`/habits/${action.habit_id}/complete`, { method: 'POST' })
                  .catch(() => { });
              }
            }
            break;
          }

          case 'log_mood': {
            // Save mood to localStorage and API
            const moodHistory = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
            const labels = { 10: 'Amazing', 9: 'Great', 7: 'Good', 5: 'Okay', 4: 'Tired', 3: 'Stressed', 2: 'Sad', 1: 'Rough' };
            const entry = {
              date: new Date().toISOString(),
              mood: action.score,
              label: labels[action.score] || 'Neutral'
            };
            const updated = [entry, ...moodHistory].slice(0, 30);
            localStorage.setItem(getUserScopedKey('mood-history'), JSON.stringify(updated));

            // Sync to API
            if (isFirebaseConfigured) {
              apiFetch('/mood-logs', {
                method: 'POST',
                body: JSON.stringify({ mood_value: action.score, mood_label: entry.label })
              }).catch(() => { });
            }
            break;
          }

          case 'complete_task': {
            // Mark task as completed
            const task = tasks.find(t => t.id === action.task_id);
            if (task && !task.completed) {
              toggleTask(action.task_id);
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        // Action execution failed silently
      }
    }
  }, [habits, tasks, updateHabit, toggleTask]);

  /* ── Execute AI-structured actions ── */
  const executeAIAction = useCallback(async (action) => {
    if (!action || !action.action || !action.data) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const { action: actionName, data } = action;

    try {
      switch (actionName) {
        case 'complete_task': {
          if (data.id) {
            const task = tasks.find(t => t.id === data.id);
            if (task && !task.completed) {
              toggleTask(data.id);
            }
          }
          break;
        }

        case 'create_task': {
          if (!data.title) break;
          const newTask = {
            id: data.id || `task-${Date.now()}`,
            title: data.title,
            priority: data.priority || 'medium',
            dueDate: data.due_date ? new Date(data.due_date) : new Date(),
            completed: false,
            starred: data.priority === 'high',
            subtasks: [],
            listId: 'dost',
            details: data.notes || '',
            source: 'dost',
          };
          addTask(newTask);
          break;
        }

        case 'update_task': {
          if (!data.id) break;
          const existingTask = tasks.find(t => t.id === data.id);
          if (existingTask) {
            const updatedTask = {
              ...existingTask,
              title: data.title !== undefined ? data.title : existingTask.title,
              priority: data.priority !== undefined ? data.priority : existingTask.priority,
              starred: data.priority !== undefined ? data.priority === 'high' : existingTask.starred,
              dueDate: data.due_date ? new Date(data.due_date) : existingTask.dueDate,
              details: data.notes !== undefined ? data.notes : existingTask.details,
              completed: data.completed !== undefined ? data.completed : existingTask.completed,
            };
            updateTask(updatedTask);
          }
          break;
        }

        case 'complete_habit': {
          if (!data.id) break;
          const habit = habits.find(h => h.id === data.id);
          if (habit && !habit.todayDone) {
            const newDates = [...(habit.completedDates || []), today];
            const newStreak = (habit.streak || 0) + 1;
            const updated = {
              ...habit,
              completedDates: newDates,
              streak: newStreak,
              bestStreak: Math.max(newStreak, habit.bestStreak || 0),
              todayDone: true
            };
            updateHabit(updated);
            if (isFirebaseConfigured) {
              apiFetch(`/habits/${data.id}/complete`, { method: 'POST' })
                .catch(() => {});
            }
          }
          break;
        }

        case 'create_event': {
          if (!data.title || !data.start_time) break;
          const evId = `evt-${Date.now()}`;
          const startTime = new Date(data.start_time);
          const endTime = data.end_time ? new Date(data.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
          
          const calEvent = {
            id: evId,
            title: data.title,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            category: data.category || 'Dost',
            color: 'var(--accent-color)',
            source: 'dost',
          };
          saveCalendarEvent(calEvent);
          
          if (isFirebaseConfigured) {
            apiFetch('/events', {
              method: 'POST',
              body: JSON.stringify({
                title: calEvent.title,
                start: calEvent.start,
                end: calEvent.end,
                category: calEvent.category
              })
            }).catch(() => {});
          }
          
          const eventTask = {
            id: `task-${Date.now()}`,
            title: `📅 ${data.title}`,
            priority: 'high',
            dueDate: startTime,
            completed: false,
            starred: true,
            subtasks: [],
            listId: 'dost',
            details: `Scheduled event: ${format(startTime, 'h:mm a')} – ${format(endTime, 'h:mm a')}`,
            source: 'dost',
          };
          addTask(eventTask);
          break;
        }

        case 'log_mood': {
          const score = parseInt(data.score);
          if (isNaN(score) || score < 1 || score > 5) break;
          
          const moodHistory = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
          const labels = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Rough' };
          const entry = {
            date: new Date().toISOString(),
            mood: score,
            label: labels[score] || 'Okay'
          };
          const updated = [entry, ...moodHistory].slice(0, 30);
          localStorage.setItem(getUserScopedKey('mood-history'), JSON.stringify(updated));
          
          if (isFirebaseConfigured) {
            apiFetch('/mood-logs', {
              method: 'POST',
              body: JSON.stringify({ mood_value: score, mood_label: entry.label })
            }).catch(() => {});
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('[Dost] Failed to execute AI action:', err);
    }
  }, [habits, tasks, updateHabit, toggleTask, addTask, updateTask]);

  // Check if API server is reachable - ONLY if API is configured
  useEffect(() => {
    if (!isAPIConfigured) {
      setIsOnline(false);
      return;
    }
    const checkAPI = async () => {
      try {
        const res = await fetch(`${API_BASE}/`, { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        setIsOnline(data?.status === 'online');
      } catch { setIsOnline(false); }
    };
    checkAPI();
    const interval = setInterval(checkAPI, 30000);
    return () => clearInterval(interval);
  }, []);

  // Save chat history
  useEffect(() => {
    try {
      try {
        localStorage.setItem(getUserScopedKey('chat-history'), JSON.stringify(messages.slice(-80)));
      } catch { }
    } catch { }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Web Speech API — Voice Input ── */
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addAiMsg("Sorry, your browser doesn't support voice input. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  /* ── Helper: add AI message ── */
  const addAiMsg = useCallback((content, extras = {}) => {
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: 'ai',
      type: 'text',
      content,
      ...extras,
    }]);
  }, []);

  /* ── File Import Handler ── */
  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    setIsThinking(true);

    // Add user message showing the upload
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      content: `📎 Uploaded: ${file.name}`,
    }]);

    try {
      if (ext === 'csv') {
        const text = await file.text();
        const importedTasks = parseCSV(text);
        if (importedTasks.length === 0) {
          addAiMsg("I couldn't parse any tasks from that CSV. Make sure it has a 'title' column header.");
        } else {
          importedTasks.forEach(t => addTask(t));
          addAiMsg(`📋 **Imported ${importedTasks.length} tasks** from ${file.name}!\n\n${importedTasks.slice(0, 5).map(t => `• ${t.title}`).join('\n')}${importedTasks.length > 5 ? `\n• ...and ${importedTasks.length - 5} more` : ''}`, { type: 'action' });
        }
      } else if (ext === 'xlsx' || ext === 'xls') {
        // Parse Excel file using SheetJS (dynamic import to avoid 290KB bundle hit)
        try {
          const XLSX = await import('xlsx');
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          if (jsonData.length === 0) {
            addAiMsg(`📄 The Excel file "${file.name}" appears to be empty.`);
          } else {
            // Find title column (first row as headers)
            const headers = jsonData[0].map(h => String(h).toLowerCase().trim());
            const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('task') || h.includes('name') || h.includes('item'));
            const priorityIdx = headers.findIndex(h => h.includes('priority'));
            const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('due'));

            const importedTasks = [];
            for (let i = 1; i < Math.min(jsonData.length, 101); i++) {
              const row = jsonData[i];
              if (!row || row.length === 0) continue;

              // Use title column if found, otherwise use first non-empty cell
              let title = titleIdx >= 0 ? String(row[titleIdx] || '') : String(row[0] || '');
              title = title.trim();
              if (!title || title.length < 2) continue;

              const priority = priorityIdx >= 0 && row[priorityIdx]
                ? String(row[priorityIdx]).toLowerCase().includes('high') ? 'high'
                  : String(row[priorityIdx]).toLowerCase().includes('low') ? 'low' : 'medium'
                : 'medium';

              let dueDate = new Date();
              if (dateIdx >= 0 && row[dateIdx]) {
                const excelDate = row[dateIdx];
                // Excel stores dates as numbers (days since 1/1/1900)
                if (typeof excelDate === 'number') {
                  dueDate = new Date((excelDate - 25569) * 86400 * 1000);
                } else {
                  try { dueDate = new Date(excelDate); } catch { }
                }
              }

              importedTasks.push({
                id: `import-${Date.now()}-${i}`,
                title,
                priority,
                dueDate: isNaN(dueDate.getTime()) ? new Date() : dueDate,
                completed: false,
                starred: false,
                subtasks: [],
                listId: 'default',
                details: '',
              });
            }

            if (importedTasks.length === 0) {
              addAiMsg(`📄 I couldn't find any tasks in "${file.name}". Make sure the first row has column headers like "Title" or "Task".`);
            } else {
              importedTasks.forEach(t => addTask(t));
              addAiMsg(`📊 **Imported ${importedTasks.length} tasks** from Excel!\n\n${importedTasks.slice(0, 5).map(t => `• ${t.title}`).join('\n')}${importedTasks.length > 5 ? `\n• ...and ${importedTasks.length - 5} more` : ''}`, { type: 'action' });
            }
          }
        } catch (xlsxErr) {
          addAiMsg(`📄 I had trouble reading "${file.name}". Try saving it as CSV (File → Save As → CSV) for better compatibility.`);
        }
      } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        const url = URL.createObjectURL(file);
        addAiMsg(`🖼 I received your image "${file.name}". I can see the image, but I can't automatically extract text from it yet.\n\nHere's what you can do:\n1. Type out the tasks/events you see\n2. Use "Add task: <title>" to create each one\n3. Or export the data as CSV/Excel for bulk import`, { imageUrl: url });
      } else {
        try {
          const text = await file.text();
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            const imported = lines.slice(0, 20).map((line, i) => ({
              id: `import-${Date.now()}-${i}`,
              title: line.trim().replace(/^[-•*]\s*/, ''),
              priority: 'medium',
              dueDate: new Date(),
              completed: false,
              starred: false,
              subtasks: [],
              listId: 'default',
              details: '',
            })).filter(t => t.title.length > 1);

            imported.forEach(t => addTask(t));
            addAiMsg(`📋 Imported ${imported.length} items from "${file.name}" as tasks:\n\n${imported.slice(0, 8).map(t => `• ${t.title}`).join('\n')}`);
          }
        } catch {
          addAiMsg(`I couldn't read that file format. Try CSV, Excel, TXT, or image files.`);
        }
      }
    } catch (err) {
      addAiMsg(`Error processing file: ${err.message}`);
    } finally {
      setIsThinking(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [addTask, addAiMsg]);

  /* ── Rate limiter: max 5 AI API calls per 60 seconds ── */
  const apiCallTimestamps = useRef([]);
  const isRateLimited = useCallback(() => {
    const now = Date.now();
    apiCallTimestamps.current = apiCallTimestamps.current.filter(t => now - t < 60000);
    if (apiCallTimestamps.current.length >= 5) return true;
    apiCallTimestamps.current.push(now);
    return false;
  }, []);

  /* ═══════════════════════════════
     MAIN SEND HANDLER — Intent-based routing
     ═══════════════════════════════ */
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', type: 'text', content: input };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setIsThinking(true);

    await new Promise(r => setTimeout(r, 400));

    try {
      const intent = parseIntent(userInput, tasks, habits);

      switch (intent.type) {
        /* ── CREATE TASK ── */
        case 'create_task': {
          if (!intent.title || !intent.title.trim()) {
            addAiMsg(`I couldn't figure out the task title. Try: "Add task: review report by Friday"`);
            break;
          }
          const conflicts = checkConflicts(tasks, intent.dueDate);
          const newTask = {
            id: `task-${Date.now()}`,
            title: intent.title,
            priority: intent.priority,
            dueDate: intent.dueDate,
            completed: false,
            starred: intent.priority === 'high',
            subtasks: [],
            listId: intent.listId || 'default',
            details: intent.hasTime ? `Scheduled at ${format(intent.dueDate, 'h:mm a')}` : '',
            source: 'dost',
          };
          addTask(newTask);
          const timeLine = intent.hasTime ? `\n⏰ Time: ${format(intent.dueDate, 'h:mm a')}` : `\n📅 Due: ${format(intent.dueDate, 'EEEE, MMM d')}`;
          let msg = `✅ **Task created!**\n\n📋 "${intent.title}"${timeLine}\n🎯 Priority: ${intent.priority.toUpperCase()}`;
          if (conflicts.length > 0) {
            msg += `\n\n⚠️ **Heads up** — you already have ${conflicts.length} task${conflicts.length > 1 ? 's' : ''} that day!`;
            conflicts.slice(0, 3).forEach(c => { msg += `\n  • ${c.title}`; });
          }
          addAiMsg(msg, { type: 'task_created', taskData: newTask });
          break;
        }

        /* ── CREATE TASK + CALENDAR EVENT (person call/meet with specific time) ── */
        case 'create_task_and_event': {
          const newTask2 = {
            id: `task-${Date.now()}`,
            title: intent.title,
            priority: intent.priority || 'medium',
            dueDate: intent.dueDate,
            completed: false,
            starred: true,
            subtasks: [],
            listId: intent.listId || 'dost',
            details: `Scheduled at ${format(intent.dueDate, 'h:mm a')}`,
            source: 'dost',
          };
          addTask(newTask2);
          const calEvt2 = {
            id: `evt-${Date.now()}`,
            title: intent.title,
            start: intent.dueDate.toISOString(),
            end: (intent.endDate || new Date(intent.dueDate.getTime() + 1800000)).toISOString(),
            category: 'Dost',
            color: 'var(--accent-color)',
            source: 'dost',
          };
          saveCalendarEvent(calEvt2);
          addAiMsg(
            `✅ **Task + Event created!**\n\n"${intent.title}"\n⏰ Time: **${format(intent.dueDate, 'h:mm a')}**\n📆 ${format(intent.dueDate, 'EEEE, MMM d')}\n\n✅ Saved to your **Calendar** and task list!`,
            { type: 'task_created', taskData: newTask2 }
          );
          break;
        }

        /* ── CREATE EVENT/MEETING ── */
        case 'create_event': {
          const evId = `evt-${Date.now()}`;
          const durMins = intent.durationMins;
          const endDateForEvent = intent.endDate
            ? intent.endDate
            : new Date(intent.eventDate.getTime() + 3600000);

          // \u2500\u2500 Conflict detection: check if any existing event overlaps this slot \u2500\u2500
          const conflicts = getCalendarConflicts(intent.eventDate, endDateForEvent);
          if (conflicts.length > 0) {
            // Store pending intent so user can confirm later
            const pending = { ...intent, endDate: endDateForEvent, _evId: evId, _durMins: durMins };
            pendingEventRef.current = pending;
            const conflictList = conflicts.slice(0, 3).map(c => `• **${c.title}** (${format(new Date(c.start), 'h:mm a')} \u2013 ${format(new Date(c.end), 'h:mm a')})`).join('\n');
            addAiMsg(
              `\u26a0\ufe0f **Time slot already booked!**\n\n${conflictList}\n\n📅 You still want to add **"${intent.title}"** at **${format(intent.eventDate, 'h:mm a, MMM d')}**?\n\nReply **"yes"** to keep it or **"no"** to cancel.`,
              { type: 'conflict_prompt' }
            );
            break;
          }

          const calEvent = {
            id: evId,
            title: intent.title,
            start: intent.eventDate.toISOString(),
            end: endDateForEvent.toISOString(),
            category: 'Dost',
            color: 'var(--accent-color)',
            source: 'dost',
          };
          saveCalendarEvent(calEvent);
          const eventTask = {
            id: `task-${Date.now()}`,
            title: `📅 ${intent.title}`,
            priority: 'high',
            dueDate: intent.eventDate,
            completed: false,
            starred: true,
            subtasks: [],
            listId: 'dost',
            details: intent.time ? `Scheduled: ${intent.time}${durMins ? ` (${durMins} min)` : ''}` : '',
            source: 'dost',
          };
          addTask(eventTask);
          const timePart = intent.time ? ` at **${intent.time}**` : '';
          const durPart = durMins ? ` for **${durMins >= 60 ? `${(Math.round(durMins / 60 * 10) / 10)}hr` : `${durMins}min`}**` : '';
          const isBlock = intent.isBlock;
          addAiMsg(
            `📅 **${isBlock ? 'Event' : 'Meeting'} scheduled!**\n\n"✨ ${intent.title}"${timePart}${durPart}\n📆 ${format(intent.eventDate, 'EEEE, MMM d, h:mm a')}\n\n✅ Saved to your **Calendar** and added as a task!`,
            { type: 'task_created', taskData: eventTask }
          );
          break;
        }


        /* ── CREATE HABIT ── */
        case 'create_habit': {
          const goalDays = intent.streakGoal || 30;
          const newHabit = {
            id: `h-${Date.now()}`,
            title: intent.title,
            category: intent.category || 'Dost',
            streak: 0,
            bestStreak: 0,
            consistency: [],
            todayDone: false,
            focusDuration: intent.duration || 30,
            streakGoal: goalDays,
            scheduleTime: intent.scheduleTime || '07:00',
            source: 'dost',
          };
          addHabit(newHabit);
          const habitGoalLine = goalDays !== 30 ? `\n🎯 Goal: **${goalDays} days**` : '';
          const schedTimeFmt = (() => { const [h, mm] = (intent.scheduleTime || '07:00').split(':').map(Number); return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; })();
          addAiMsg(`🔥 **Habit created!**\n\n"${intent.title}"\n⏱ ${intent.duration || 30} min/day\n⏰ Scheduled: **${schedTimeFmt}**\n🏷 Category: ${intent.category}${habitGoalLine}\n\nLet's build that streak! 💪`, {
            type: 'habit_created', habitData: newHabit,
          });
          break;
        }

        /* ── DELETE TASK ── */
        case 'delete_task': {
          if (intent.found) {
            deleteTask(intent.found.id);
            addAiMsg(`🗑 **Task deleted**: "${intent.found.title}"\n\nIt's off your plate!`, {
              type: 'action', actionData: { task: intent.found.title },
            });
          } else {
            const suggestions = tasks.filter(t => !t.completed).slice(0, 5);
            addAiMsg(`I couldn't find a task matching "${intent.query}". Your tasks:\n\n${suggestions.map(t => `• ${t.title}`).join('\n')}\n\nTry: "Delete task <exact name>"`);
          }
          break;
        }

        /* ── DELETE HABIT ── */
        case 'delete_habit': {
          if (intent.found) {
            deleteHabit(intent.found.id);
            addAiMsg(`🗑 **Habit removed**: "${intent.found.title}" (had ${intent.found.streak}-day streak)\n\nFocus on what matters most!`);
          } else {
            addAiMsg(`I couldn't find a habit matching "${intent.query}". Your habits:\n\n${habits.map(h => `• ${h.title} (${h.streak}🔥)`).join('\n')}`);
          }
          break;
        }

        /* ── EDIT TASK ── */
        case 'edit_task': {
          if (intent.found && intent.newValue) {
            const dateMatch = intent.newValue.match(/(?:due\s+)?(?:by\s+)?(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
            if (dateMatch) {
              updateTask({ ...intent.found, dueDate: parseFuzzyDate(dateMatch[1]) });
              addAiMsg(`✏️ Updated "${intent.found.title}" — new due date: ${format(parseFuzzyDate(dateMatch[1]), 'EEEE, MMM d')}`);
            } else {
              updateTask({ ...intent.found, title: intent.newValue });
              addAiMsg(`✏️ Updated: "${intent.found.title}" → "${intent.newValue}"`);
            }
          } else if (intent.found) {
            addAiMsg(`Which part of "${intent.found.title}" do you want to change? Try:\n\n• "Edit task ${intent.found.title} to New Title"\n• "Edit task ${intent.found.title} to due tomorrow"`);
          } else {
            addAiMsg(`I couldn't find a task matching "${intent.query}". Try again with the exact task name.`);
          }
          break;
        }

        /* ── EDIT HABIT ── */
        case 'edit_habit': {
          if (intent.found && intent.newValue) {
            const durMatch = intent.newValue.match(/(\d+)\s*(?:min|minutes?)/i);
            if (durMatch) {
              updateHabit({ ...intent.found, focusDuration: parseInt(durMatch[1]) });
              addAiMsg(`✏️ Updated "${intent.found.title}" — now ${durMatch[1]} min/day`);
            } else {
              updateHabit({ ...intent.found, title: intent.newValue });
              addAiMsg(`✏️ Renamed: "${intent.found.title}" → "${intent.newValue}"`);
            }
          } else {
            addAiMsg(`Which part of "${intent.found?.title || intent.query}" do you want to change?`);
          }
          break;
        }

        /* ── COMPLETE TASK ── */
        case 'complete_task': {
          if (intent.found) {
            toggleTask(intent.found.id);
            addAiMsg(`✅ Done! "${intent.found.title}" is marked complete. Great job! 🎉`);
          } else {
            addAiMsg(`I couldn't find an incomplete task matching "${intent.query}".`);
          }
          break;
        }

        /* ── SUMMARIZE ── */
        case 'summarize': {
          const summary = buildSummary(tasks, habits);
          addAiMsg(summary, { type: 'summary' });
          break;
        }

        /* ── HABIT STATUS ── */
        case 'habit_status': {
          if (!habits || habits.length === 0) {
            addAiMsg("You don't have any habits yet! Try: \"Add habit: Morning Meditation for 15 min\"");
            break;
          }
          let msg = `🔥 **Habit Status**\n\n`;
          habits.forEach(h => {
            const status = h.todayDone ? '✅' : '⬜';
            const streakEmoji = h.streak > 10 ? '🔥' : h.streak > 0 ? '✨' : '❄️';
            msg += `${status} **${h.title}** — ${h.streak} day streak ${streakEmoji} (best: ${h.bestStreak || h.streak})\n`;
          });
          const total = habits.length;
          const done = habits.filter(h => h.todayDone).length;
          msg += `\n📊 Progress: ${done}/${total} done today (${Math.round(done / total * 100)}%)`;
          if (done === total) msg += '\n\n🎉 All habits done — incredible day!';
          else if (done >= total * 0.5) msg += '\n\nAlmost there — keep pushing! 💪';
          else msg += '\n\nStill time to knock these out! Start with one. 🚀';
          addAiMsg(msg);
          break;
        }

        /* ── MOOD CHECK ── */
        case 'mood_check': {
          let moodMsg = '😊 **Mood History**\n\n';
          try {
            const moods = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
            const recent = moods.slice(-7);
            if (recent.length === 0) {
              moodMsg += "You haven't logged any moods yet. Go to the Dashboard and tap an emoji to log your mood!";
            } else {
              recent.forEach(m => {
                const date = format(new Date(m.date), 'MMM d, h:mm a');
                const emoji = ['', '😤', '😔', '😐', '😌', '😊'][m.mood] || '😐';
                moodMsg += `${emoji} **${m.label}** — ${date}\n`;
              });
              const avg = recent.reduce((s, m) => s + m.mood, 0) / recent.length;
              moodMsg += `\n📊 Average mood: ${avg.toFixed(1)}/5 ${avg >= 4 ? '— great vibes! 🌟' : avg >= 3 ? '— steady' : '— take care of yourself 💛'}`;
            }
          } catch { moodMsg += 'No mood data available.'; }
          addAiMsg(moodMsg);
          break;
        }

        /* ── WELLBEING ── */
        case 'wellbeing':
          addAiMsg("Take a deep breath. 🧘\n\nHere's a quick exercise:\n1. **Breathe in** for 4 seconds\n2. **Hold** for 4 seconds\n3. **Breathe out** for 6 seconds\n\nRepeat 3 times. Remember — you don't have to do everything at once. Pick the ONE most important thing and start there.\n\nProgress, not perfection. 💛");
          break;

        case 'motivation':
          addAiMsg("Here's a trick: commit to **just 2 minutes**. Start the task for just 2 minutes — most of the time, you'll keep going once you start. The hardest part is beginning.\n\n\"A journey of a thousand miles begins with a single step.\" — Lao Tzu 🚀\n\nWhat's that one small thing you can start right now?");
          break;

        case 'focus':
          addAiMsg("🎯 **Focus Mode Tips**:\n\n1. Go to the **Habit & Focus Hub** — use the Pomodoro timer\n2. Put your phone in Do Not Disturb\n3. Close unnecessary tabs\n4. Start with 25 min of focused work, then 5 min break\n\nI believe in you — let's lock in! 🔒");
          break;

        case 'greeting':
          addAiMsg(`Hey there! 👋 It's ${format(new Date(), 'EEEE, MMMM d')}.\n\nYou have ${tasks.filter(t => !t.completed).length} pending tasks and ${habits.filter(h => !h.todayDone).length} habits left today.\n\nWhat would you like to work on?`);
          break;

        case 'thanks':
          addAiMsg("You're welcome! 😊 That's what I'm here for. Anything else you need?");
          break;

        /* ── SMART SCHEDULE ── */
        case 'smart_schedule': {
          const scheduleKey = getUserScopedKey(`smart-schedule-${format(new Date(), 'yyyy-MM-dd')}`);
          let usage = {};
          try { usage = JSON.parse(localStorage.getItem(scheduleKey) || '{}'); } catch { }
          const usesLeft = 2 - (usage.uses || 0);
          if (usesLeft <= 0) {
            addAiMsg('⏳ You\'ve used your **Smart Schedule** limit for today (2/2). Come back tomorrow for a fresh plan! 🌅');
            break;
          }
          const schedule = buildSmartSchedule(tasks, habits);
          if (schedule.length === 0) {
            addAiMsg('📋 You have no pending tasks or habits to schedule! Add some tasks first, then I can build you an optimized day.');
            break;
          }
          setPendingSchedule(schedule);
          let preview = `✨ **Smart Schedule Ready!**\n\nHere's your optimized day plan with proper breaks:\n`;
          schedule.slice(0, 3).forEach(b => { preview += `\n**${b.startTime}** — ${b.emoji} ${b.title}`; });
          if (schedule.length > 3) preview += `\n...and ${schedule.length - 3} more blocks`;
          preview += `\n\n💡 **${usesLeft} use${usesLeft > 1 ? 's' : ''} remaining today.** Should I **update your day plan** according to this schedule?`;
          addAiMsg(preview, { type: 'schedule_card', schedule });
          break;
        }

        /* ── SCHEDULE APPLY YES ── */
        case 'schedule_apply_yes': {
          // \u2500\u2500 If a conflicting event is pending confirmation, handle it here first \u2500\u2500
          if (pendingEventRef.current) {
            const p = pendingEventRef.current;
            pendingEventRef.current = null;
            const evId2 = p._evId || `evt-${Date.now()}`;
            const calEvtConfirmed = {
              id: evId2,
              title: p.title,
              start: new Date(p.eventDate).toISOString(),
              end: new Date(p.endDate || new Date(p.eventDate).getTime() + 3600000).toISOString(),
              category: 'Dost',
              color: 'var(--accent-color)',
              source: 'dost',
            };
            saveCalendarEvent(calEvtConfirmed);
            const evTask = {
              id: `task-${Date.now()}`,
              title: `📅 ${p.title}`,
              priority: 'high',
              dueDate: new Date(p.eventDate),
              completed: false,
              starred: true,
              subtasks: [],
              listId: 'dost',
              details: p.time ? `Scheduled: ${p.time}` : '',
              source: 'dost',
            };
            addTask(evTask);
            addAiMsg(
              `✅ **Got it! Event added despite conflict.**\n\n"📅 ${p.title}" — ${format(new Date(p.eventDate), 'h:mm a, MMM d')}\n\nSaved to Calendar and task list!`,
              { type: 'task_created', taskData: evTask }
            );
            break;
          }
          if (!pendingSchedule) {

            addAiMsg('No pending schedule to apply! Say **"plan my day"** first to generate one. 😊');
            break;
          }
          const schedKey = getUserScopedKey(`smart-schedule-${format(new Date(), 'yyyy-MM-dd')}`);
          let usage2 = {};
          try { usage2 = JSON.parse(localStorage.getItem(schedKey) || '{}'); } catch { }
          const usesLeft2 = 2 - (usage2.uses || 0);
          if (usesLeft2 <= 0) {
            addAiMsg('⏳ Smart Schedule limit reached for today. Come back tomorrow!');
            break;
          }
          // Backup current tasks
          const todayTasks = tasks.filter(t => !t.completed && (!t.dueDate || new Date(t.dueDate).toDateString() === new Date().toDateString()));
          const backup = { tasks: todayTasks, uses: (usage2.uses || 0) + 1 };
          localStorage.setItem(schedKey, JSON.stringify(backup));
          // Remove today's pending tasks and add schedule as tasks
          todayTasks.forEach(t => deleteTask(t.id));
          pendingSchedule.filter(b => b.type === 'task' || b.type === 'habit').forEach(block => {
            const t = {
              id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              title: block.title,
              priority: block.type === 'task' ? 'medium' : 'low',
              dueDate: (() => { const d = new Date(); const [h, m] = block.startTime.split(':'); d.setHours(parseInt(h), parseInt(m), 0, 0); return d; })(),
              completed: false, starred: false, subtasks: [],
              listId: 'dost',
              details: `Smart Schedule: ${block.startTime} – ${block.endTime}`,
              source: 'smart-schedule',
            };
            addTask(t);
          });
          setPendingSchedule(null);
          const left = usesLeft2 - 1;
          addAiMsg(`✅ **Day plan updated!** Your Smart Schedule is now active.\n\n🔄 Need to undo? Say **"undo schedule"** to restore your original plan.\n📊 **${left} use${left !== 1 ? 's' : ''} remaining** for today.`, { type: 'action' });
          break;
        }

        /* ── SCHEDULE UNDO ── */
        case 'schedule_undo': {
          const schedKey2 = getUserScopedKey(`smart-schedule-${format(new Date(), 'yyyy-MM-dd')}`);
          let backup2 = {};
          try { backup2 = JSON.parse(localStorage.getItem(schedKey2) || '{}'); } catch { }
          if (!backup2.tasks || backup2.tasks.length === 0) {
            addAiMsg('No schedule backup found for today — nothing to restore. 😊');
            break;
          }
          // Remove smart-schedule tasks
          tasks.filter(t => t.source === 'smart-schedule').forEach(t => deleteTask(t.id));
          // Restore backup tasks
          backup2.tasks.forEach(t => addTask(t));
          // Clear backup but keep uses count
          localStorage.setItem(schedKey2, JSON.stringify({ uses: backup2.uses, tasks: [] }));
          addAiMsg(`↩️ **Original plan restored!**\n\n⚠️ **Note:** This counted as one of your 2 daily Smart Schedule uses. You have ${2 - (backup2.uses || 2)} use${2 - (backup2.uses || 2) !== 1 ? 's' : ''} remaining today.`);
          break;
        }

        /* ── GENERAL / SCOPED RESPONSE ── */
        case 'general':
        default: {
          // Check if the question is relevant to our app capabilities
          const appKeywords = /task|habit|mood|journal|summar|schedule|remind|focus|pomodoro|productiv|streak|goal|timer|break|meditat|stress|motivat|wellness|wellbeing|breath|import|csv|excel|meeting|event|calendar|appointment/i;
          const isAppRelated = appKeywords.test(userInput);

          if (isAppRelated && isOnline) {
            if (isRateLimited()) {
              addAiMsg("⏳ You're sending messages too quickly. Please wait a moment before trying again.");
              break;
            }
            try {
              // Build chat history from recent messages (Problem 5)
              const recentMsgs = messages.slice(-20);
              const history = recentMsgs
                .filter(m => m.sender === 'user' || m.sender === 'ai')
                .map(m => ({
                  role: m.sender === 'user' ? 'user' : 'model',
                  parts: [m.content || ''],
                }));

              // Use apiFetch which handles auth token automatically
              const data = await apiFetch('/chat', {
                method: 'POST',
                body: JSON.stringify({
                  message: userInput,
                  history: history.length > 0 ? history : [],
                }),
              });
              addAiMsg(data?.reply || "That's interesting! Tell me more.");

              // Execute any AI-structured action
              if (data?.action) {
                executeAIAction(data.action);
              }

              // Execute any NLP-detected actions silently
              if (data?.actions?.length > 0) {
                executeCasualActions(data.actions);
              }
            } catch (error) {
              setApiError({ message: "Connection failed", input: userInput });
              addAiMsg("I'm having trouble connecting. Please check your internet or try again.", { isError: true });
            }
          } else if (isAppRelated) {
            addAiMsg(getSmartResponse());
          } else {
            addAiMsg("I appreciate your curiosity! 😊 However, I'm best at helping you with things related to **Mithra** — your productivity companion.\n\nHere's what I can help with:\n\n📋 **Tasks** — Create, edit, delete, or complete tasks\n🔥 **Habits** — Add, track, and review habit streaks\n📊 **Summaries** — Get a daily overview of your progress\n😊 **Mood** — Check your mood history and patterns\n🎤 **Voice** — Speak to me using the mic\n📎 **Import** — Upload CSV or Excel files\n⏱ **Focus** — Tips for concentration and productivity\n🧘 **Wellness** — Breathing exercises and motivation\n\nTry asking something like: *\"Summarize my day\"* or *\"Add task: Finish report by tomorrow\"* 💬");
          }
        }
      }
    } catch (err) {
      addAiMsg("Hmm, something went wrong. Try rephrasing your request!");
    } finally {
      setIsThinking(false);
    }
  }, [input, isOnline, tasks, habits, addTask, updateTask, deleteTask, toggleTask, addHabit, updateHabit, deleteHabit, addAiMsg, executeCasualActions, executeAIAction]);

  function getSmartResponse() {
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const doneHabits = habits.filter(h => h.todayDone).length;
    const totalHabits = habits.length;
    const now = new Date();
    const hour = now.getHours();

    let greeting = '';
    if (hour < 12) greeting = 'Good morning!';
    else if (hour < 17) greeting = 'Good afternoon!';
    else greeting = 'Good evening!';

    let contextual = '';
    if (pendingTasks > 3) {
      contextual = `\n\nYou have **${pendingTasks} pending tasks** — want me to help prioritize them? Try \"Summarize my day\" for a full overview.`;
    } else if (doneHabits === totalHabits && totalHabits > 0) {
      contextual = '\n\n🌟 All your habits are done today — incredible discipline! Keep this momentum going.';
    } else if (totalHabits > 0) {
      contextual = `\n\nYou've completed **${doneHabits}/${totalHabits}** habits today. Want to check your streak? Say \"How are my habits?\"`;
    }

    return `${greeting} I'm here to help. 😊${contextual}\n\nHere's what I can do:\n\n📋 **\"Add task: <title>\"** — create a task\n🔥 **\"Add habit: <title>\"** — start a new habit\n📊 **\"Summarize my day\"** — get your daily overview\n🗑 **\"Delete task <name>\"** — remove a task\n✏️ **\"Edit task <name> to <new>\"** — update it\n😊 **\"How is my mood?\"** — review mood history\n\nOr just chat — I'm always here for you! 💬`;
  }

  /* ── Render message content with markdown-like bold ── */
  const renderContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>;
          }
          // Handle bullet points
          if (part.trim().startsWith('•') || part.trim().startsWith('-')) {
            return <span key={j} className="text-[var(--text-dim)] opacity-70">{part}</span>;
          }
          return part;
        })}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatMsgTime = (id) => {
    try {
      const ts = typeof id === 'number' ? new Date(id) : new Date();
      return format(ts, 'h:mm a');
    } catch { return ''; }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative overflow-hidden rounded-2xl shadow-2xl glass-shine"
      style={{ backgroundColor: 'var(--glass-bg-hover)', color: 'var(--text-primary)' }}>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => { handleFileImport(e); if (fileInputRef.current) fileInputRef.current.setAttribute('accept', '.csv,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.webp'); }} />

      {/* BACKGROUND: Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[100px] rounded-full pointer-events-none"
        style={{ background: isLight ? 'rgb(var(--color-visor) / 0.05)' : 'rgb(var(--color-visor) / 0.08)' }} />

      {/* HEADER */}
      <header className="p-4 md:p-6 flex items-center justify-between z-10 backdrop-blur-md"
        style={{ backgroundColor: 'transparent' }}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full transition-all ${isThinking ? 'bg-accent-visor animate-ping' : isListening ? 'bg-red-500 animate-pulse' : isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <h1 className="text-xl font-light tracking-wide">Dost <span className="text-[var(--text-dim)] text-sm opacity-50">AI Companion</span></h1>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isListening ? 'bg-red-500/10 text-red-400 animate-pulse' : isOnline ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
            {isListening ? '🎤 Listening...' : isOnline ? 'AI Online' : 'Smart Mode'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-accent-visor cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)] text-xs"
            title="Import CSV, Excel, or Image">
            <Upload size={14} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button onClick={() => { setMessages(getDynamicWelcome()); welcomePersonalized.current = true; localStorage.removeItem(getUserScopedKey('chat-history')); }}
            className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-red-400 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--glass-bg-hover)] text-xs" title="Clear chat">
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </header>

      {/* IMPORT MODAL */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                background: 'var(--body-bg)',
                backdropFilter: 'blur(40px)',
              }}
            >
              <div className="flex items-center justify-between p-5">
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Import Files</h3>
                <button onClick={() => setShowImportModal(false)} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-dim)]"><X size={20} /></button>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm mb-4" style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
                  Choose a file type to import tasks or data:
                </p>
                {/* Excel Option */}
                <button
                  onClick={() => { fileInputRef.current?.setAttribute('accept', '.xlsx,.xls'); fileInputRef.current?.click(); setShowImportModal(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: isLight ? 'rgb(var(--color-accent) / 0.08)' : 'rgb(var(--color-accent) / 0.1)',
                    border: 'none',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-glow">
                    <Flame size={16} className="text-accent-visor" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium block" style={{ color: 'var(--text-primary)' }}>Excel File</span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>Import from .xlsx or .xls</span>
                  </div>
                </button>
                {/* Image Option */}
                <button
                  onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*'); fileInputRef.current?.click(); setShowImportModal(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: isLight ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.1)',
                    border: 'none',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-600/20">
                    <ImageIcon size={20} className="text-accent-visor" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium block" style={{ color: 'var(--text-primary)' }}>Image File</span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>Upload JPG, PNG, or screenshot</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMART REMINDER BANNER — proactive context chips */}
      <AnimatePresence>
        {showSmartReminders && smartReminderChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="z-10 px-4 md:px-6 pt-3 pb-0 flex items-start gap-2"
          >
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-40 flex-shrink-0"
                style={{ color: 'var(--text-dim)' }}>
                Reminders
              </span>
              {smartReminderChips.map((chip, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setInput(chip.cmd);
                    setTimeout(() => {
                      document.querySelector('[data-dost-input]')?.focus();
                    }, 100);
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                  style={{
                    background: chip.color,
                    border: `1px solid ${chip.border}`,
                    color: chip.textColor,
                  }}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => setShowSmartReminders(false)}
              className="flex-shrink-0 p-1 rounded-lg opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: 'var(--text-dim)' }}
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 z-10 scrollbar-hide">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg transform translate-y-[-5px]">
                <Sparkles size={14} className="text-white" />
              </div>
            )}

            <div className={`max-w-[85%] md:max-w-lg p-5 relative overflow-hidden shadow-sm transition-all
              ${msg.sender === 'user'
                ? 'rounded-2xl rounded-tr-sm text-white'
                : 'rounded-2xl rounded-tl-sm text-[var(--text-primary)]'
              }`}
              style={
                msg.sender === 'user'
                  ? { background: 'var(--accent-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                  : { background: 'var(--surface-bg)', border: '1px solid var(--glass-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
              }
            >
              {/* Text Content with markdown rendering */}
              <div className={clsx("leading-relaxed text-[15px]", msg.sender === 'ai' ? 'font-light' : 'font-normal')}>
                {renderContent(msg.content)}
              </div>

              {/* Timestamp */}
              <div className={`text-[10px] mt-2.5 flex items-center gap-1 opacity-60 ${msg.sender === 'user' ? 'justify-end text-white' : 'text-[var(--text-dim)]'}`}>
                {formatMsgTime(msg.id)}
              </div>

              {/* WIDGET: Smart Schedule card */}
              {msg.type === 'schedule_card' && msg.schedule && (
                <div className="mt-4 space-y-1.5 max-h-60 overflow-y-auto scrollbar-hide">
                  {msg.schedule.map((block) => (
                    <div key={block.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                      style={{ background: `${block.color}12`, borderLeft: `3px solid ${block.color}50` }}>
                      <span className="text-base flex-shrink-0">{block.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{block.title}</p>
                        <p className="text-[10px] opacity-60">{block.startTime} – {block.endTime}</p>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full capitalize flex-shrink-0 font-medium"
                        style={{ background: `${block.color}20`, color: block.color }}>{block.type}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* WIDGET: Task Created */}
              {msg.type === 'task_created' && msg.taskData && (
                <div className="mt-4 p-3.5 rounded-xl border border-white/10 bg-black/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{msg.taskData.title}</p>
                    <p className="text-xs opacity-60">{format(new Date(msg.taskData.dueDate), 'MMM d')} • {msg.taskData.priority}</p>
                  </div>
                </div>
              )}

              {/* WIDGET: Habit Created */}
              {msg.type === 'habit_created' && msg.habitData && (
                <div className="mt-4 p-3.5 rounded-xl border border-white/10 bg-black/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <Flame size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{msg.habitData.title}</p>
                    <p className="text-xs opacity-60">{msg.habitData.focusDuration} min/day</p>
                  </div>
                </div>
              )}

              {/* WIDGET: Action Feedback (Deleted) */}
              {msg.type === 'action' && msg.actionData && (
                <div className="mt-4 p-3.5 bg-red-500/10 rounded-xl flex items-center gap-3 border border-red-500/20">
                  <Trash2 size={16} className="text-red-500" />
                  <span className="text-sm text-red-400 line-through opacity-80">{msg.actionData.task}</span>
                </div>
              )}

              {/* WIDGET: Image preview */}
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Imported" className="mt-3 rounded-xl border border-white/10 max-h-48 object-cover w-full" />
              )}
            </div>
          </motion.div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm"
              style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)' }}>
              <span className="w-2 h-2 bg-accent-visor rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-accent-visor rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-accent-visor rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[var(--text-dim)] text-xs ml-2 opacity-50">Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* ─── QUICK ACTIONS BAR ─── */}
      <div className="px-4 md:px-6 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide z-10"
        style={{ 
          backgroundColor: 'var(--surface-bg)',
          borderTop: '1px solid var(--glass-border)'
        }}>
        {[
          { label: '📊 Summary', cmd: 'Summarize my day' },
          { label: '🔥 Habits', cmd: 'How are my habits?' },
          { label: '😊 Mood', cmd: 'How is my mood?' },
          { label: '📅 Add Event', cmd: 'Add event: ' },
          { label: '🔁 Add Habit', cmd: 'Add habit: ' },
          { label: '📋 Add Task', cmd: 'Add task: ' },
          { label: '📎 Import', cmd: '__import_modal__' },

        ].map(q => (
          <button
            key={q.label}
            onClick={() => {
              if (q.cmd === '__import_modal__') {
                setShowImportModal(true);
              } else if (q.cmd.endsWith(': ')) {
                setInput(q.cmd);
              } else {
                // Direct send
                const userMsg = { id: Date.now(), sender: 'user', type: 'text', content: q.cmd };
                setMessages(p => [...p, userMsg]);
                setIsThinking(true);
                setTimeout(async () => {
                  await new Promise(r => setTimeout(r, 300));
                  const intent = parseIntent(q.cmd, tasks, habits);
                  if (intent.type === 'summarize') {
                    addAiMsg(buildSummary(tasks, habits), { type: 'summary' });
                  } else if (intent.type === 'habit_status') {
                    let msg = `🔥 **Habit Status**\n\n`;
                    habits.forEach(h => {
                      msg += `${h.todayDone ? '✅' : '⬜'} **${h.title}** — ${h.streak} day streak\n`;
                    });
                    const done = habits.filter(h => h.todayDone).length;
                    msg += `\n📊 Progress: ${done}/${habits.length} done today (${Math.round(done / Math.max(habits.length, 1) * 100)}%)`;
                    addAiMsg(msg);
                  } else if (intent.type === 'mood_check') {
                    let moodMsg = '😊 **Mood History**\n\n';
                    try {
                      const moods = JSON.parse(localStorage.getItem(getUserScopedKey('mood-history')) || '[]');
                      const recent = moods.slice(-7);
                      if (recent.length === 0) { moodMsg += 'No moods logged yet! Go to the Dashboard and tap an emoji to get started.'; }
                      else {
                        recent.forEach(m => {
                          const emoji = ['', '😤', '😔', '😐', '😌', '😊'][m.mood] || '😐';
                          moodMsg += `${emoji} **${m.label}** — ${format(new Date(m.date), 'MMM d, h:mm a')}\n`;
                        });
                        const avg = recent.reduce((s, m) => s + m.mood, 0) / recent.length;
                        moodMsg += `\n📊 Average: ${avg.toFixed(1)}/5 ${avg >= 4 ? '— amazing vibes! 🌟' : avg >= 3 ? '— staying steady' : '— take care of yourself 💛'}`;
                      }
                    } catch { }
                    addAiMsg(moodMsg);
                  }
                  setIsThinking(false);
                }, 50);
              }
            }}
            className="whitespace-nowrap text-xs px-3.5 py-2 rounded-full text-slate-700 dark:text-slate-300 hover:text-[var(--text-primary)] hover:bg-accent-visor/10 transition-all flex-shrink-0 font-medium"
            style={{ 
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* ERROR / RETRY BANNER */}
      <AnimatePresence>
        {apiError && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 left-4 right-4 z-40 bg-red-500/90 backdrop-blur-md p-3 rounded-xl flex items-center justify-between text-white shadow-lg mx-auto max-w-2xl">
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <AlertTriangle size={16} />
              <span>{apiError.message}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setApiError(null)} className="p-1.5 hover:bg-[var(--glass-bg-hover)] rounded-lg text-white/70 hover:text-white transition-colors"><X size={16} /></button>
              <button onClick={() => { setInput(apiError.input); setApiError(null); }}
                className="px-3 py-1.5 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors shadow-sm">
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT AREA */}
      <div className="p-4 md:p-6 z-20"
        style={{ backgroundColor: 'transparent' }}>
        <div className="relative group flex items-center gap-2">
          <input
            type="text"
            data-dost-input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={apiError ? "Tap Retry above or type a new message..." : (isListening ? "Listening... speak now 🎤" : "Add task, ask anything, or import files...")}
            className={`w-full text-[var(--text-primary)] rounded-full py-3.5 pl-5 pr-28 focus:outline-none focus:shadow-[0_0_20px_var(--accent-glow)] transition-all placeholder-[var(--text-dim)] text-sm md:text-base shadow-inner bg-black/5`}
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px) saturate(180%)' }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {/* Import button (opens modal) */}
            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 rounded-full text-[var(--text-dim)] hover:text-accent-visor hover:bg-accent-visor/10 transition-all opacity-60 hover:opacity-100"
              title="Import files (CSV, Excel, Image)"
            >
              <Plus size={18} />
            </button>
            {/* Mic Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] opacity-60 hover:opacity-100'}`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2 rounded-full text-white transition-all ${input.trim() ? 'bg-accent-visor hover:scale-105 active:scale-95' : 'bg-[var(--glass-border)] text-[var(--text-dim)] opacity-20'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
