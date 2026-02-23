<div align="center">

<img src="./docs/assets/logo.png" width="100" height="100" />

# Mithra Life OS
**The Precision-Engineered Personal Operating System**

A full-stack, AI-integrated workspace for high achievers — synchronizing your Tasks, Habits, Calendar, and Journals with a long-term memory companion.

---

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mithra-life-os.vercel.app)
[![Android APK](https://img.shields.io/badge/Download_APK-v3.0.0-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/releases)
[![Stars](https://img.shields.io/github/stars/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=fab005)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/stargazers)
[![License](https://img.shields.io/github/license/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=228be6)](LICENSE)

</div>

---

## 💎 The Vision
**Mithra Life OS** is not another productivity app. It's a foundational layer for your life. Most apps force you to adapt to their workflow; Mithra adapts to yours by unifying your digital memory into a single, beautiful, and intelligent interface.

### 🌟 Why Mithra?
- **Unified Identity**: Stop context-switching between 7 different apps.
- **Deep Memory**: Dost AI remembers your journals and moods to provide personalized context.
- **Seamless Synergy**: Use "Mithra Blend" to collaborate on goals with partners and friends.
- **Privacy First**: Fully hardened Row Level Security (RLS) and custom data encryption.

---

## 🛠️ The Architecture

| Layer | Technology | Secret Sauce |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Vanilla CSS, Framer Motion, Luxe Physics |
| **Backend** | FastAPI (Python) | Clean Architecture, Structured Logging, Rate Limiting |
| **Database** | Supabase (Postgres) | pgvector, Custom RLS Guards, Real-time Synergy |
| **AI Engine** | Gemini 1.5 Flash | RAG (Vector Search) + Long-term context memory |
| **Mobile** | Capacitor | Native bridge for Android/iOS builds |

---

## ✨ Core Systems

### 🤖 Dost AI — Your Stoic Companion
Powered by **Gemini 1.5 + RAG**, Dost doesn't just chat. It retrieves context from your journals and tasks to offer guidance that matters. It understands your emotional trajectory over time.

### ✅ Smart Tasks & Lists
High-performance task management with subtasks, recurring schedules, and priority logic. Supports Kanban and standard list views for maximum flexibility.

### 🔥 Habits & Heatmaps
Visualize your growth with GitHub-style 365-day heatmaps. Track streaks, reach milestones, and categorize habits into life dimensions.

### 👫 Mithra Blend
Productivity is better together. Create shared workspaces, invite friends via secure links, and track streaks as a team. Accountability built-in.

### 📅 Unified Calendar
Full Google Calendar synchronization. AI natural language parsing allows you to "Schedule meeting tomorrow at 3pm for 1 hour" instantly.

### 🌍 Native Mobile Dominance
Mithra is optimized for mobile. Download the compiled Android APK directly from GitHub Releases. Experience tactile haptic feedback, offline persistent notifications, and native-grade Pull-to-Refresh gestures.

---

## 🚀 Quick Start (Developer Setup)

### 1. Zero-Config Database
Run [Supabase_Production_Final.sql](file:///client-app/Supabase_Production_Final.sql) in your Supabase SQL Editor. It sets up all tables, RLS policies, and RAG functions in one go.

### 2. Backend Setup
```bash
cd client-app/server
pip install -r requirements.txt
cp .env.example .env # Add GEMINI_API_KEY & SUPABASE_URL
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd client-app/client
npm install
npm run dev
```

### 4. Build Android APK
You can generate your own Android APK via Capacitor automatically:
```bash
cd client-app/client
npm run build:apk
```
This drops a ready-to-use APK in a `releases/` directory at the project root.

---

## 📸 Premium Interface

<div align="center">

| **Dashboard** | **Tasks** | **Habits** |
|:---:|:---:|:---:|
| <img src="./docs/assets/dashboard.png" width="280"/> | <img src="./docs/assets/tasks.png" width="280"/> | <img src="./docs/assets/habits.png" width="280"/> |

| **Dost AI** | **Calendar** | **Journal** |
|:---:|:---:|:---:|
| <img src="./docs/assets/habbits.png" width="280"/> | <img src="./docs/assets/calendar.png" width="280"/> | <img src="./docs/assets/journal.png" width="280"/> |

</div>

---

## 👤 The Builder

<div align="center">

**Hemasai Vattikuti**
*Full Stack Developer | AI Researcher | Engineering Student*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hemsaivattikuti)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/hemasaivattikuti25)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:hemasaivattikuti25@gmail.com)

</div>

---

<div align="center">
Built with passion for high performance. MIT License. © 2026.
</div>
