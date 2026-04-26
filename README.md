<div align="center">
  <img src="./client-app/client/public/assets/logo.png" alt="Mithra Life OS" width="120" />
  <h1>Mithra Life OS</h1>
  <p><b>Your AI-Powered Life Operating System</b></p>
  <p><i>Tasks · Habits · Journal · Calendar · AI Companion — all in one place.</i></p>

  [![Live App](https://img.shields.io/badge/🚀_Live_App-mithra--lifeos.com-00E5FF?style=for-the-badge)](https://mithra-lifeos.com)
  [![Stars](https://img.shields.io/github/stars/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=00E5FF)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/stargazers)
  [![License](https://img.shields.io/badge/License-MIT-00E5FF?style=for-the-badge)](LICENSE)
</div>

<br />

## 🧠 What is Mithra?

**Mithra** is an AI-native life operating system that replaces 5+ productivity apps with a single, unified platform. It combines task management, habit tracking, smart scheduling, mood journaling, and an AI companion called **Dost** — all working together to help you become the best version of yourself.

> *"I built Mithra because I believe everyone deserves to be productive, organized, and self-aware — without juggling five different apps."*
> — **Hemasai Vattikuti**, Founder

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| **🚀 Mission Control** | Unified dashboard with real-time productivity trends, streak counters, AI usage metrics, and focus sessions |
| **✅ Smart Tasks** | Nested subtasks, priority flagging, drag-and-drop reordering, recurring schedules, and starred tasks |
| **🔥 Habit Focus Hub** | GitHub-style heatmap streaks, multi-session focus timer, streak freeze protection, and daily tracking |
| **🤝 Mithra Blend** | Real-time shared workspaces — link habits with friends and track aggregate scores together |
| **📓 Zen Journal** | AI-analyzed daily entries with mood trajectory mapping and rich text editing |
| **🧠 Dost AI** | Context-aware AI companion that knows your tasks, habits, mood, and schedule — gives personalized advice |
| **📅 Smart Calendar** | Event management with time-blocking and task scheduling |
| **📊 Life Analytics** | Correlate sleep, mood, and productivity with interactive charts |

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Framer Motion, CSS Variables, Capacitor (Android/iOS) |
| **Backend** | Python 3.11, FastAPI, Uvicorn, asyncpg |
| **Database** | Neon PostgreSQL (serverless), pgvector for AI embeddings |
| **Auth** | Firebase Auth (Email/Password + Google OAuth) |
| **AI Engine** | RAG pipeline, context-aware prompts, semantic search, vector embeddings |
| **Deployment** | Vercel (Frontend) · Render (Backend) |
| **CI/CD** | GitHub Actions (lint, test, deploy) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ · **Python** 3.10+
- **Firebase** project (free tier)
- **Neon** PostgreSQL database (free tier)
- AI API Key for Dost AI features

### Backend
```bash
git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
cd Mithra-AI-life-os/client-app/server

python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Fill in your credentials
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd ../client
npm install
cp .env.example .env   # Fill in Firebase config
npm run dev
```

---

## 🔐 Environment Variables

### Server (`/client-app/server/.env`)
| Variable | Description |
| :--- | :--- |
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Admin SDK JSON key |
| `GEMINI_API_KEY` | AI engine API key |
| `ENCRYPTION_KEY` | Fernet key for token encryption |
| `ENVIRONMENT` | `development` or `production` |

### Client (`/client-app/client/.env`)
| Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_API_URL` | Backend URL (`http://localhost:8000` or Render URL) |

---

## 🗂️ Project Structure

```
Mithra-AI-life-os/
├── client-app/
│   ├── client/                  # React Frontend (Vite)
│   │   ├── public/              # Static assets, manifest
│   │   └── src/
│   │       ├── components/      # Reusable UI components
│   │       ├── context/         # Auth & Data providers
│   │       ├── pages/           # Route-level views
│   │       └── services/        # API layer, sync engine
│   └── server/                  # FastAPI Backend
│       ├── core/                # Config, security, rate limiting
│       ├── routers/             # REST API endpoints
│       ├── schemas/             # Pydantic models
│       ├── services/ai/         # AI engine (chat, planner, memory)
│       ├── migrations/          # SQL migration scripts
│       └── main.py              # Application entry point
├── .github/workflows/           # CI/CD pipeline
├── render.yaml                  # Render deployment config
└── README.md
```

---

## 🤝 Contributing

Contributions welcome! Here's how:

1. **Fork** this repository
2. **Create** your feature branch (`git checkout -b feature/awesome-feature`)
3. **Commit** your changes (`git commit -m 'Add awesome feature'`)
4. **Push** to the branch (`git push origin feature/awesome-feature`)
5. **Open** a Pull Request

---

## 👨‍💻 About the Founder

<div align="center">
  <img src="./client-app/client/public/assets/hemasai.jpeg" alt="Hemasai Vattikuti" width="150" style="border-radius: 50%;" />
  <h3>Hemasai Vattikuti</h3>
  <p><i>Founder & Developer</i></p>
</div>

I built Mithra because I believe everyone deserves to be productive, organized, and self-aware. Too many people struggle with scattered tools and no real insight into their own patterns. Mithra is the system I wished I had — an AI-powered life OS that doesn't just store your tasks, but actually understands your habits, analyzes your mood, and helps you become the best version of yourself.

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://hemasai-vattikuti-portfolio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hemasaivattikuti)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hemasaivattikuti25)
[![Resume](https://img.shields.io/badge/Resume-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/file/d/1yU0EMubbWwE8Z2iSmmkMY7_AfY-hAH0U/view)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p><b>⭐ Star this repo if Mithra helps you stay organized!</b></p>
  <p>Built with ❤️ in India 🇮🇳</p>
</div>
