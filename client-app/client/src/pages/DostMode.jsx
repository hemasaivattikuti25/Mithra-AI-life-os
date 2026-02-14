import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Trash2, Calendar, Wifi, WifiOff,
  Plus, Edit3, CheckCircle2, Circle, Flame, FileText,
  Upload, AlertTriangle, Clock, BarChart3, Sparkles,
  X, FileSpreadsheet, Image as ImageIcon
} from 'lucide-react';
import { useData, getUserScopedKey } from '../context/DataContext';
import { format, addDays, parse } from 'date-fns';
import axios from 'axios';
import * as XLSX from 'xlsx';

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
    content: "Hey! I'm Dost — your AI companion in Mithra. Here's what I can do:\n\n🗂 **Create tasks/habits** — \"Add task: Finish report by tomorrow\"\n✏️ **Edit/Delete** — \"Delete task Finish report\" or \"Edit habit Reading to 45 min\"\n📊 **Summarize** — \"Summarize my day\" or \"How are my habits?\"\n🎤 **Voice** — Tap the mic to speak\n📎 **Import files** — Upload CSV, Excel, or images\n⚠️ **Conflicts** — I'll warn you about scheduling overlaps\n\nWhat would you like to do?"
  },
];

/* ═══════════════════════════════
   INTENT PARSER — detects user commands
   ═══════════════════════════════ */
