<p align="center">
  <img src="https://raw.githubusercontent.com/hemasaivattikuti25/Mithra-AI-life-os/main/ClientScheduler/client/public/icon-512.svg" alt="Mithra AI" width="120" height="120">
</p>

<h1 align="center">Mithra AI</h1>

<p align="center">
  <strong>AI-Powered Life Operating System</strong>
</p>

<p align="center">
  Mithra is a comprehensive productivity platform designed to revolutionize how you manage your life. Built with React, this app provides a seamless, user-friendly platform to manage tasks, track habits, schedule events, journal your thoughts, and interact with an AI assistant.
</p>

<p align="center">
  <a href="https://mithra-life-os.vercel.app">🌐 Live Demo</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase">
</p>

---

## 📦 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [License](#-license)
- [Contact](#-contact)

---

## 🚀 Features

### 🎯 Task Management
- Priority-based task organization
- Subtasks and due dates
- Category filtering (Work, Personal, etc.)
- Completion analytics and progress tracking

### 📅 Smart Calendar
- Day, Week, and Month views
- Drag-and-drop event management
- Color-coded categories
- Event reminders and notifications

### 🔥 Habit Tracking
- GitHub-style consistency heatmap
- Streak counters and statistics
- Focus timer with Pomodoro technique
- Custom session durations

### 📓 Journal
- Mood tracking with emoji indicators
- Rich text entries with tags
- AI-powered mood analysis
- Writing streak tracking

### 🤖 Dost Mode (AI Assistant)
- Natural language task creation
- Smart daily summaries
- Mood history insights
- Conversational interface

### 🎨 User Experience
- 6 beautiful color themes (Sakura, Sunset, Forest, Ocean, Lavender, Electric)
- Dark and Light mode
- Responsive design for all devices
- Offline-first with sync when online
- PWA + Native Android support

---

## 💻 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for backend)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
   cd Mithra-AI-life-os/ClientScheduler/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

---

## 🏗️ Project Structure

```
Mithra-AI-life-os/
│
├── ClientScheduler/
│   └── client/
│       ├── public/
│       │   ├── icon-192.svg
│       │   ├── icon-512.svg
│       │   └── manifest.json
│       │
│       ├── src/
│       │   ├── components/
│       │   │   ├── Layout.jsx
│       │   │   └── ClockPicker.jsx
│       │   │
│       │   ├── context/
│       │   │   ├── AuthContext.jsx
│       │   │   └── DataContext.jsx
│       │   │
│       │   ├── pages/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Tasks.jsx
│       │   │   ├── Calendar.jsx
│       │   │   ├── HabitFocusHub.jsx
│       │   │   ├── Journal.jsx
│       │   │   ├── DostMode.jsx
│       │   │   ├── Settings.jsx
│       │   │   └── AuthPage.jsx
│       │   │
│       │   ├── services/
│       │   │   └── supabaseClient.js
│       │   │
│       │   ├── App.jsx
│       │   └── main.jsx
│       │
│       └── android/          # Native Android app (Capacitor)
│
└── README.md
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18.3 |
| **Build Tool** | Vite 5.4 |
| **Styling** | Tailwind CSS 3.4 |
| **Animations** | Framer Motion 11 |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Mobile** | Capacitor 6 |
| **Deployment** | Vercel |

---

## 🔌 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      REACT FRONTEND                      │
│         Components · Context API · Local State           │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                      SYNC ENGINE                         │
│    Offline Queue · Conflict Resolution · Real-time      │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                       SUPABASE                           │
│      PostgreSQL · Row Level Security · Auth · API        │
└──────────────────────────────────────────────────────────┘
```

---

## 💖 Support the Project

If you find this project helpful, consider starring the GitHub repository — it really helps! ⭐

---

## 📄 License

Distributed under MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Hemasai Vattikuti** - [GitHub](https://github.com/hemasaivattikuti25)

---

<p align="center">
  Give a ⭐ to support the project!
</p>
