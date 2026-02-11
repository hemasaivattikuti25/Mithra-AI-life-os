#!/bin/bash
# ============================================================
# Mithra - Play Store Release Build Script
# ============================================================
# This script builds a production-ready AAB (Android App Bundle)
# for Google Play Store upload.
#
# Prerequisites:
#   1. Node.js and npm installed
#   2. Android SDK installed (ANDROID_HOME set)
#   3. Java 17+ installed
#   4. Release keystore generated (see below)
#   5. keystore.properties configured
#
# Generate a release keystore (one-time):
#   keytool -genkeypair -v \
#     -keystore release-keystore.jks \
#     -keyalg RSA -keysize 2048 -validity 10000 \
#     -alias mithra-release \
#     -dname "CN=Hema Sai Vartikotti, O=Mithra AI, L=City, ST=State, C=US"
#
# Then copy keystore.properties.example to keystore.properties
# and fill in your passwords.
# ============================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Force Java 21 for Gradle/Capacitor 8 compatibility
if /usr/libexec/java_home -v 21 &>/dev/null; then
  export JAVA_HOME=$(/usr/libexec/java_home -v 21)
  echo -e "${GREEN}Using Java 21: $JAVA_HOME${NC}"
elif /usr/libexec/java_home -v 17 &>/dev/null; then
  export JAVA_HOME=$(/usr/libexec/java_home -v 17)
  echo -e "${YELLOW}Using Java 17: $JAVA_HOME${NC}"
else
  echo -e "${RED}Error: Java 17 or 21 required. Install via: brew install temurin@21${NC}"
  exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mithra - Play Store Release Builder   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Navigate to client directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$SCRIPT_DIR"
ANDROID_DIR="$CLIENT_DIR/android"

cd "$CLIENT_DIR"

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx is not available${NC}"
    exit 1
fi

if [ ! -f "$ANDROID_DIR/keystore.properties" ]; then
    echo -e "${YELLOW}Warning: keystore.properties not found${NC}"
    echo -e "${YELLOW}Building unsigned release AAB...${NC}"
    echo -e "${YELLOW}For signed builds, copy keystore.properties.example to keystore.properties${NC}"
    echo ""
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}[2/6] Installing dependencies...${NC}"
npm ci --prefer-offline 2>/dev/null || npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Build web assets (production)
echo -e "${YELLOW}[3/6] Building web assets (production)...${NC}"
npm run build
echo -e "${GREEN}✓ Web assets built${NC}"
echo ""

# Step 4: Sync Capacitor
echo -e "${YELLOW}[4/6] Syncing Capacitor...${NC}"
npx cap sync android
echo -e "${GREEN}✓ Capacitor synced${NC}"
echo ""

# Step 5: Build release AAB
echo -e "${YELLOW}[5/6] Building release AAB...${NC}"
cd "$ANDROID_DIR"
./gradlew bundleRelease --no-daemon
echo -e "${GREEN}✓ Release AAB built${NC}"
echo ""

# Step 6: Show output
echo -e "${YELLOW}[6/6] Build complete!${NC}"
echo ""

AAB_PATH="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_PATH" ]; then
    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ Release AAB ready for Play Store!  ${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  File: ${BLUE}$AAB_PATH${NC}"
    echo -e "  Size: ${BLUE}$AAB_SIZE${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Go to https://play.google.com/console"
    echo "  2. Create your app listing"
    echo "  3. Upload the AAB file"
    echo "  4. Complete the store listing, content rating, and pricing"
    echo "  5. Submit for review"
else
    echo -e "${RED}Warning: AAB file not found at expected path${NC}"
    echo -e "Check: $ANDROID_DIR/app/build/outputs/bundle/release/"
    ls -la "$ANDROID_DIR/app/build/outputs/bundle/release/" 2>/dev/null || true
fi

# Also build APK for testing
echo ""
echo -e "${YELLOW}Also building APK for direct device testing...${NC}"
cd "$ANDROID_DIR"
./gradlew assembleRelease --no-daemon
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "  APK: ${BLUE}$APK_PATH${NC}"
    echo -e "  Size: ${BLUE}$APK_SIZE${NC}"
fi
