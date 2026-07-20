# PrakritAI — Project Status & Reference

**Last updated:** 2026-07-20  
**Brand:** prakrit.ai | Family health intelligence  
**Tagline:** Your family's health intelligence — records, reminders, and answers, in one place  
**Existing user base:** 89k+ (migrating from old web app)

---

## Credentials & Keys

### Supabase (Production Project)
| Key | Value |
|---|---|
| Project URL | `https://arlkwckdyexonyzqxbry.supabase.co` |
| Anon Key | Get from Supabase Dashboard → Settings → API → `anon public` |
| Region | Mumbai (ap-south-1) |
| Service Role Key | Not committed — get from Supabase Dashboard → Settings → API |

### Google OAuth (Not yet configured)
| Client | Status |
|---|---|
| Android Client ID | Empty — needs Google Cloud Console setup |
| iOS Client ID | Empty — needs Google Cloud Console setup |
| Web Client ID (for Supabase) | Empty — needs Google Cloud Console setup |

Setup: Google Cloud Console → Create project `PrakritAI` → OAuth consent screen → 3 Client IDs (Android, iOS, Web). Package name: `ai.prakrit.app`. Then paste Web client ID+secret into Supabase → Authentication → Providers → Google.

### Supabase Edge Function Secrets (not yet set)
Set at: Supabase Dashboard → Edge Functions → Manage secrets
```
ANTHROPIC_API_KEY=sk-ant-...    (for AI assistant / health score / drug interactions)
OPENAI_API_KEY=sk-...           (for voice mode — future)
EXPO_ACCESS_TOKEN=...           (for push notifications)
TWILIO_ACCOUNT_SID=...          (WhatsApp — future)
TWILIO_AUTH_TOKEN=...
```

### Sentry
- DSN: Not yet configured (leave `SENTRY_DSN=` blank until error monitoring is needed)

---

## What Has Been Built

### Monorepo Structure
- pnpm workspaces: `apps/mobile`, `apps/web` (Next.js stub), `packages/shared`
- Shared package: TypeScript types, Supabase client factory, design tokens (colors, spacing, radius), utility functions (BMI, health grade, date helpers)

### Mobile App (`apps/mobile`) — Expo SDK 52, React Native, TypeScript

#### Routing (all routes scaffolded)
| Route | File | Status |
|---|---|---|
| Auth | `/(auth)/sign-in.tsx` | Scaffolded |
| Onboarding | `/(onboarding)/index.tsx`, `profile-setup.tsx` | Scaffolded |
| Dashboard | `/(tabs)/index.tsx` | **Built** — full UI |
| Health Score | `/(tabs)/score/[id].tsx` | Scaffolded |
| Documents list | `/(tabs)/documents/index.tsx` | Scaffolded |
| Document detail | `/(tabs)/documents/[id].tsx` | Scaffolded |
| AI Assistant | `/(tabs)/ai/index.tsx` | Scaffolded |
| Family Hub | `/(tabs)/family/index.tsx` | Scaffolded |
| Family Member | `/(tabs)/family/[id].tsx` | Scaffolded |
| Add Member | `/(tabs)/family/add.tsx` | Scaffolded |
| Family Circle | `/(tabs)/family/circle.tsx` | Scaffolded |
| Medications list | `/(tabs)/medications/index.tsx` | Scaffolded |
| Add Medication | `/(tabs)/medications/add.tsx` | Scaffolded |
| Medication detail | `/(tabs)/medications/[id].tsx` | Scaffolded |
| More tab | `/(tabs)/more.tsx` | Scaffolded |
| Timeline | `/(more)/timeline.tsx` | Scaffolded |
| Insights | `/(more)/insights.tsx` | Scaffolded |
| Emergency Card | `/(more)/emergency.tsx` | Scaffolded |
| Doctors list | `/(more)/doctors/index.tsx` | Scaffolded |
| Doctor detail | `/(more)/doctors/[id].tsx` | Scaffolded |
| Protocol | `/(more)/protocol.tsx` | Scaffolded |
| Settings | `/(more)/settings.tsx` | Scaffolded |

#### Fully Built Screens
- **Dashboard** (`/(tabs)/index.tsx`): Greeting, ScoreRing with grade, BMI stat tile, family member strip with per-member rings, Today's Reminders section, AI prompt bar, medical disclaimer. Wired to real Supabase data via TanStack Query.

#### UI Components Built
- `ScoreRing` — animated SVG ring, score + grade display
- `GradeBadge` — A/B/C/D grade chip with correct colours
- `Avatar` — initials-based avatar with colour generation

