#!/bin/bash

echo "🚀 Building Mithra Life OS APK for GitHub Release..."

# Exit on error
set -e

# 1. Build frontend
echo "📦 Building production web assets..."
npm run build

# 2. Sync with Android
echo "🔄 Syncing with Android native project..."
npx cap sync android

# 3. Build APK
echo "⚙️ Compiling Android APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug
cd ..

# 4. Move to root releases folder
echo "📁 Moving APK to releases folder..."
mkdir -p ../../releases
cp android/app/build/outputs/apk/debug/app-debug.apk ../../releases/Mithra-Life-OS-Latest.apk

echo "✅ Success!"
echo "Your APK is ready at: releases/Mithra-Life-OS-Latest.apk"
echo "You can now upload this file to your GitHub repository or Releases page."
