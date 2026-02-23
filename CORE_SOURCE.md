# CORE_SOURCE — Mithra OS (Feb 16 Baseline + 3 Bug Fixes)

> This file contains the key patched source files.  
> All other files are **identical to the Feb 16th commit** (`55579faf`).

---

## Bug Fixes Applied

| # | Bug | File(s) Changed |
|---|-----|----------------|
| 1 | Data loss on logout (tasks persisted across user sessions) | `DataContext.jsx` |
| 2 | AI schedule parser always defaulted to 1-hour events | `main.py` |
| 3 | Habit calendar blocks "slid" forward daily instead of staying fixed | `DataContext.jsx` |

---

## `client-app/server/main.py` — Patched Section (parse-schedule endpoint)

```python
# ─── SCHEDULE PARSER ───
@app.post("/api/parse-schedule")
async def parse_schedule(request: ScheduleRequest, current_user: dict = Depends(get_current_user)):
    try:
        if not model:
            raise HTTPException(status_code=503, detail="AI Service Unavailable")

        today_str = date.today().isoformat()
        prompt = f"""
        Extract calendar events for user {current_user['fullName']}.
        Text: "{request.text}".
        Today: {today_str}.
        Return ONLY JSON array:
        [{{ "title": "...", "start": "ISO", "end": "ISO", "category": "Work|Personal|Health|Focus" }}]

        CRITICAL RULES FOR "end":
        1. If the user says "for 3 hours" or specifies a duration, you MUST add exactly that duration to
           the "start" time to calculate the "end" time. Do not default to 1 hour!
        2. If the user says until a specific time (e.g. "until 5pm"), calculate the exact "end" ISO timestamp.
        3. Only default to 1 hour if the user has absolutely not mentioned any length of time.
        """
        response = model.generate_content(prompt)
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        events = json.loads(clean_json)
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## `client-app/client/src/context/DataContext.jsx` — Patched Sections

### 1. Imports (top of file)

```jsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { format, addDays, subDays, isSameDay, startOfDay, setHours, setMinutes } from 'date-fns';
import { scheduleNotification, isNative, requestNotificationPermission as nativeRequestPermission } from '../native';
import { syncEngine } from '../services/syncEngine';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { listGoogleEvents } from '../services/googleCalendar';
import { useAuth } from './AuthContext';   // ← Bug Fix 1: added import
```

### 2. DataProvider — Clear memory on logout (Bug Fix 1)

```jsx
export function DataProvider({ children }) {
  const { user } = useAuth();   // ← Bug Fix 1

  // ... (all existing state declarations unchanged) ...

  // Wipe memory on logout to prevent data crossover between user sessions
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setHabits([]);
      hasPulledRef.current = false;
    }
  }, [user]);

  // ... rest of DataProvider unchanged ...
}
```

### 3. habitCalendarEvents — Fixed 60-day static window (Bug Fix 3)

```jsx
/* ── Generate calendar events from habits (60-day static window) ── */
const habitCalendarEvents = useMemo(() => {
  if (!syncSettings.syncHabitsToCalendar) return [];

  const events = [];
  const daysToRender = 60; // 15 days past + 45 days future
  // Anchor 15 days ago so the grid is stable and doesn't slide daily
  const todayStart = new Date();
  todayStart.setDate(todayStart.getDate() - 15);
  todayStart.setHours(0, 0, 0, 0);

  habits.forEach((h, index) => {
    let baseHour = 6 + index;
    let baseMin = 0;
    if (h.scheduleTime) {
      const [sh, sm] = h.scheduleTime.split(':').map(Number);
      baseHour = sh;
      baseMin = sm || 0;
    }

    for (let i = 0; i < daysToRender; i++) {
      const targetDate = addDays(todayStart, i);
      if (h.repeatDays && h.repeatDays.length > 0 && !h.repeatDays.includes(targetDate.getDay())) {
        continue;
      }
      const isTodayEvent = targetDate.toDateString() === new Date().toDateString();
      const isPastEvent = targetDate < new Date().setHours(0, 0, 0, 0);
      let isDone = false;
      if (isTodayEvent) {
        isDone = h.todayDone;
      } else if (isPastEvent && h.consistency) {
        isDone = h.consistency.includes(format(targetDate, 'yyyy-MM-dd'));
      }

      events.push({
        id: `habit-${h.id}-day-${i}`,
        title: `${isDone ? '✅' : '🔄'} ${h.title}`,
        start: setMinutes(setHours(targetDate, baseHour), baseMin),
        end: setMinutes(setHours(targetDate, baseHour), baseMin + (h.focusDuration || 25)),
        category: HABIT_CATEGORY_MAP[h.category] || 'Focus',
        location: '',
        description: `Streak: ${h.streak} days | Duration: ${h.focusDuration || 25}m`,
        isHabit: true,
        todayDone: isDone,
        habitColor: h.color,
      });
    }
  });

  return events;
}, [habits, syncSettings.syncHabitsToCalendar]);
```

---

*All other files in the repository are untouched from the Feb 16 commit (`55579faf`).*
