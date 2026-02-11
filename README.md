<p align="center">
  <img src="https://raw.githubusercontent.com/hemasaivattikuti25/Mithra-AI-life-os/main/ClientScheduler/client/public/icon-512.svg" alt="Mithra AI Logo" width="120" height="120">
</p>

<h1 align="center">Mithra AI</h1>

<p align="center">
  <strong>🧠 Your AI-Powered Life Operating System</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/platform-web%20%7C%20android%20%7C%20ios-lightgrey.svg" alt="Platform">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.4.6-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Supabase-Powered-3ECF8E?logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Capacitor-6.0-119EFF?logo=capacitor&logoColor=white" alt="Capacitor">
</p>

---

## 🌟 Overview

**Mithra AI** is a comprehensive life management platform that combines the power of artificial intelligence with elegant design to help you organize every aspect of your life. Built with modern web technologies and optimized for both desktop and mobile experiences.

> *"Your personal AI companion for productivity, wellness, and life optimization."*

---

## ✨ Features

### 📋 Smart Task Management
- **AI-powered task prioritization** with intelligent scheduling
- **Drag-and-drop organization** with smooth animations
- **Smart deadlines** with automatic reminders
- **Priority levels** with color-coded visual indicators
- **Task categories** for organized workflow

### 🔄 Habit Tracking
- **Streak tracking** with motivational insights
- **Flexible scheduling** (daily, weekly, custom)
- **Visual progress** with interactive heatmaps
- **Smart reminders** at optimal times
- **Habit analytics** to understand patterns

### 📅 Unified Calendar
- **Day, Week, and Month views** with smooth transitions
- **Event management** with rich details
- **Task and habit integration** in one view
- **Drag-and-drop scheduling**
- **Mobile-optimized gestures**

### 📓 AI-Powered Journal
- **Voice-to-text transcription** for quick entries
- **AI mood analysis** and insights
- **Rich text formatting** with markdown support
- **Tag organization** for easy searching
- **Private and secure** with end-to-end encryption ready

### 🤖 AI Assistant (Dost Mode)
- **Natural language understanding** for task creation
- **Intelligent suggestions** based on your patterns
- **Conversational interface** that feels human
- **Context-aware recommendations**
- **Powered by advanced NLP**

### 🎨 Beautiful Themes
Choose from **6 stunning color themes**:
- 🌸 **Sakura** — Elegant pink
- 🌅 **Sunset** — Warm orange
- 🌿 **Forest** — Calming green
- 🌊 **Ocean** — Deep blue
- 💜 **Lavender** — Soft purple
- ⚡ **Electric** — Vibrant cyan

Plus **Light/Dark mode** that syncs with your system preferences.

### 📱 Cross-Platform
- **Progressive Web App (PWA)** — Install on any device
- **Android App** — Native performance via Capacitor
- **iOS Ready** — Build and deploy to App Store
- **Offline-first** — Works without internet

### 🔐 Privacy & Security
- **Supabase authentication** with secure sessions
- **Row-level security** — Your data is yours
- **Local-first storage** — Works offline
- **Cloud sync** — Seamless across devices
- **No tracking** — We respect your privacy

---

## 🎬 Demo

<p align="center">
  <img src="https://via.placeholder.com/800x500/1a1a2e/C2185B?text=Dashboard+Preview" alt="Dashboard Preview" width="80%">
</p>

