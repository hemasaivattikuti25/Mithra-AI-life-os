<div align="center">
  <img src="./docs/assets/logo.png" alt="Mithra Life OS Logo" width="150" />
  <h1>Mithra Life OS</h1>
  <p><b>The AI-First Productivity Operating System</b></p>
  <p><i>Manage your entire life from one place — or just text a bot.</i></p>
  
  [![Live App](https://img.shields.io/badge/Live-App-00E5FF?style=for-the-badge&logo=vercel&logoColor=black)](https://mithra-lifeos.com)
  [![GitHub stars](https://img.shields.io/github/stars/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=00E5FF)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/stargazers)
  [![GitHub issues](https://img.shields.io/github/issues/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=00E5FF)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/issues)
  [![License](https://img.shields.io/badge/License-MIT-00E5FF?style=for-the-badge)](LICENSE)
</div>

<br />

## 📖 About Mithra Life OS

**Mithra** is an AI-powered life operating system that unifies task management, habit tracking, smart scheduling, and AI journaling into a single, hyper-fast interface. Built for professionals, students, and anyone who refuses to juggle five different apps.

What makes Mithra different? **AI is not a feature — it's the foundation.** Every interaction is backed by a context-aware engine that knows your tasks, your habits, your mood, and your schedule. And soon, you won't even need to open the app — just text a WhatsApp or Telegram bot and your AI assistant handles the rest.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **🚀 Mission Control** | A unified dashboard with real-time productivity trends, AI usage metrics, streak counters, and active focus sessions. |
| **✅ Smart Tasks** | Nested subtasks, drag-and-drop reordering, priority flagging, recurring schedules, and Google Calendar syncing. |
| **🔥 Habit Focus Hub** | GitHub-style heatmap streaks, multi-session focus timers, streak freeze protection, and synergy tracking. |
| **🤝 Mithra Blend** | Real-time shared workspaces. Link habits with friends and track aggregate completion scores via a unified slider. |
| **📓 Zen Journal** | AI-analyzed daily entries powered by Google Gemini. Mood trajectory mapping with rich text editing. |
| **🧠 Dost AI** | A conversational AI companion aware of your full life context — predicts workflows, reviews habits, and gives personalized advice. |
| **📊 AI Analytics** | Token usage tracking, model performance insights, and intelligent rate limiting to keep AI interactions efficient. |
| **🔄 Sync Engine** | Optimistic UI with bi-directional sync, offline queuing, and automatic conflict resolution. |

---

## 🤖 The Vision: AI-First Automation

Mithra is evolving beyond a web app into an **AI-driven automation layer** for your life:

> **"Just text it. Everything gets done."**

### WhatsApp & Telegram Bot Integration *(Coming Soon)*
- **Add tasks via text**: Send *"Add meeting with Raj tomorrow 3pm"* → task appears in your calendar instantly
- **Get daily summaries**: Receive your morning briefing with today's tasks, habit streaks, and AI-planned schedule
- **Log habits on the go**: Text *"Done: gym, reading"* → habits checked off, streaks updated
- **Journal by voice**: Forward a voice note → AI transcribes, analyzes mood, saves to your journal
- **Smart reminders**: AI-timed nudges based on your patterns, not arbitrary alarms

### AI Command Engine
- Natural language parsing for all CRUD operations
- Context-aware responses (knows your full task/habit/journal history)
- Multi-turn conversations with RAG memory
- Proactive suggestions based on behavior patterns

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Framer Motion, TailwindCSS, Capacitor (Android/iOS) |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **Database** | Neon PostgreSQL, pgvector (AI embeddings) |
| **Authentication** | Firebase Auth (Email/Password + Google OAuth) |
| **AI Engine** | Google Gemini 1.5 Flash, RAG pipeline, context-aware prompts |
| **Deployment** | Vercel (Frontend), Render (Backend) |
| **Upcoming** | WhatsApp Business API, Telegram Bot API, Webhooks |

---

## 📸 See It In Action

<div align="center">
  <img src="./docs/assets/dashboard.png" alt="Dashboard — Mission Control" width="48%" />
  <img src="./docs/assets/dost-ai.png" alt="Dost AI Companion" width="48%" />
  <br/><br/>
  <img src="./docs/assets/habits.png" alt="Habit Tracking & Streaks" width="48%" />
  <img src="./docs/assets/journal.png" alt="Zen Journal with AI Analysis" width="48%" />
  <br/><br/>
  <img src="./docs/assets/calendar.png" alt="Smart Calendar" width="48%" />
  <img src="./docs/assets/tasks.png" alt="Task Management" width="48%" />
</div>

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** v18+ &nbsp;·&nbsp; **Python** v3.10+
* **Firebase** project (free tier)
* **Neon** PostgreSQL database (free tier)
* **Gemini API Key** from Google AI Studio

### Backend Setup
```bash
git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
cd Mithra-AI-life-os/client-app/server

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Fill in your credentials
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env   # Fill in your Firebase config
npm run dev
```

---

## 🔐 Environment Variables

### Server (`/client-app/server/.env`)
| Variable | Description |
| :--- | :--- |
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK JSON key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `ENVIRONMENT` | `development` or `production` |

### Client (`/client-app/client/.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_API_URL` | Backend URL (`http://localhost:8000` or Render URL) |

---

## 🗂️ Project Structure

```text
Mithra-AI-life-os/
├── client-app/
│   ├── client/                  # React Frontend (Vite + Capacitor)
│   │   ├── public/              # Static assets, manifest, service worker
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── context/         # Auth & Data providers
│   │   │   ├── pages/           # Route-level views
│   │   │   └── services/        # Firebase client, API layer, sync engine
│   │   └── android/             # Capacitor Android wrapper
│   └── server/                  # FastAPI Backend
│       ├── core/                # Config, security, rate limiting
│       ├── routers/             # REST endpoints (Chat, Tasks, Calendar, Workspaces)
│       ├── schemas/             # Pydantic models
│       ├── services/            # AI engine, auth, calendar logic
│       └── main.py              # Application entrypoint
├── docs/                        # Screenshots & promotional assets
└── README.md
```

---

## 🗺️ Roadmap

### Completed
- [x] Zero-trust Row Level Security in PostgreSQL
- [x] Firebase Auth migration (Email/Password + Google OAuth)
- [x] "Mithra Blend" — real-time shared habit tracking workspaces
- [x] Dost AI with RAG memory and full life-context awareness
- [x] AI-powered journal analysis with mood trajectory mapping
- [x] Sync engine with offline queuing and conflict resolution
- [x] Capacitor Android build pipeline
- [x] Dost AI natural language meeting/event creation
- [x] Glass morphism UI system with per-page ambient shine
- [x] Streak freeze system with earned/used tracking

### In Progress
- [ ] **WhatsApp Bot** — Add tasks, log habits, get summaries via text message
- [ ] **Telegram Bot** — Full Mithra control from Telegram with inline commands
- [ ] **AI Command Engine** — Natural language parsing for all app operations
- [ ] **Proactive AI Nudges** — Smart reminders based on behavior patterns, not timers
- [ ] **Voice-to-Action** — Forward voice notes → AI transcribes and executes commands

### Planned
- [ ] Native iOS Capacitor wrapper + App Store release
- [ ] Offline-first sync with background push
- [ ] AI Daily Planner — auto-generated optimal schedules based on your history
- [ ] Habit AI Coach — personalized improvement suggestions from streak data
- [ ] Multi-language support (Hindi, Telugu, Spanish, Japanese)
- [ ] Public API for third-party integrations

---

## 💡 Improvement Ideas & What's Next

> Real-world features that would take Mithra to the next level.

### 🔥 High Impact — Should Build Next
| Idea | Why It Matters |
| :--- | :--- |
| **Google Calendar 2-Way Sync** | Users already manage events in Google Calendar. Bi-directional sync means no context switching — events created in Mithra show in GCal and vice versa. |
| **Push Notifications (Web + FCM)** | Habit reminders, task due-date alerts, and Dost nudges are useless without real push notifications. Web Push API + Firebase Cloud Messaging for mobile. |
| **Habit Templates & Presets** | "30-Day Fitness", "Study Streak", "Mindfulness Pack" — pre-built habit bundles that users can one-tap install. Reduces onboarding friction massively. |
| **AI Daily Planner (Auto-Schedule)** | Use task priorities, habit schedules, and calendar events to generate an optimal time-blocked daily plan every morning. The killer feature for productivity apps. |
| **Weekly AI Productivity Report** | Every Sunday, generate a PDF/email with: tasks completed, habit streaks, focus hours, mood trends, and AI-powered suggestions for the next week. |
| **Voice Input for Dost AI** | Web Speech API for real-time voice → text. "Hey Dost, add gym at 6am tomorrow" without typing. Critical for mobile users. |

### 🚀 Medium Impact — Powerful Differentiators
| Idea | Why It Matters |
| :--- | :--- |
| **Gamification Engine** | XP for completing tasks, leveling up for streaks, badges for milestones (📊 "100 Tasks", 🔥 "30-Day Streak", 🧘 "Zen Master"). Dopamine loops keep users coming back. |
| **Focus Mode with Pomodoro** | Built-in 25/5 Pomodoro timer tied to tasks. Auto-log focus sessions, show stats. Integration with system DND on mobile via Capacitor. |
| **Keyboard Shortcuts** | `Cmd+K` for command palette, `N` for new task, `H` for new habit, `J` for new journal entry. Power users need this. |
| **Data Export (CSV/PDF)** | Export tasks, habits, journal entries as CSV or styled PDF. Users want to own their data. Required for serious productivity tools. |
| **Smart Conflict Detection** | When adding a habit at 6AM but there's already a task due at 6AM, warn the user. Time-clash awareness across all modules. |
| **Collaborative Journal in Blend** | Shared journal entries within Blend workspaces. Accountability partners can read each other's reflections. |

### 🌍 Long-Term Vision
| Idea | Why It Matters |
| :--- | :--- |
| **WhatsApp/Telegram Bot** | "Just text it" — the ultimate frictionless entry point. Add tasks, check habits, get summaries, all from messenger. No app open needed. |
| **Offline-First Architecture** | IndexedDB + Service Worker caching so the app works fully offline. Sync when back online. Essential for mobile users with patchy connections. |
| **AI Behavioral Insights** | "You're 3x more productive on Tuesdays", "You skip gym after late nights". AI finds patterns humans miss and gives actionable nudges. |
| **Plugin/Extension System** | Let users or devs add custom widgets to the dashboard — Spotify player, weather, stock ticker, etc. Platform thinking. |
| **Multi-Language Support** | Hindi, Telugu, Spanish, Japanese. Gemini already supports these — just needs UI localization and prompt translation. |
| **Public REST API** | Let power users connect Mithra to Zapier, IFTTT, n8n. Automations like: "When I complete a task in Mithra → update Notion". |
| **Desktop App (Electron/Tauri)** | Native desktop experience with system tray, global shortcuts, and menubar quick-add. Tauri for lightweight builds. |
| **Apple Watch / Wear OS** | Glanceable habit status, quick-complete actions from the wrist. Premium feature territory. |

---

## 🤝 Contributing

Contributions are welcome and appreciated.

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 📬 Contact

**Hema Sai Vattikuti** — Backend & Applied AI Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hemasai-vattikuti-61266b268/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hemasaivattikuti25)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sivasaiohm2005@gmail.com)

**Live App:** [https://mithra-lifeos.com](https://mithra-lifeos.com)
