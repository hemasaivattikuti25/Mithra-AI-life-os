<div align="center">
  <img src="./client-app/client/public/assets/logo.png" alt="Mithra Life OS" width="120" style="border-radius: 20%; box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);" />
  <h1>Mithra Life OS v2</h1>
  <p><b>An AI-Native Productivity Platform</b></p>

  [![Active Users](https://img.shields.io/badge/Active_Users-900%2B-00E5FF?style=for-the-badge&logo=users)](#)
  [![Live App](https://img.shields.io/badge/Live_Platform-mithra--lifeos.com-000000?style=for-the-badge&logo=vercel)](https://mithra-lifeos.com)
  [![Backend](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
  [![Database](https://img.shields.io/badge/pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#)

  <p><i>A production-grade, context-aware Life OS featuring a custom Retrieval-Augmented Generation (RAG) pipeline, deterministic AI agents, and real-time habit tracking.</i></p>
</div>

<br />

## 🚀 Overview

Mithra Life OS is a comprehensive productivity ecosystem built to replace disjointed task managers, habit trackers, and journaling apps. More than just a unified dashboard, Mithra leverages an asynchronous Python backend and `pgvector` to provide users with **Dost AI** — an intelligent companion that possesses semantic memory of the user's life and can execute agentic database actions.

Currently serving **900+ active signups** with a 99.9% uptime.

---

## 🧠 Applied AI Architecture (Dost AI)

Dost AI is not a standard LLM wrapper. It is a highly optimized context-aware agent.

* **RAG Pipeline (`pgvector`)**: Journal entries are processed through an embedding model and stored natively in PostgreSQL. When users query the AI, a semantic Cosine Distance search (`<=>`) retrieves the most relevant memories.
* **Dynamic Context Injection**: The async FastAPI backend injects real-time state data (pending tasks, habit heatmaps, daily mood) directly into the system prompt, giving Dost true situational awareness.
* **Agentic Capabilities**: The AI is strictly instructed to output deterministic JSON schemas alongside natural language. This allows Dost to autonomously execute backend mutations (e.g., creating tasks, logging moods) without manual user input.

---

## ⚡ Technical Stack

Mithra is engineered for scale, speed, and clean code architecture.

### **Backend (FastAPI)**
* **Asynchronous Routing**: Non-blocking endpoints using `asyncpg` for high-throughput database interactions.
* **Zero-Trust Security**: Firebase Admin SDK validates JWTs on every API request, ensuring strict data isolation per user.
* **Modular Design**: Domain-driven routing (`tasks_router`, `chat_router`, etc.) to decouple business logic.

### **Frontend (React + Vite)**
* **State Management**: Centralized React Context providers for Auth, Habits, and Tasks.
* **Premium UX**: Smooth transitions using `framer-motion` and a bespoke glassmorphic design system.
* **Data Visualization**: Custom GitHub-style habit heatmaps and productivity charts.

---

## 🛠️ Local Development

### 1. Backend Setup
```bash
git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
cd Mithra-AI-life-os/client-app/server

# Create virtual environment
python -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (.env)
# NEON_DATABASE_URL=...
# FIREBASE_SERVICE_ACCOUNT_JSON=...
# GEMINI_API_KEY=...

# Run the server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd ../client

# Install Node modules
npm install

# Set up environment variables (.env)
# VITE_FIREBASE_API_KEY=...
# VITE_API_URL=http://localhost:8000

# Start Vite dev server
npm run dev
```

---

## 👨‍💻 About the Founder

<div align="center">
  <img src="./client-app/client/public/assets/hemasai.jpeg" alt="Hemasai Vattikuti" width="150" style="border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.5);" />
  <h3>Hemasai Vattikuti</h3>
  <p><i>Applied AI Engineer & Founder</i></p>
</div>

I built Mithra because I believe everyone deserves to be productive, organized, and self-aware. Too many people struggle with scattered tools and no real insight into their own patterns. Mithra is the system I wished I had — an AI-powered life OS that doesn't just store your tasks, but actually understands your habits, analyzes your mood, and helps you become the best version of yourself.

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://hemasai-vattikuti-portfolio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hemasaivattikuti)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hemasaivattikuti25)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

<div align="center">
  <p><b>⭐ Star this repo if you find the architecture interesting!</b></p>
  <p>Built with ❤️ by Hemasai</p>
</div>
