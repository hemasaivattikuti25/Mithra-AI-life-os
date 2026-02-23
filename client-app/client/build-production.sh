#!/bin/bash

# Mithra Life OS - Production Build Verification Script
# This script ensures the application is in a stable state for deployment.

echo "🚀 Starting Mithra Production Build Verification..."

# 1. Dependency Audit
echo "📦 Auditing dependencies..."
npm install || { echo "❌ Dependency installation failed"; exit 1; }

# 2. Syntax & Production Build
echo "🏗️  Running Production Build (Vite)..."
npm run build || { echo "❌ Production build failed"; exit 1; }

# 3. Capacitor Sync
echo "🔄 Syncing Capacitor native layers..."
npx cap sync || { echo "❌ Capacitor sync failed"; exit 1; }

# 4. Final Checks
echo "✅ Production Build Verification Successful!"
echo "Mithra Life OS is ready for deployment."