#### Data Layer (all query files created)
| File | Covers |
|---|---|
| `lib/supabase.ts` | Supabase client (MMKV-backed session) |
| `lib/auth-context.tsx` | Auth state, display name, sign-out |
| `lib/queryClient.ts` | TanStack Query client config |
| `lib/queries/family.ts` | Family members CRUD |
| `lib/queries/medications.ts` | Medications + schedule |
| `lib/queries/documents.ts` | Document upload + listing |
| `lib/queries/health-score.ts` | Cached health score fetch |
| `lib/queries/timeline.ts` | Health timeline events |
| `lib/queries/emergency.ts` | Emergency card data |
| `lib/queries/circle.ts` | Family circle invite/accept |
| `lib/notifications.ts` | Push notification registration |

### Database (Supabase)
- Schema SQL: `docs/setup/Supabase-Schema.sql` (full schema, run this to set up)
- Storage buckets to create: `documents` (private, 20MB), `avatars` (public, 2MB), `thumbnails` (public, 500KB)
- RLS enabled on all tables

---

## What Has NOT Been Built Yet

### Edge Functions (all 11 pending)
| Function | Purpose |
|---|---|
| `ai-health-assistant` | Chat with family member context |
| `generate-health-insights` | Cross-document trend analysis |
| `generate-health-score` | 0–100 score + grade + breakdown |
| `check-drug-interactions` | Medication safety check |
| `generate-protocol` | 30-day health protocol |
| `compare-health-reports` | Multi-report comparison |
| `send-push-notification` | Expo Push API trigger |
| `circle-invite-create` | Generate invite token |
| `circle-invite-redeem` | Validate token + create request |
| `emergency-public-page` | Public emergency info (no auth) |
| `whatsapp-webhook` | Twilio WhatsApp handler |

### Screens (need full implementation)
- Sign-in (Google + phone/password + email flows)
- Onboarding (profile setup)
- Health Score detail (animated breakdown by category)
- Document upload + AI analysis
- AI Assistant (streaming chat)
- Medications (add, detail, reminder scheduling)
- Family Hub, Family Circle (invite via QR / link)
- Timeline, Insights, Emergency Card, Doctors, Protocol, Settings

### Web App (`apps/web`)
- Next.js 15 installed, not yet started
- Needed for: landing page, doctor portal, emergency public page, `/upgrade` (Razorpay), `/join/{token}` deep link fallback

### Not Yet Set Up
- Google OAuth (Client IDs empty)
- Sentry error monitoring
- EAS project linked (run `eas init` from `apps/mobile/`)
- Supabase TypeScript types not yet generated (run `pnpm db:types`)

---

## Known Issue

**"Runtime not ready" on device** after SDK 52→54 upgrade attempt. App bundles but crashes on launch. Next step to try: `"newArchEnabled": false` in `apps/mobile/app.json` to rule out New Architecture as the cause.

---

## How to Run Locally

```bash
# From repo root
pnpm install

# Start mobile dev server
cd apps/mobile
pnpm start

# Run on Android emulator
pnpm android

# Run on iOS simulator (Mac only)
pnpm ios
```

---

## Key Design Rules (quick reference)

- **Never** `FlatList` → always `FlashList` with `estimatedItemSize`
- **Never** `Animated` API → always Reanimated 3 worklets
- **Never** `AsyncStorage` → MMKV for KV, `expo-secure-store` for auth tokens
- **Never** `<Image>` from React Native → always `expo-image` with blurhash
- **Always** `React.memo` on list item components
- **Always** `useCallback` on props to memoised components
- Medical disclaimer on all AI-generated content: *"Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment."*
- No OTP anywhere in the auth flow
- No in-app payment UI on Android — redirect to `prakrit.ai/upgrade`

---

## Useful Docs (in this repo)

| File | Contents |
|---|---|
| `docs/product/PRD.md` | Full feature specs, screen refs, acceptance criteria, edge function specs |
| `docs/design/mockups/Screens-Clinical-44.html` | 44-screen visual mockup — open in browser |
| `docs/setup/Supabase-Schema.sql` | Full DB schema — paste into Supabase SQL Editor |
| `docs/setup/Setup-Guide.md` | Step-by-step dev environment setup |
| `docs/architecture/Decisions.md` | All ADRs (why Expo over Flutter, Supabase over Firebase, etc.) |
| `CLAUDE.md` | Claude Code instructions, full design system, component rules |
