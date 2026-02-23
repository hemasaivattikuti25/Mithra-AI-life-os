<div align="center">
  <img src="./docs/assets/logo.png" alt="Mithra Life OS Logo" width="150" />
  <h1>Mithra Life OS</h1>
  <p><b>The Ultimate AI-Powered Life Operating System</b></p>
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-00E5FF?style=for-the-badge&logo=vercel&logoColor=black)](https://mithra-lifeos.com)
  [![GitHub stars](https://img.shields.io/github/stars/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=00E5FF)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/stargazers)
  [![GitHub issues](https://img.shields.io/github/issues/hemasaivattikuti25/Mithra-AI-life-os?style=for-the-badge&color=00E5FF)](https://github.com/hemasaivattikuti25/Mithra-AI-life-os/issues)
  [![License](https://img.shields.io/badge/License-MIT-00E5FF?style=for-the-badge)](LICENSE)
</div>

<br />

## 📖 About Mithra Life OS

Mithra Life OS is a premium, beautifully crafted web application designed to be your comprehensive digital brain. Engineered for professionals, students, and high-achievers, it unifies your daily habits, task management, dynamic calendar scheduling, and AI-driven journaling into a single, cohesive ecosystem.

By blending the aesthetics of modern hyper-minimalism with robust zero-trust database security, Mithra Life OS offers a lag-free, Apple-like user experience that actively adapts to your productivity trends.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **🚀 Mission Control** | A unified dashboard displaying real-time productivity trends, AI usage metrics, and active focus sessions. |
| **✅ Smart Tasks** | Nested subtasks, intelligent drag-and-drop reordering, priority flagging, and Google Calendar syncing. |
| **🔥 Habit Focus Hub** | Visual heatmap streaks, multi-session focus timers, Roman-numeral chronometers, and 3D synergy UI tracking. |
| **🤝 Mithra Blend** | Real-time shared workspaces. Link your habits with friends to track aggregate completion scores via a unified slider. |
| **📓 Zen Journal** | A markdown-enabled reflection engine that uses Google Gemini AI to analyze your daily entries and map your mood trajectory. |
| **🧠 Dost AI** | A conversational companion fully aware of your life context, capable of predicting your workflow and reviewing your habits. |

---

## 🛠️ Tech Stack

Mithra is forged using an elite full-stack architecture built for speed and immense scalability.

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Framer Motion, TailwindCSS, Zustand |
| **Backend** | Python, FastAPI, Uvicorn, SQLAlchemy |
| **Database & Auth** | Supabase (PostgreSQL), Supabase Auth (PKCE flow), pgvector |
| **AI Integration** | Google Gemini 1.5 Pro |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📸 See It In Action

<div align="center">
  <img src="./docs/assets/dashboard.png" alt="Dashboard View" width="48%" />
  <img src="./docs/assets/dost-ai.png" alt="Dost AI Mode" width="48%" />
  <br/><br/>
  <img src="./docs/assets/habits.png" alt="Habit Tracking" width="48%" />
  <img src="./docs/assets/journal.png" alt="Zen Journal" width="48%" />
</div>

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
* **Node.js**: v18 or higher (`npm install -g npm@latest`)
* **Python**: v3.10 or higher
* **Supabase**: A free Supabase project
* **Google Cloud**: A free Gemini API Key

### Backend Setup (FastAPI / Python)
```bash
# 1. Clone the repository
git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
cd Mithra-AI-life-os/client-app/server

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables (copy .env.example)
cp .env.example .env

# 5. Start the backend server
uvicorn main:app --reload --port 8000
```

### Frontend Setup (React / Vite)
```bash
# 1. Navigate to the client directory
cd ../client

# 2. Install dependencies
npm install

# 3. Configure environment variables (copy .env.example)
cp .env.example .env

# 4. Launch the application
npm run dev
```

---

## 🔐 Environment Variables

The application relies on secure configuration keys. You must populate these variables within your `.env` files.

### Server `.env` (`/client-app/server/.env`)
| Variable | Description | Where to get it |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Your Project URL | Supabase Dashboard > Project Settings > API |
| `SUPABASE_KEY` | Your Service Role Secret Key | Supabase Dashboard > Project Settings > API |
| `SUPABASE_JWT_SECRET` | Your Authentication JWT string | Supabase Dashboard > Project Settings > API |
| `GEMINI_API_KEY` | Google Gemini API Access key | Google AI Studio |

### Client `.env` (`/client-app/client/.env`)
| Variable | Description | Where to get it |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Project URL | Supabase Dashboard > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Your Public Anon Key | Supabase Dashboard > Project Settings > API |
| `VITE_API_URL` | URL traversing to your backend | `http://localhost:8000` (Local) / Render URL |
| `VITE_APP_URL` | Authorized Web URL | `http://localhost:5173` (Local) / Vercel URL |

---

## 🗂️ Project Structure

```text
Mithra-AI-life-os/
├── client-app/
│   ├── client/                  # React Frontend
│   │   ├── public/              # Static assets and Web App Manifest
│   │   ├── src/                 # Source code
│   │   │   ├── components/      # Reusable UI widgets
│   │   │   ├── context/         # Auth & Data State bounds
│   │   │   ├── pages/           # Core view layouts
│   │   │   └── services/        # Supabase API connectors
│   │   ├── tailwind.config.js   # Style parameters
│   │   └── package.json         # JS Dependencies
│   └── server/                  # FastAPI Backend
│       ├── core/                # Configuration and Security layers
│       ├── routers/             # API Endpoints (Chat, Tasks, Workspaces)
│       ├── services/            # Deep execution logic (AI prompt mapping)
│       └── main.py              # Application entrypoint
├── docs/                        # Promotional and static asset artifacts
├── master_supabase.sql          # Unified Database schema setup
└── README.md                    # Core documentation
```

---

## 🗺️ Roadmap

- [x] Integrate zero-trust Row Level Security in Postgres
- [x] Launch "Mithra Blend" live multi-tenant habit tracking
- [x] Embed AI-powered context retrieval for Journal Entries
- [ ] Develop native iOS and Android capacitor wrappers
- [ ] Add offline-first automatic syncing for poor connections
- [ ] Connect Spotify API for direct focus-mode ambient loops

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

**Hemasai Vattikuti**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hemasai-vattikuti-61266b268/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hemasaivattikuti25)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sivasaiohm2005@gmail.com)

**Project Link:** [https://mithra-lifeos.com](https://mithra-lifeos.com)
