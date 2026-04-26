
<div align="center">
  <img src="./client/public/assets/logo.png" alt="Mithra Logo" width="120" />
  <h1>Mithra — AI Life OS</h1>
  <p>
    <strong>The AI-first productivity OS. Use the web app — or just text a bot.</strong><br>
    Tasks · Habits · Focus · Journaling · AI Companion · WhatsApp & Telegram Bots
  </p>

  <p>
    <a href="https://mithra-lifeos.com">
      <img src="https://img.shields.io/badge/Live_App-Visit-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live App" />
    </a>
    <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os/stargazers">
      <img src="https://img.shields.io/github/stars/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&logo=github&color=yellow" alt="Stars" />
    </a>
    <a href="https://github.com/hemasaivattikuti25/Mithra-AI-life-os/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=blue" alt="License" />
    </a>
  </p>
</div>

---

### **Overview**
Mithra is an AI-powered productivity operating system that replaces your scattered tools with a single, unified interface. It combines task management, habit tracking, focus timers, AI journaling, and a context-aware AI companion — all wrapped in a midnight & cyan aesthetic built for speed and deep work.

**What's next?** We're building WhatsApp and Telegram bots so you can control everything by text message — add tasks, log habits, get daily summaries — without ever opening the app.

---

### **Key Features**

#### 🧠 **Dost AI Companion**
- **Full Life Context**: Knows your tasks, habits, streaks, journal entries, and schedule
- **Natural Language**: *"Add a meeting tomorrow at 2 PM"* or *"Summarize my week"*
- **RAG Memory**: Recalls past entries for personalized, contextual advice
- **Voice Mode**: Speak to capture ideas using the Web Speech API

#### ⚡ **Tasks & Scheduling**
- **Smart Calendar**: Bi-directional sync with Google Calendar
- **Collision Detection**: Auto-adjusts overlapping events
- **Recurring Tasks**: Daily, weekly, monthly repetition rules
- **Priority Matrix**: Visual High/Medium/Low indicators

#### 🔥 **Habits & Streaks**
- **Heatmap Tracking**: GitHub-style activity graph per habit
- **Streak Freeze**: Smart protection against accidental resets
- **Milestone Rewards**: Celebrations for hitting streak goals
- **Blend Mode**: Share habits with friends — track together in real-time

#### 🧘 **Focus & Wellness**
- **Pomodoro Timer**: Customizable work/break intervals
- **Mood Tracking**: Daily 1–10 emotional check-ins
- **Zen Journal**: Rich text editor with AI mood analysis and tagging

#### 🤖 **Dost AI Companion**
- **RAG Memory**: Remembers your journal entries, tasks, and moods using semantic search
- **Natural Language**: "Add a meeting tomorrow at 2 PM" or "Summarize my week"
- **Context Aware**: Gives personalized, stoic advice based on your life patterns
- **Seamless Integration**: Operates across all app modules (tasks, habits, calendar, journal)

---

### **Tech Stack**

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Framer Motion, Capacitor |
| **State** | Context API + Sync Engine (Optimistic UI, Offline Queue) |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **Database** | Neon PostgreSQL, pgvector (AI embeddings) |
| **Auth** | Firebase Auth (Email/Password + Google OAuth) |
| **AI** | Advanced AI Engine, RAG pipeline, semantic search |
| **Deployment** | Vercel (Frontend), Render (Backend) |
| **Upcoming** | WhatsApp Business API, Telegram Bot API |

---

### **Getting Started**

#### **Prerequisites**
- Node.js 18+
- Python 3.10+
- Firebase project (free tier)
- Neon PostgreSQL database (free tier)
- AI API Key for Dost AI features

#### **Backend**
```bash
cd client-app/server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Add your credentials
uvicorn main:app --reload --port 8000
```

#### **Frontend**
```bash
cd client-app/client
npm install
cp .env.example .env   # Add your Firebase config
npm run dev
```

#### **Android (Capacitor)**
```bash
npm run android        # Build + sync + open in Android Studio
npm run android:run    # Build + sync + run on device
```

---

### **Deployment**
- **Frontend**: Deployed on **Vercel** (root directory: `client-app/client`)
- **Backend**: Deployed on **Render** (root directory: `client-app/server`)

Environment variables must be set on both platforms — see the root [README](../README.md) for the full list.

---



---

### **Contributing**
Contributions welcome! Fork → Branch → Commit → PR.

---

<div align="center">
  <sub>Built by <b>Hemasai Vattikuti</b> — Backend & Applied AI Engineer. Built production systems at DRDL–DRDO (Ministry of Defence). Shipping Mithra Life OS with 690+ users, RAG semantic search, and zero-trust architecture.</sub>
</div>
