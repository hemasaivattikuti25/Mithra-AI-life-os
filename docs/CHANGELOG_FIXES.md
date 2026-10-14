# 🛠️ Mithra Life OS — Fixes & Optimizations Changelog

This document tracks all fixes, code hygiene improvements, and architecture repairs applied to the Mithra Life OS platform.

---

## Summary of Fixes

| Component | Issue / Bug | Fix Applied | Status |
|---|---|---|---|
| **Schedule Parser** | `AttributeError: 'AsyncOpenAI' object has no attribute 'generate_content'` in `/api/parse-schedule` | Rewrote `parse_schedule` in `tasks_router.py` to use `ai_gateway.generate_chat_response` targeting NVIDIA NIM. Added unit tests in `test_smoke.py`. | ✅ Fixed & Tested |
| **Client Linter** | ESLint v10 failed to run (`eslint.config.js` missing) | Created flat configuration `eslint.config.js` for ESLint 10, React 18, and Vite. Resolved all syntax and rule violations. `npm run lint` now exits 0. | ✅ Fixed & Verified |
| **Error Handling Hook** | Python triple quotes `"""` in `useErrorHandler.js` caused parse failure | Replaced with standard JavaScript block comment `/** ... */`. | ✅ Fixed |
| **Habit Freeze Action** | Action handler `useStreakFreeze` named with `use*` prefix violated React hook rules inside callbacks | Renamed handler to `handleStreakFreeze` in `HabitFocusHub.jsx`. | ✅ Fixed |
| **API Error Handling** | Caught error rethrown without cause in `firebaseClient.js` | Added `{ cause: err }` to preserve error trace under modern ES standards. | ✅ Fixed |
| **Variable Assignments** | Redundant variable assignments in `Dashboard.jsx`, `DostMode.jsx`, `HabitFocusHub.jsx` | Removed dead/redundant variable initializations and regex escape errors. | ✅ Fixed |
| **Calendar Database Sync** | `Calendar.jsx` stored events strictly in `localStorage`, never communicating with backend `/api/events` | Connected `Calendar.jsx` to `/api/events` CRUD. User events now save to PostgreSQL and are visible to Dost AI prompt injection. | ✅ Fixed & Connected |
| **Sync Engine Ping** | `_startHealthCheck` called `/api/ping` instead of `${API_URL}/ping` | Exported `API_URL` from `firebaseClient.js` and prefixed health check in `syncEngine.js`. | ✅ Fixed |
| **Google Calendar OAuth** | Calling `.json()` on `apiFetch` which already returned parsed JSON; unregistered callback route | Fixed `data = await apiFetch(...)` in `GoogleCalendarAuth` and `GoogleCalendarCallback`. Registered `/calendar/callback` in `App.jsx` and added button in `Settings.jsx`. | ✅ Fixed & Integrated |
| **Render Blueprint** | `render.yaml` still referenced `GEMINI_API_KEY` | Updated `render.yaml` with `NVIDIA_API_KEY`, `NVIDIA_BASE_URL`, and `NVIDIA_MODEL`. | ✅ Fixed |
| **Docker Base Image** | `Dockerfile` specified Python 3.10 instead of project standard Python 3.11 | Upgraded base image to `python:3.11-slim`. | ✅ Fixed |
| **Test Dependencies** | Server dev tools (`pytest`, `pytest-asyncio`, `ruff`) missing from requirements | Created `requirements-dev.txt`. | ✅ Added |
| **Validation Status Code** | Deprecation warning for `HTTP_422_UNPROCESSABLE_ENTITY` in Starlette | Used integer status code `422` directly in `core/validators.py`. Test suite passes with 0 warnings. | ✅ Fixed |
