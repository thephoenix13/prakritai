# PrakritAI — Development Setup Guide

Complete step-by-step to get the development environment running from scratch.

---

## Prerequisites
- Node.js 20+ (`node -v`)
- pnpm 9+ (`npm i -g pnpm`)
- Expo CLI (`npm i -g eas-cli expo-cli`)
- Android Studio (for Android emulator) OR physical Android device
- Xcode 15+ (Mac only, for iOS simulator)
- Supabase account (supabase.com)
- Google Cloud Console account
- Apple Developer account ($99/yr — needed for iOS builds/TestFlight)
- Google Play Console account ($25 one-time — needed for Android deployment)

---

## Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Name: `prakritai-production` (or `prakritai-dev` for dev)
3. Database password: generate a strong one, save it
4. Region: **Mumbai (ap-south-1)** — closest to Indian users
5. Wait for project to spin up (~2 min)
6. Go to **SQL Editor** → paste the entire contents of `docs/setup/Supabase-Schema.sql` → Run
7. Verify: go to **Table Editor** — you should see ~15 tables created

### Get Supabase keys
Settings → API:
- `Project URL` → `SUPABASE_URL`
- `anon public` key → `SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret — server/edge functions only)

### Create Storage Buckets
Storage → New bucket:
1. Name: `documents`, Private: ✓, Max file size: 20MB, Allowed types: `image/*, application/pdf`
2. Name: `avatars`, Private: ✗ (public), Max file size: 2MB, Allowed types: `image/*`
3. Name: `thumbnails`, Private: ✗ (public), Max file size: 500KB, Allowed types: `image/*`

---

## Step 2 — Google OAuth Setup

### Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: `PrakritAI`
3. APIs & Services → OAuth consent screen:
   - User type: External
   - App name: `Prakrit AI`
   - Support email: your email
   - Authorized domains: `prakrit.ai`, `supabase.co`
   - Add scopes: `email`, `profile`, `openid`
4. APIs & Services → Credentials → Create credentials → OAuth 2.0 Client ID

Create **3 client IDs**:

**Android:**
- Application type: Android
- Package name: `ai.prakrit.app` (use your actual package name)
- SHA-1 fingerprint: run `eas credentials` → Android → get the SHA-1 from your keystore

**iOS:**
- Application type: iOS
- Bundle ID: `ai.prakrit.app`

**Web (for Supabase):**
- Application type: Web application
- Authorised redirect URIs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### Enable in Supabase
Authentication → Providers → Google → Enable:
- Client ID: paste the **Web** client ID
- Client Secret: paste the Web client secret
- Save

---

## Step 3 — Clone & Install

```bash
git clone <repo-url> prakritai
cd prakritai
pnpm install
```

### Environment files

**`apps/mobile/.env`**
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=xxxx.apps.googleusercontent.com
SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

**`apps/web/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Step 4 — EAS Setup (for builds)

```bash
# Login to Expo account
eas login

# Link the project (run from apps/mobile/)
cd apps/mobile
eas init

# Configure credentials
eas credentials
```

### `apps/mobile/eas.json`
```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "aab" },
      "ios": { "credentialsSource": "remote" }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## Step 5 — Run Locally

```bash
# Start the mobile app (dev build on device/emulator)
cd apps/mobile
pnpm start

# Scan QR with Expo Go app OR run on emulator:
pnpm android     # Android emulator
pnpm ios         # iOS simulator (Mac only)

# Start the web app
cd apps/web
pnpm dev         # http://localhost:3000
```

---

## Step 6 — Supabase Edge Functions (local dev)

```bash
# Install Supabase CLI
npm i -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Serve functions locally
supabase functions serve

# Deploy a function
supabase functions deploy ai-health-assistant
```

### Edge function environment variables
Set in Supabase Dashboard → Edge Functions → Manage secrets:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # for voice mode
EXPO_ACCESS_TOKEN=...          # for push notifications
TWILIO_ACCOUNT_SID=...         # for WhatsApp (future)
TWILIO_AUTH_TOKEN=...
```

---

## Step 7 — Generate TypeScript Types from Supabase

```bash
# Run from repo root
supabase gen types typescript \
  --project-id YOUR_PROJECT_REF \
  --schema public \
  > packages/shared/types/supabase.ts
```

Re-run this every time you change the schema.

---

## Step 8 — First Build

```bash
# Development build (installs custom dev client on device)
cd apps/mobile
eas build --profile development --platform android

# After build completes, install the APK on your device
# Then run:
pnpm start
```

---

## Deployment

### Android → Play Store
```bash
# Production build
eas build --profile production --platform android

# Submit to Play Store (internal track first)
eas submit --platform android
```

### iOS → App Store
```bash
eas build --profile production --platform ios
eas submit --platform ios
```

### Web → Vercel
```bash
# Connect repo to Vercel dashboard, or:
cd apps/web
vercel --prod
```

### OTA Updates (JS-only changes, no store review)
```bash
cd apps/mobile
eas update --branch production --message "Fix medication reminder timing"
```

---

## Useful Commands

```bash
# Type check entire monorepo
pnpm typecheck

# Lint
pnpm lint

# Generate Supabase types
pnpm db:types

# Reset local Supabase (if using local dev)
supabase db reset
```
