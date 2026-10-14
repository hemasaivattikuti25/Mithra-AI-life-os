# 🚀 Mithra Life OS — Deployment & Operations Guide

This runbook guides you through deploying Mithra Life OS across production environments (Vercel for Frontend, Render for Backend, and Supabase for Database).

---

## 1. Database Setup (Supabase PostgreSQL)

1. **Create Supabase Project:**
   * Go to [supabase.com](https://supabase.com) and create a project in your preferred region.
2. **Execute Master Schema:**
   * Open the **SQL Editor** in your Supabase dashboard.
   * Paste and run the entire script in [`client-app/server/supabase_schema.sql`](../client-app/server/supabase_schema.sql).
   * This creates all tables (`profiles`, `plans`, `tasks`, `habits`, `journal_entries`, `calendar_events`), enables `pgvector`, and applies Row-Level Security.
3. **Obtain Connection String:**
   * Under **Project Settings -> Database -> Connection string**, copy the URI (URI mode).
   * If connecting through the Transaction Pooler (port 6543), the backend automatically adjusts prepared statement cache settings.

---

## 2. Backend Deployment (Render)

The backend is configured for deployment using the blueprint file [`render.yaml`](../render.yaml).

### Required Environment Variables
| Variable | Value / Description |
|---|---|
| `ENVIRONMENT` | `production` |
| `ALLOWED_ORIGINS` | Comma-delimited list of your client domains (e.g. `https://mithra-lifeos.com,https://your-app.vercel.app`) |
| `DATABASE_URL` | Your Supabase connection string (`postgresql://postgres:...@...pooler.supabase.com:6543/postgres?sslmode=require`) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full minified JSON string of your Firebase Service Account private key |
| `NVIDIA_API_KEY` | Your NVIDIA NIM API key (`nvapi-...`) |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | `nvidia/nemotron-3.5-lightning-30b-a3b` |

### Manual Deployment via Docker (Alternative)
```bash
cd client-app/server
docker build -t mithra-backend .
docker run -p 8000:8000 --env-file .env mithra-backend
```

---

## 3. Frontend Deployment (Vercel)

The frontend is a static Single Page Application (SPA).

1. **Import Repository in Vercel:**
   * Root Directory: `client-app/client`
   * Framework Preset: `Vite`
   * Build Command: `npm run build`
   * Output Directory: `dist`
2. **Environment Variables on Vercel:**
   * `VITE_API_URL`: Your live backend URL (e.g. `https://mithra-backend.onrender.com`).
   * `VITE_REQUIRE_AUTH`: `true` (enforces strict Firebase auth in production).
   * `VITE_FIREBASE_API_KEY`: Firebase web API key.
   * `VITE_FIREBASE_AUTH_DOMAIN`: `your-project.firebaseapp.com`.
   * `VITE_FIREBASE_PROJECT_ID`: `your-project`.
   * `VITE_FIREBASE_STORAGE_BUCKET`: `your-project.appspot.com`.
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your sender ID.
   * `VITE_FIREBASE_APP_ID`: Your app ID.

---

## 4. Android Build (Capacitor)

To compile the Android APK:
```bash
cd client-app/client

# Build web assets and sync to native Android container
npm run build
npx cap sync android

# Compile release or debug APK
cd android
./gradlew assembleRelease
```
The resulting APK is written to `android/app/build/outputs/apk/release/`.
