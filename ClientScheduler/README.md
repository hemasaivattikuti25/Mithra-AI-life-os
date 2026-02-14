
<div align="center">
  <img src="https://raw.githubusercontent.com/hemasaivattikuti25/Mithra-AI-life-os/main/client/public/assets/logo.png" alt="Mithra Logo" width="120" />
  <h1>Mithra — AI Life OS</h1>
  <p>
    <strong>The stoic productivity system for high performers.</strong><br>
    Tasks · Habits · Focus · Journaling · AI Companion
  </p>

  <p>
    <a href="https://mithra-life-os.vercel.app">
      <img src="https://img.shields.io/badge/Live_Demo-Visit_App-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
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
Mithra is an offline-first, AI-powered productivity OS designed to replace scattered tools. It unifies task management, habit tracking, focus timers, and journaling into a single, cohesive interface. Built with a "Midnight & Cyan" aesthetic, it prioritizes speed, privacy, and deep work.

### **Key Features**

#### 🧠 **Dost AI Companion**
- **Context-Aware**: Understands your tasks, habits, and mood.
- **Natural Language**: "Add a meeting tomorrow at 2 PM" or "Summarize my day."
- **RAG Memory**: Recalls past journal entries for personalized advice.
- **Voice Mode**: Speak to capture ideas instantly using the Web Speech API.

#### ⚡ **Tasks & Scheduling**
- **Smart Calendar**: Bi-directional sync with Google Calendar (optional).
- **Collision Detection**: Automatically adjusts layout for overlapping events.
- **Recurring Tasks**: Flexible repetition rules (daily, weekly, monthly).
- **Priority Matrix**: Visual indicators for High/Medium/Low priority items.

#### 🔥 **Habits & Streaks**
- **Consistency Heatmap**: GitHub-style activity graph for every habit.
- **Streak Protection**: Smart logic prevents accidental resets.
- **Milestone Rewards**: Celebratory notifications for hitting streak goals.

#### 🧘 **Focus & Wellness**
- **Zen Mode**: Pomodoro timer with customizable Work/Break intervals.
- **Mood Tracking**: Daily emotional check-ins with a 1-10 scale.
- **Journaling**: Rich text editor with mood correlation and tagging.

---

### **Tech Stack**

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion |
| **State** | Context API + LocalStorage (Offline First) |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **AI Engine** | Google Gemini 1.5 Flash (via API) |
| **Sync** | Custom bi-directional sync engine (Optimistic UI) |
| **Build** | esbuild (Production optimized) |

---

### **Getting Started**

#### **Prerequisites**
- Node.js 18+
- Supabase Account
- Google Gemini API Key

#### **Installation**
```bash
# 1. Clone the repository
git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
cd Mithra-AI-life-os/client

# 2. Install dependencies
npm install

# 3. Configure Environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_API_URL

# 4. Run Locally
npm run dev
```

### **Deployment**
The project is optimized for deployment on **Vercel**.
1. Push to GitHub.
2. Import project in Vercel.
3. Add environment variables.
4. Deploy.

---

### **Contributing**
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

<div align="center">
  <sub>Built with precision by Hema Sai Vartikotti using minimal dependencies.</sub>
</div>
