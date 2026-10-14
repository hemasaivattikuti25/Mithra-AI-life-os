# 📡 Mithra Life OS — REST API Reference

All backend API routes reside under the `/api` prefix unless otherwise specified. Authenticated routes require an `Authorization: Bearer <FIREBASE_JWT_TOKEN>` header.

---

## 1. System & Health

### `GET /`
Returns the status of backend subsystems (database and AI gateway).
* **Auth Required:** No
* **Sample Response:**
```json
{
  "status": "online",
  "system": "Mithra Brain Active",
  "version": "4.0.0",
  "services": {
    "database": "connected",
    "ai": "available (NVIDIA NIM)"
  },
  "timestamp": "2026-10-14T16:20:00.000000"
}
```

### `GET /ping`
Lightweight health check for Render, load balancers, and client ping monitors.
* **Auth Required:** No
* **Sample Response:** `{"pong": true}`

---

## 2. AI & Assistant (Dost AI)

### `POST /api/chat`
Conversational chat endpoint with dynamic context injection and action execution.
* **Auth Required:** Yes
* **Request Body:**
```json
{
  "message": "Can you schedule a meeting with team tomorrow at 10am?",
  "history": [
    { "role": "user", "parts": ["Hi Dost"] },
    { "role": "model", "parts": ["Hello! How can I help you today?"] }
  ]
}
```
* **Sample Response:**
```json
{
  "reply": "I have scheduled your team meeting for tomorrow at 10:00 AM.",
  "action": {
    "action": "create_event",
    "data": {
      "title": "Team Meeting",
      "start_time": "2026-10-15T10:00:00",
      "end_time": "2026-10-15T11:00:00",
      "category": "Work"
    }
  },
  "actions": [],
  "memory_used": false,
  "context_used": true,
  "usage": { "plan_id": "free", "daily_ai_limit": 20, "today_ai_calls": 3 }
}
```

### `POST /api/parse-schedule`
Extracts structured calendar events from natural language text using NVIDIA NIM.
* **Auth Required:** Yes
* **Request Body:**
```json
{
  "text": "Dentist appointment at 3pm for 45 minutes on Friday"
}
```
* **Sample Response:**
```json
{
  "events": [
    {
      "title": "Dentist appointment",
      "start": "2026-10-16T15:00:00",
      "end": "2026-10-16T15:45:00",
      "category": "Health"
    }
  ]
}
```

---

## 3. Daily Planner

### `POST /api/plan/today`
Generates an AI-optimized time-blocked schedule based on incomplete tasks and active habits.
* **Auth Required:** Yes
* **Request Body:**
```json
{
  "energy_level": "medium",
  "focus_areas": ["work", "health"],
  "force_refresh": false
}
```

### `GET /api/plan/usage`
Returns user AI tier limits and today's consumption.
* **Auth Required:** Yes
* **Sample Response:**
```json
{
  "plan_id": "free",
  "daily_ai_limit": 20,
  "today_ai_calls": 2,
  "remaining": 18
}
```

---

## 4. Tasks & Activities

### `GET /api/tasks`
Lists authenticated user tasks.
* **Query Parameters:** `workspace_id` (optional), `completed` (optional boolean), `limit` (int, default 50), `offset` (int, default 0).

### `POST /api/tasks`
Creates a new task.
* **Request Body:**
```json
{
  "title": "Complete quarterly tax report",
  "details": "Gather receipts and deductions",
  "priority": "high",
  "due_date": "2026-10-20T17:00:00Z",
  "starred": true,
  "list_id": "work",
  "subtasks": [
    { "id": "st-1", "title": "Export invoices", "completed": false }
  ]
}
```

### `PUT /api/tasks/{task_id}`
Updates an existing task by ID.

### `DELETE /api/tasks/{task_id}`
Deletes a task by ID.

---

## 5. Calendar Events

### `GET /api/events`
Lists all user calendar events ordered by start time.
* **Auth Required:** Yes

### `POST /api/events`
Creates an event in the database.
* **Request Body:**
```json
{
  "title": "Quarterly Planning",
  "start": "2026-10-15T09:00:00Z",
  "end": "2026-10-15T11:00:00Z",
  "category": "Work"
}
```

### `DELETE /api/events/{event_id}`
Deletes an event from the database.
* **Auth Required:** Yes

---

## 6. Habits & Journal

* `GET /api/habits` — Retrieve active habits and completion streaks.
* `POST /api/habits` — Create a new habit tracker.
* `PUT /api/habits/{habit_id}` — Update habit details or mark streak completion.
* `DELETE /api/habits/{habit_id}` — Remove a habit.
* `GET /api/journal` — Retrieve journal history with mood logs.
* `POST /api/journal` — Save a new journal reflection with mood score.
* `DELETE /api/journal/{entry_id}` — Delete a journal reflection.