> 🔗 **Live Demo:** [Coming Soon](#)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with concurrent features |
| **Vite 5** | Lightning-fast build tooling |
| **Tailwind CSS 3.4** | Utility-first styling |
| **Framer Motion 11** | Smooth animations |
| **Lucide Icons** | Beautiful icon library |
| **React Big Calendar** | Calendar component |
| **date-fns** | Date manipulation |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Robust relational database |
| **Row Level Security** | Fine-grained access control |
| **Real-time subscriptions** | Live data sync |

### Mobile
| Technology | Purpose |
|------------|---------|
| **Capacitor 6** | Native runtime |
| **Android SDK** | Android deployment |
| **iOS SDK** | iOS deployment |

### AI & NLP
| Technology | Purpose |
|------------|---------|
| **Custom NLP Processor** | Natural language understanding |
| **ChromaDB** | Vector embeddings storage |
| **Sentence Transformers** | Text embeddings |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MITHRA AI ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   React UI   │◄──►│  Context API │◄──►│  Local Store │      │
│  │  (Frontend)  │    │   (State)    │    │ (IndexedDB)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SYNC ENGINE                           │   │
│  │  • Conflict Resolution  • Offline Queue  • Real-time    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      SUPABASE                            │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐            │   │
│  │  │   Auth    │  │  Database │  │  Storage  │            │   │
│  │  │  (Users)  │  │   (RLS)   │  │  (Files)  │            │   │
│  │  └───────────┘  └───────────┘  └───────────┘            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    AI SERVICES                           │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐            │   │
│  │  │    NLP    │  │  Vector   │  │  Schedule │            │   │
│  │  │ Processor │  │   Store   │  │ Optimizer │            │   │
│  │  └───────────┘  └───────────┘  └───────────┘            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git

# Navigate to the project
cd Mithra-AI-life-os/ClientScheduler/client

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

### Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the schema from `server/supabase_schema.sql`
4. Copy your project URL and anon key to `.env`

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

### Android Build

```bash
# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android

# Build APK
./gradlew assembleRelease
```

---

## 📁 Project Structure

```
Mithra-AI-life-os/
├── 📁 ClientScheduler/
│   └── 📁 client/                 # React Frontend
│       ├── 📁 public/             # Static assets
│       │   ├── manifest.json      # PWA manifest
│       │   ├── robots.txt         # SEO
│       │   └── sitemap.xml        # Sitemap
│       ├── 📁 src/
│       │   ├── 📁 components/     # Reusable components
│       │   ├── 📁 context/        # React Context providers
│       │   │   ├── AuthContext.jsx
│       │   │   └── DataContext.jsx
│       │   ├── 📁 pages/          # Page components
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Tasks.jsx
│       │   │   ├── Calendar.jsx
│       │   │   ├── HabitFocusHub.jsx
│       │   │   ├── Journal.jsx
│       │   │   ├── DostMode.jsx
│       │   │   └── Settings.jsx
│       │   ├── 📁 services/       # API services
│       │   │   ├── supabaseClient.js
│       │   │   └── syncEngine.js
│       │   ├── App.jsx            # Main app component
│       │   └── main.jsx           # Entry point
│       ├── 📁 android/            # Capacitor Android
│       ├── package.json
│       ├── tailwind.config.js
│       └── vite.config.js
│
├── 📁 server/                     # Backend services
│   ├── api.py                     # FastAPI server
│   ├── nlp_processor.py           # NLP engine
│   ├── schedule_optimizer.py      # AI scheduler
│   ├── vector_store.py            # ChromaDB integration
│   └── supabase_schema.sql        # Database schema
│
├── 📄 README.md                   # You are here!
├── 📄 CONTRIBUTING.md             # Contribution guide
├── 📄 CHANGELOG.md                # Version history
├── 📄 LICENSE                     # MIT License
└── 📄 SECURITY.md                 # Security policy
```

---

## 🗄️ Database Schema

```sql
-- Core tables with Row Level Security

┌─────────────────┐     ┌─────────────────┐
│     users       │     │    profiles     │
├─────────────────┤     ├─────────────────┤
│ id (uuid)       │────►│ id (uuid)       │
│ email           │     │ full_name       │
│ created_at      │     │ avatar_url      │
└─────────────────┘     │ preferences     │
                        └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│     tasks       │     │     habits      │
├─────────────────┤     ├─────────────────┤
│ id (uuid)       │     │ id (uuid)       │
│ user_id         │     │ user_id         │
│ title           │     │ name            │
│ priority        │     │ frequency       │
│ due_date        │     │ streak          │
│ completed       │     │ completions     │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│    journals     │     │     events      │
├─────────────────┤     ├─────────────────┤
│ id (uuid)       │     │ id (uuid)       │
│ user_id         │     │ user_id         │
│ content         │     │ title           │
│ mood            │     │ start_time      │
│ tags            │     │ end_time        │
│ ai_insights     │     │ recurrence      │
└─────────────────┘     └─────────────────┘
```

---

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Code Style

- Use **ESLint** for JavaScript/React
- Follow **Prettier** formatting
- Write **meaningful commit messages**
- Add **tests** for new features

---

## 📈 Roadmap

### Version 1.1 (Q1 2026)
- [ ] AI-powered task suggestions
- [ ] Widget support for Android
- [ ] Apple Watch companion app
- [ ] Team collaboration features

### Version 1.2 (Q2 2026)
- [ ] Calendar integrations (Google, Outlook)
- [ ] Zapier/IFTTT automation
- [ ] Custom AI model training
- [ ] Voice commands

### Version 2.0 (Q4 2026)
- [ ] Desktop apps (Windows, macOS, Linux)
- [ ] Multi-language support
- [ ] Enterprise features
- [ ] API for third-party integrations

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<p align="center">
  <img src="https://avatars.githubusercontent.com/hemasaivattikuti25" alt="Hemasai Vattikuti" width="100" style="border-radius: 50%;">
</p>

<h3 align="center">Hemasai Vattikuti</h3>

<p align="center">
  <strong>Founder & Lead Developer</strong>
</p>

<p align="center">
  <a href="https://github.com/hemasaivattikuti25">
    <img src="https://img.shields.io/badge/GitHub-hemasaivattikuti25-181717?logo=github" alt="GitHub">
  </a>
  <a href="https://linkedin.com/in/hemasaivattikuti">
    <img src="https://img.shields.io/badge/LinkedIn-Hemasai%20Vattikuti-0A66C2?logo=linkedin" alt="LinkedIn">
  </a>
  <a href="mailto:hemasaivattikuti@gmail.com">
    <img src="https://img.shields.io/badge/Email-hemasaivattikuti%40gmail.com-EA4335?logo=gmail" alt="Email">
  </a>
</p>

---

## 🙏 Acknowledgments

- **React Team** — For the incredible UI library
- **Supabase Team** — For the amazing BaaS platform
- **Tailwind Labs** — For the utility-first CSS framework
- **Vercel** — For seamless deployments
- **Open Source Community** — For inspiration and tools

---

## ⭐ Support

If you find Mithra AI helpful, please consider:

- ⭐ **Starring** the repository
- 🐛 **Reporting bugs** via Issues
- 💡 **Suggesting features** via Discussions
- 🤝 **Contributing** to the codebase

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/hemasaivattikuti25">Hemasai Vattikuti</a></strong>
</p>

<p align="center">
  <sub>© 2026 Mithra AI. All rights reserved.</sub>
</p>
