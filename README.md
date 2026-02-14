<div align="center">

<img src="./docs/assets/logo.png" width="72" height="72" />

# Mithra AI — Life Operating System

**Tasks · Habits · Calendar · Journal · Focus · AI Companion**

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mithra-life-os.vercel.app)
[![Stars](https://img.shields.io/github/stars/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=fab005)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/stargazers)
[![License](https://img.shields.io/github/license/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=228be6)](LICENSE)
[![Issues](https://img.shields.io/github/issues/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=fa5252)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/issues)

</div>

---

> Most productivity apps make you manage the app. **Mithra manages your life.**

Mithra is a full-stack AI Life Operating System that unifies everything —
tasks, habits, calendar, journal, and an AI companion with real memory —
into one offline-first workspace. Built solo, from scratch.

---

## 🎬 Demo

<!-- Replace demo.gif with real screen recording -->
![Mithra Demo](./docs/demo.gif)

---

## ✨ Features

| Module | What it does |
|--------|-------------|
| 🤖 **Dost AI** | AI companion powered by Gemini + RAG vector memory from your journal |
| ✅ **Tasks** | Full CRUD, subtasks, priorities, recurring, CSV/Excel import |
| 🔥 **Habits** | GitHub-style 365-day consistency heatmap, streak milestones |
| 📅 **Calendar** | Google Calendar sync, Day/Week/Month views, collision-free layout |
| 📓 **Journal** | Mood tracking, mind pattern analysis, weekly trend chart |
| ⏱️ **Focus** | Pomodoro timer + stopwatch, custom sessions, session history |
| 🌐 **Offline-first** | Custom sync engine — works without internet, syncs on reconnect |
| 📱 **Android app** | Native APK via Capacitor |

---

## 🛠️ Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · Framer Motion · Capacitor

**Backend:** FastAPI · Python · bcrypt · JWT Auth

**Database:** Supabase (PostgreSQL + pgvector) · Row Level Security

**AI:** Gemini 1.5 Flash · RAG (vector embeddings + semantic search)

**Deploy:** Vercel (frontend) · Railway (backend)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- Supabase account (free tier works)
- Gemini API key (free at https://ai.google.dev)

### 1. Clone
```bash
git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
cd Mithra-AI-life-os
```

### 2. Frontend
```bash
cd client-app/client
npm install
cp .env.example .env   # add your Supabase keys
npm run dev
```

### 3. Backend (optional — for AI features)
```bash
cd client-app/server
pip install -r requirements.txt
cp .env.example .env   # add GEMINI_API_KEY, SUPABASE_URL, JWT_SECRET
uvicorn main:app --reload
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (passlib)
- Stateless **JWT authentication** (30-day tokens)
- **Row Level Security** enabled on all Supabase tables
- CORS locked to production domain only
- No secrets in source code

---

## 🌐 Live Demo

👉 **[https://mithra-life-os.vercel.app](https://mithra-life-os.vercel.app)**

---

## 📬 Contact

<div align="center">

<img src="./docs/assets/hemasai.jpeg" width="120" height="120" style="border-radius: 50%; object-fit: cover;" />

### Hemasai Vattikuti
**Founder & Solo Developer**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hemsaivattikuti)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hemasaivattikuti25)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:hemasaivattikuti25@gmail.com)

</div>

---

## 📱 Download Android App

[![Download APK](https://img.shields.io/badge/Download_APK-v1.0.0-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/releases/download/v1.0.0/mithra-ai-v1.0.0.apk)

**Direct Download:** [mithra-ai-v1.0.0.apk](./mithra-ai-v1.0.0.apk)


---

## 🔎 Keywords

Productivity, React, FastAPI, Supabase, Gemini AI, Habit Tracker, Pomodoro, Journal, Offline-first, PWA, Life OS, Android App, Task Manager, Focus Timer, AI Assistant, Vector Database, RAG, Semantic Search

---

<div align="center">
  Built with ❤️ in India &nbsp;·&nbsp; MIT License
</div>