function parseIntent(input, tasks, habits) {
  const lower = input.toLowerCase().trim();

  // ── CREATE TASK ──
  const addTaskPatterns = [
    /(?:add|create|new|make)\s+(?:a\s+)?task[:\s]+(.+)/i,
    /(?:add|create)\s+(?:a\s+)?(?:new\s+)?todo[:\s]+(.+)/i,
    /(?:remind me to|i need to|i have to)\s+(.+)/i,
  ];
  for (const p of addTaskPatterns) {
    const m = input.match(p);
    if (m) {
      const rest = m[1].trim();
      const byMatch = rest.match(/(.+?)\s+by\s+(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i);
      let title = rest, dueDate = new Date();
      if (byMatch) {
        title = byMatch[1].trim();
        dueDate = parseFuzzyDate(byMatch[2]);
      }
      let priority = 'medium';
      if (/urgent|asap|critical|important/i.test(rest)) priority = 'high';
      if (/low\s*priority|whenever|eventually/i.test(rest)) priority = 'low';
      return { type: 'create_task', title, dueDate, priority };
    }
  }

  // ── CREATE HABIT ──
  const addHabitMatch = input.match(/(?:add|create|new|start)\s+(?:a\s+)?habit[:\s]+(.+)/i);
  if (addHabitMatch) {
    const rest = addHabitMatch[1].trim();
    const durMatch = rest.match(/(.+?)\s+(?:for\s+)?(\d+)\s*(?:min|minutes?)/i);
    let title = rest, duration = 30;
    if (durMatch) { title = durMatch[1].trim(); duration = parseInt(durMatch[2]); }
    const category = detectCategory(title);
    return { type: 'create_habit', title, duration, category };
  }

  // ── DELETE TASK ──
  const deleteTaskMatch = input.match(/(?:delete|remove|cancel)\s+(?:the\s+)?task[:\s]*(.+)/i);
  if (deleteTaskMatch) {
    const query = deleteTaskMatch[1].trim().toLowerCase();
    const found = tasks.find(t => t.title.toLowerCase().includes(query));
    return { type: 'delete_task', query, found };
  }

  // ── DELETE HABIT ──
  const deleteHabitMatch = input.match(/(?:delete|remove|stop)\s+(?:the\s+)?habit[:\s]*(.+)/i);
  if (deleteHabitMatch) {
    const query = deleteHabitMatch[1].trim().toLowerCase();
    const found = habits.find(h => h.title.toLowerCase().includes(query));
    return { type: 'delete_habit', query, found };
  }

  // ── EDIT TASK ──
  const editTaskMatch = input.match(/(?:edit|update|change|rename)\s+(?:the\s+)?task[:\s]*(.+?)(?:\s+to\s+(.+))?$/i);
  if (editTaskMatch) {
    const query = editTaskMatch[1].trim().toLowerCase();
    const newValue = editTaskMatch[2]?.trim();
    const found = tasks.find(t => t.title.toLowerCase().includes(query));
    return { type: 'edit_task', query, newValue, found };
  }

  // ── EDIT HABIT ──
  const editHabitMatch = input.match(/(?:edit|update|change)\s+(?:the\s+)?habit[:\s]*(.+?)(?:\s+to\s+(.+))?$/i);
  if (editHabitMatch) {
    const query = editHabitMatch[1].trim().toLowerCase();
    const newValue = editHabitMatch[2]?.trim();
    const found = habits.find(h => h.title.toLowerCase().includes(query));
    return { type: 'edit_habit', query, newValue, found };
  }

  // ── COMPLETE TASK ──
  if (/(?:complete|done|finish|mark done)\s+(?:the\s+)?task[:\s]*(.+)/i.test(lower)) {
    const query = input.match(/(?:complete|done|finish|mark done)\s+(?:the\s+)?task[:\s]*(.+)/i)[1].trim().toLowerCase();
    const found = tasks.find(t => t.title.toLowerCase().includes(query) && !t.completed);
    return { type: 'complete_task', query, found };
  }

  // ── HABIT STATUS ── (check before summarize to avoid false matches)
  if (/how.*(?:are|is).*(?:my\s+)?habits?|habit.*status|my\s+habits?|habits?\s+status|show.*habits?|habits?\??$/i.test(lower)) {
    return { type: 'habit_status' };
  }

  // ── STREAK CHECK ──
  if (/(?:my\s+)?streak|(?:\d+)\s*days?\s*(?:of\s+)?streak|show.*streak|streak.*status/i.test(lower)) {
    return { type: 'habit_status' };
  }

  // ── MOOD CHECK ──
  if (/mood|how.*feel|emotion|feeling|how\s+am\s+i/i.test(lower)) {
    return { type: 'mood_check' };
  }

  // ── SUMMARIZE ── (check after specific queries)
  if (/summar|overview|daily.*report|weekly.*report|recap|my\s+day\b|today.*glance/i.test(lower)) {
    return { type: 'summarize' };
  }

  // ── SMART RESPONSES ──
  if (/hello|hi|hey|what's up|howdy/i.test(lower)) return { type: 'greeting' };
  if (/stress|overwhelm|anxious|worried/i.test(lower)) return { type: 'wellbeing' };
  if (/motivat|lazy|procrastinat|can't start/i.test(lower)) return { type: 'motivation' };
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

/* ── Detect category from title ── */
function detectCategory(title) {
  const l = title.toLowerCase();
  if (/exercise|gym|run|walk|workout|yoga|stretch/i.test(l)) return 'Health';
  if (/read|book|study|learn|course|class/i.test(l)) return 'Learning';
  if (/meditat|breath|mindful|calm|relax/i.test(l)) return 'Mindfulness';
  if (/code|work|meeting|email|project|document/i.test(l)) return 'Work';
  return 'Personal';
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

  const {
    theme, tasks, habits,
    addTask, updateTask, deleteTask, toggleTask,
    addHabit, updateHabit, deleteHabit,
  } = useData();
  const isLight = theme === 'light';

  // Check if API server is reachable - ONLY if API is configured
  useEffect(() => {
    if (!isAPIConfigured) {
      setIsOnline(false);
      return;
    }
    const checkAPI = async () => {
      try {
        const res = await axios.get(`${API_BASE}/`, { timeout: 3000 });
        setIsOnline(res.data?.status === 'online');
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
    recognition.onerror = (event) => {
      console.warn('Speech error:', event.error);
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
        // Parse Excel file using SheetJS
        try {
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
          console.error('Excel parse error:', xlsxErr);
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
            addAiMsg(`I couldn't figure out the task title. Try saying something like "Add task: review the report by Friday".`);
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
            listId: intent.priority === 'high' ? 'work' : 'default',
            details: '',
          };
          addTask(newTask);

          let msg = `✅ **Task created!**\n\n📋 "${intent.title}"\n📅 Due: ${format(intent.dueDate, 'EEEE, MMM d')}\n🎯 Priority: ${intent.priority.toUpperCase()}`;

          if (conflicts.length > 0) {
            msg += `\n\n⚠️ **Heads up** — you already have ${conflicts.length} task${conflicts.length > 1 ? 's' : ''} on that day:`;
            conflicts.slice(0, 3).forEach(c => { msg += `\n  • ${c.title}`; });
            msg += `\n\nMake sure you have enough bandwidth!`;
          }

          addAiMsg(msg, { type: 'task_created', taskData: newTask });
          break;
        }

        /* ── CREATE HABIT ── */
        case 'create_habit': {
          const newHabit = {
            id: `h-${Date.now()}`,
            title: intent.title,
            category: intent.category,
            streak: 0,
            bestStreak: 0,
            consistency: [],
            todayDone: false,
            focusDuration: intent.duration,
          };
          addHabit(newHabit);
          addAiMsg(`🔥 **Habit created!**\n\n"${intent.title}"\n⏱ ${intent.duration} min/day\n🏷 Category: ${intent.category}\n\nLet's build that streak! 💪`, {
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

        /* ── GENERAL / SCOPED RESPONSE ── */
        case 'general':
        default: {
          // Check if the question is relevant to our app capabilities
          const appKeywords = /task|habit|mood|journal|summar|schedule|remind|focus|pomodoro|productiv|streak|goal|timer|break|meditat|stress|motivat|wellness|wellbeing|breath|import|csv|excel/i;
          const isAppRelated = appKeywords.test(userInput);

          if (isAppRelated && isOnline) {
            if (isRateLimited()) {
              addAiMsg("⏳ You're sending messages too quickly. Please wait a moment before trying again.");
              break;
            }
            try {
              const res = await axios.post(`${API_BASE}/api/chat`, {
                message: userInput,
                user_id: 'default',
                current_tasks: tasks.map(t => ({ title: t.title, priority: t.priority, completed: t.completed, dueDate: t.dueDate })),
                current_habits: habits.map(h => ({ title: h.title, streak: h.streak, todayDone: h.todayDone })),
              }, { timeout: 30000 });
              addAiMsg(res.data?.reply || "That's interesting! Tell me more.");
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
  }, [input, isOnline, tasks, habits, addTask, updateTask, deleteTask, toggleTask, addHabit, updateHabit, deleteHabit, addAiMsg]);

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
    <div className="flex flex-col h-[calc(100vh-6rem)] relative overflow-hidden rounded-2xl shadow-2xl"
      style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)' }}>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => { handleFileImport(e); if (fileInputRef.current) fileInputRef.current.setAttribute('accept', '.csv,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.webp'); }} />

      {/* BACKGROUND: Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[100px] rounded-full pointer-events-none"
        style={{ background: isLight ? 'rgb(var(--color-visor) / 0.05)' : 'rgb(var(--color-visor) / 0.08)' }} />

      {/* HEADER */}
      <header className="p-4 md:p-6 flex items-center justify-between z-10 backdrop-blur-md"
        style={{ backgroundColor: 'var(--glass-bg-hover)' }}>
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
          <button onClick={() => { setMessages(INITIAL_MSG); localStorage.removeItem(getUserScopedKey('chat-history')); }}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
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
                {/* CSV Option */}
                <button
                  onClick={() => { fileInputRef.current?.setAttribute('accept', '.csv,.txt'); fileInputRef.current?.click(); setShowImportModal(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: isLight ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.1)',
                    border: 'none',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/20">
                    <FileSpreadsheet size={20} className="text-green-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium block" style={{ color: 'var(--text-primary)' }}>CSV File</span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)', opacity: 0.5 }}>Import tasks from .csv or .txt</span>
                  </div>
                </button>
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

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 z-10 scrollbar-hide">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-md p-4 rounded-2xl relative overflow-hidden shadow-sm
              ${msg.sender === 'user'
                ? ''
                : 'text-[var(--text-primary)]'
              }`}
              style={
                msg.sender === 'user'
                  ? { background: 'var(--accent-color)', opacity: 0.9, backdropFilter: 'blur(20px) saturate(180%)' }
                  : { background: 'var(--surface-bg)', border: '1px solid var(--glass-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
              }
            >
              {/* Text Content with markdown rendering */}
              <div className="leading-relaxed text-sm md:text-base">{renderContent(msg.content)}</div>

              {/* Timestamp */}
              <div className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-white/40 text-right' : 'text-[var(--text-dim)]/40'}`}>
                {formatMsgTime(msg.id)}
              </div>

              {/* WIDGET: Task Created */}
              {msg.type === 'task_created' && msg.taskData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 rounded-lg flex items-center gap-3"
                  style={{ background: isLight ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.1)' }}>
                  <Plus size={16} className="text-green-500" />
                  <span className="text-sm font-medium">{msg.taskData.title}</span>
                  <span className="ml-auto text-[10px] text-green-400 font-bold uppercase">Added</span>
                </motion.div>
              )}

              {/* WIDGET: Habit Created */}
              {msg.type === 'habit_created' && msg.habitData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 rounded-lg flex items-center gap-3"
                  style={{ background: isLight ? 'rgba(249,115,22,0.08)' : 'rgba(249,115,22,0.1)' }}>
                  <Flame size={16} className="text-orange-500" />
                  <span className="text-sm font-medium">{msg.habitData.title}</span>
                  <span className="ml-auto text-[10px] text-accent-visor font-bold uppercase">New Habit</span>
                </motion.div>
              )}

              {/* WIDGET: Action Feedback (Deleted) */}
              {msg.type === 'action' && msg.actionData && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 bg-red-900/20 rounded-lg flex items-center gap-3">
                  <Trash2 size={16} className="text-red-500" />
                  <span className="text-sm text-red-200 line-through">{msg.actionData.task}</span>
                  <span className="ml-auto text-xs text-red-400 font-bold uppercase">Removed</span>
                </motion.div>
              )}

              {/* WIDGET: Image preview */}
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Imported" className="mt-3 rounded-lg max-h-40 object-cover w-full" />
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
        style={{ backgroundColor: 'var(--glass-bg)' }}>
        {[
          { label: '📊 Summary', cmd: 'Summarize my day' },
          { label: '🔥 Habits', cmd: 'How are my habits?' },
          { label: '😊 Mood', cmd: 'How is my mood?' },
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
            className="whitespace-nowrap text-xs px-3.5 py-2 rounded-full text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-accent-visor/5 transition-all flex-shrink-0 font-medium"
            style={{ background: 'var(--glass-bg)' }}
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
              <button onClick={() => setApiError(null)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"><X size={16} /></button>
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
        style={{ backgroundColor: 'var(--glass-bg-hover)' }}>
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
