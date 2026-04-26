#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════
# dev-setup.sh — One-shot local dev environment setup
# ═══════════════════════════════════════════════════════
set -e

echo "🚀 Setting up Mithra dev environment..."

# Check Node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js 20+ is required. Install from https://nodejs.org"
  exit 1
fi

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3.11+ is required."
  exit 1
fi

# ── Backend ──────────────────────────────────────────────
echo ""
echo "📦 Installing Python dependencies..."
cd client-app/server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env if not present
if [ ! -f .env ]; then
  cat > .env <<'ENV'
NEON_DATABASE_URL=postgresql://user:pass@localhost:5432/mithra_dev
FIREBASE_SERVICE_ACCOUNT_JSON={}
GEMINI_API_KEY=your-gemini-key
ENCRYPTION_KEY=
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_ANNUAL=price_xxx
RESEND_API_KEY=re_xxx
APP_URL=http://localhost:5173
ENV
  echo "⚙️  Created client-app/server/.env — fill in your API keys"
fi

cd ../..

# ── Frontend ─────────────────────────────────────────────
echo ""
echo "📦 Installing Node.js dependencies..."
cd client-app/client
npm install

if [ ! -f .env ]; then
  cat > .env <<'ENV'
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc
VITE_REQUIRE_AUTH=false
ENV
  echo "⚙️  Created client-app/client/.env — fill in your Firebase config"
fi

cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  Backend:  cd client-app/server && source .venv/bin/activate && uvicorn main:app --reload"
echo "  Frontend: cd client-app/client && npm run dev"
echo ""
echo "Required env vars checklist:"
echo "  □ NEON_DATABASE_URL"
echo "  □ FIREBASE_SERVICE_ACCOUNT_JSON"
echo "  □ GEMINI_API_KEY"
echo "  □ ENCRYPTION_KEY  (generate: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\")"
echo "  □ STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET"
echo "  □ RESEND_API_KEY"
