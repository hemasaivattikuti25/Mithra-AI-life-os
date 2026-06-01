<div align="center">
  <img src="./client-app/client/public/assets/logo.png" alt="Mithra Life OS" width="140" style="border-radius: 20%; box-shadow: 0 0 30px rgba(0, 229, 255, 0.4);" />
  <h1>Mithra Life OS v2</h1>
  <p><b>A Production-Grade, AI-Native Personal Operating System</b></p>

  [![Active Users](https://img.shields.io/badge/Active_Users-900%2B-00E5FF?style=for-the-badge&logo=users)](#)
  [![Live Platform](https://img.shields.io/badge/Live_Platform-mithra--lifeos.com-000000?style=for-the-badge&logo=vercel)](https://mithra-lifeos.com)
  [![Backend](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
  [![Database](https://img.shields.io/badge/Neon_Serverless-pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#)
  [![License](https://img.shields.io/badge/License-MIT-00E5FF?style=for-the-badge)](LICENSE)

  <p><i>A context-aware ecosystem featuring a custom Retrieval-Augmented Generation (RAG) pipeline, deterministic AI agents, semantic vector memory, and real-time habit tracking.</i></p>
</div>

<br />

---

## 🚀 1. Executive Summary

Mithra Life OS is a comprehensive, AI-first productivity ecosystem engineered to replace disjointed task managers, habit trackers, and journaling applications. Moving beyond simple CRUD applications, Mithra is designed around **Dost AI** — an embedded, context-aware companion agent that possesses true semantic memory of the user's life. 

Currently serving a rapidly growing user base of **900+ active signups**, the platform serves as a technical showcase of integrating advanced Applied AI mechanics (RAG, agentic schemas, dynamic prompt injection) within a highly scalable, asynchronous Python backend, optimized for high availability with warmup cycles.

This repository contains the complete source code for both the React-based client and the FastAPI backend service.

---

## 🧠 2. Applied AI Architecture (Dost AI)

The defining feature of Mithra is its integration of Large Language Models (LLMs) not as passive chatbots, but as active, context-aware agents capable of both reasoning and execution. To achieve this, the architecture relies on several advanced AI engineering paradigms.

### 2.1 Custom RAG Pipeline & Semantic Memory
Standard LLMs suffer from amnesia. To give Dost AI a persistent memory of the user's life, Mithra implements a highly optimized **Retrieval-Augmented Generation (RAG)** pipeline natively within PostgreSQL.

1. **Embedding Generation:** When a user logs a journal entry, the text is immediately processed through a dense embedding model, converting the semantic meaning into a high-dimensional vector array.
2. **Native Vector Storage:** Rather than introducing a complex secondary database (e.g., Pinecone or Weaviate), Mithra utilizes the `pgvector` extension in a Neon Serverless PostgreSQL instance. Vectors are stored natively alongside the relational user data, ensuring strict ACID compliance and zero data drift.
3. **Cosine Similarity Search:** During a chat interaction, the user's prompt is vectorized in real-time. The `memory_engine.py` executes an asynchronous SQL query utilizing the `<=>` operator to calculate Cosine Distance, instantly retrieving the most semantically relevant past journal entries.

### 2.2 Dynamic Context Injection
An AI is only as intelligent as the context provided to it. Before a request is ever sent to the LLM, the FastAPI backend intercepts it and dynamically constructs a highly specific System Prompt. 

The `chat_engine.py` queries the database to inject:
* **The User's Pending Tasks:** Ordered by priority and due date.
* **Daily Habit Streaks:** Including exactly which habits were completed today and which are pending.
* **Mood Metrics:** The user's historical and daily mood scores.
* **Semantic Memories:** The Top-K retrieved journal entries from the RAG pipeline.

*Result:* When the user asks, *"Why am I so stressed today?"*, Dost AI doesn't give generic advice. It responds: *"Based on your journal, you missed your morning workout for three days straight, and you have two high-priority tasks due tomorrow. Let's reschedule one to give you breathing room."*

### 2.3 Deterministic Agentic Actions
Dost AI is designed to *act*, not just converse. To bridge the gap between natural language and structured database mutations, the AI is prompted to utilize a strict JSON schema.

When the LLM detects actionable intent (e.g., *"Remind me to call Mom tomorrow"*), it outputs a deterministic JSON block alongside its conversational response:
```json
||JSON||{"action": "create_task", "data": {"title": "Call Mom", "due_date": "2026-04-28", "priority": "high"}}
```
The backend parser extracts this payload, validates it via Pydantic schemas, and autonomously executes the database transaction. This effectively turns the LLM into a functional agent capable of navigating and modifying the application state.

### 2.4 Hybrid NLP & Cost Optimization
To optimize API usage and reduce chat latency, Mithra incorporates a hybrid processing paradigm:
* **Pre-LLM NLP Regex Parser:** Lightweight tasks, mood logs, and habit check-ins are intercepted via a local, regex-driven NLP matcher (`extract_casual_actions`), resolving routine user updates instantly without triggering API overhead.
* **Token Budget Enforcement:** Strict context restrictions (`MAX_HISTORY_MESSAGES = 6`, `MAX_MESSAGE_LENGTH = 200`, `MAX_MEMORY_TOKENS = 200`) guarantee system prompts remain under an 800-token threshold, ensuring fast response times and highly optimized API utilization.

---

## ⚙️ 3. Backend Engineering

The backend is engineered for high throughput, low latency, and strict security, serving as the robust foundation required to support 900+ concurrent users.

### 3.1 Asynchronous FastAPI & asyncpg
Built on Python 3.11 and **FastAPI**, the entire backend is fully asynchronous. By utilizing `asyncpg`, the server never blocks the main event loop while waiting for database queries or API responses from the AI gateway. This architectural decision allows a single Uvicorn worker to handle thousands of concurrent connections efficiently.

### 3.2 Domain-Driven Design
The codebase eschews monolithic patterns in favor of modular, Domain-Driven Design (DDD). The routing layer (`routers/`) is strictly separated from the business logic and database interactions (`services/`). 
* `tasks_router.py`: Manages temporal scheduling and priority queues.
* `chat_router.py`: Handles websocket-like rapid polling for AI interactions.
* `ai_gateway.py`: Abstracts the LLM provider, ensuring the system is model-agnostic and immune to vendor lock-in.

### 3.3 Strict Cryptographic Multi-Tenant Isolation
Because Mithra stores highly sensitive personal data (journals, habits, tasks), security is paramount. The platform employs a Zero-Trust architecture:
1. The client authenticates via **Firebase Auth** and receives a short-lived JSON Web Token (JWT).
2. The FastAPI backend utilizes the Firebase Admin SDK within a dedicated `Depends` middleware to cryptographically verify every single incoming request.
3. All operations scope queries using the cryptographically verified `user_id` context (`WHERE user_id = $1`), ensuring mathematically scoped tenant isolation and eliminating cross-account data leakage at the query layer.

---

## 🎨 4. Frontend Architecture

The user interface is designed to feel like a premium, native application while running entirely in the browser. 

### 4.1 React 18 & Vite
The frontend is a Single Page Application (SPA) built with React 18 and bundled with Vite for instantaneous Hot Module Replacement (HMR) and optimized production builds. 

### 4.2 Custom Bidirectional Offline Sync Engine
Rather than relying on basic CRUD contexts, Mithra features a bespoke **Bidirectional State Sync Engine** (`syncEngine.js`) built from scratch:
* **Conflict Resolution:** Utilizes a client-side Last-Write-Wins (LWW) merge algorithm comparing local and remote timestamps (`updatedAt`/`createdAt`).
* **Resiliency & Recovery:** Built-in connection-recovery listeners run periodic health pings (`/api/ping`) and execute queued offline transactions using exponential backoff retry cycles with randomized jitter.
* **LocalStorage Quota Protection:** A dynamic garbage collector monitors LocalStorage footprint and automatically prunes legacy log history under high cache pressure, maintaining stability.
* **Optimistic UI:** Local updates persist immediately to the browser database for a zero-latency interface, syncing to the API backend asynchronously in the background.

### 4.3 Bespoke Design System & Data Visualization
Mithra avoids generic component libraries (like Bootstrap or MUI) in favor of a completely bespoke, utility-first CSS architecture.
* **Glassmorphism:** Deep, semi-transparent panels with backdrop filters create a modern, deep aesthetic.
* **Framer Motion:** Every interaction, from routing to modal popups, is physically modeled using Framer Motion springs for buttery-smooth 60fps animations.
* **Heatmaps:** The dashboard features custom SVG-based habit heatmaps (similar to GitHub contributions) allowing users to visualize consistency over a 365-day macro scale.

### 4.4 Rendering Performance & Mobile Optimization
To guarantee a responsive, 60fps user experience across all devices—including low-end mobile hardware—Mithra implements several advanced front-end rendering techniques:

1. **Persistent Nested Routing Layout:** Rather than duplicating the `<Layout>` component inside individual routes (which forces React to completely unmount and remount the global layout, sidebar, and background glows on every navigation), Mithra wraps its protected routes under a parent layout route. React Router’s `<Outlet />` renders only the child views, keeping the main layout continuously mounted. This instantly cuts navigation lag and enables Framer Motion’s spring-driven layout transitions to animate cleanly between tab changes.
2. **GPU Compositor Layer Promotion:** The application utilizes deep, semi-transparent background ambient glows. To avoid expensive rasterization passes when scrolling or transitioning pages, these elements are promoted to their own compositor layers on the GPU using `transform: translate3d(0,0,0)` and `will-change: transform`.
3. **Optimized CSS Filter Overload:** Large radial gradient divs with high blur values can bottleneck browser repaints. Mithra optimizes these elements by reducing blur filters by 50% (from `150px` to `60px`-`80px`) and replacing continuous opacity keyframe animations (like `animate-pulse` on massive blurred regions) with lightweight, hardware-accelerated transforms.
4. **Fluid Mobile Viewport Constraints:** The landing page features a 3D browser mockup and floating badges. On mobile devices, the mockup container height is explicitly controlled (`h-[550px]`) to prevent layout collapse, and horizontal badge offsets are dynamically adapted (`left-2 sm:left-4 md:-left-12`) to keep elements centered and visible without edge clipping. Continuous auto-floating animations (`y: [0, -10, 0]`) are implemented to keep the section dynamic on touch devices.

---

## 📊 5. Database Schema & Data Models

The Neon Serverless PostgreSQL database utilizes a highly normalized schema optimized for fast reads.

* **Users Table:** Stores preferences, timezone data, and encrypted sync tokens.
* **Tasks Table:** Supports recursive relationships for subtasks, ISO-8601 due dates, and priority indexing.
* **Habits & Habit_Logs Tables:** A dual-table setup where `habits` defines the metadata (frequency, color) and `habit_logs` records immutable daily completion states.
* **Journal_Entries Table:** The core of the RAG pipeline. Stores raw markdown content, integer mood scores, and `vector(768)` columns for semantic embeddings.

---

## 🛠️ 6. Local Development & Deployment

### 6.1 Prerequisites
* **Node.js** (v18+)
* **Python** (3.11+)
* **PostgreSQL** (with `pgvector` extension enabled, or a Neon.tech account)
* **Firebase** (Free Tier Web Project)

### 6.2 Backend Setup
The backend utilizes standard Python virtual environments.

```bash
# Clone the repository
git clone https://github.com/hemasaivattikuti25/Mithra-AI-life-os.git
cd Mithra-AI-life-os/client-app/server

# Initialize virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Open .env and insert your NEON_DATABASE_URL and Firebase Admin SDK credentials

# Start the FastAPI Server
uvicorn main:app --reload --port 8000
```
*The API documentation will be automatically generated and available at `http://localhost:8000/docs`.*

### 6.3 Frontend Setup
```bash
# Navigate to the client directory
cd ../client

# Install Node dependencies
npm install

# Configure Environment
cp .env.example .env
# Open .env and insert your Firebase Web API keys

# Start the Vite Development Server
npm run dev
```

---

## 📈 7. Scaling & Future Roadmap

Handling the transition from a local MVP to a live platform with **900+ users** required significant architectural refactoring. Moving forward, the roadmap includes:

1. **Redis Caching:** Implementing Redis to cache non-volatile data (like historical habit heatmaps) to reduce Postgres load.
2. **WebSockets:** Upgrading the polling-based AI chat engine to true bidirectional WebSockets for streaming LLM tokens in real-time.
3. **PWA Offline Mode:** Enhancing the existing Service Worker to utilize IndexedDB, allowing users to queue tasks while offline and sync them upon reconnection.

---

## 👨‍💻 8. About the Founder

<div align="center">
  <img src="./client-app/client/public/assets/hemasai.jpeg" alt="Hemasai Vattikuti" width="180" style="border-radius: 50%; box-shadow: 0 8px 24px rgba(0,0,0,0.6);" />
  <h3>Hemasai Vattikuti</h3>
  <p><i>Applied AI Engineer & backend Developer</i></p>
</div>

I built Mithra because I believe the future of software isn't just about storing data; it's about software that understands you. Too many people struggle with scattered tools—a task list here, a habit tracker there, a journal somewhere else. I engineered Mithra to be the single source of truth for your personal life, powered by an AI that actually possesses the context to help you.

Building this platform solo—from the initial Figma designs, to the async Python backend, to fine-tuning the RAG pipeline, and scaling it to 1300+ active users—has been a masterclass in modern software engineering. 

I am actively open to roles in **Applied AI Engineering** and **Backend Development**.

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white&padding=10)](https://hemasai-vattikuti-portfolio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hemasaivattikuti)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hemasaivattikuti25)

---

## 📄 9. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <br/>
  <p><b>⭐ If you appreciate the architecture or find the code helpful, please star the repository!</b></p>
  <p>Built with ❤️ by Hemasai</p>
</div>
