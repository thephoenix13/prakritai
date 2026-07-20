# PrakritAI — Architecture Decision Records

Key technical decisions, what was considered, and why we chose what we chose.
Reference this before proposing changes to the stack.

---

## ADR-001 — React Native + Expo over Flutter

**Decision**: React Native with Expo SDK 52

**Why not Flutter:**
- The web companion (doctor portal, emergency page) shares types, Supabase client, and query logic with the mobile app — this only works in a JS/TS monorepo
- The existing user base (89k+) was built on a React/Supabase stack; team knowledge is in React
- Expo's EAS Build + EAS Submit handles App Store and Play Store deployment in one workflow
- React Native New Architecture (Fabric + JSI) closes the performance gap with Flutter for data-heavy apps
- `@react-native-google-signin/google-signin` has excellent Expo support

**Flutter would be better if:** we were building a pure mobile app with no web companion and no existing React codebase.

---

## ADR-002 — Supabase over Firebase

**Decision**: Supabase (Postgres + Auth + Edge Functions + Storage)

**Why:**
- Postgres gives us proper relational queries (JOINs for circle connections, medication + member relationships)
- Row-Level Security (RLS) enforces data isolation at the DB layer — critical for health data
- Edge Functions run TypeScript/Deno — same language as the app
- Auth supports Google OAuth + email/password natively
- One platform for everything: DB, auth, storage, realtime, edge functions, vector search (future)

**Firebase would be better if:** we needed real-time sync across devices as the primary feature (e.g., a collaborative note-taking app). Firestore's document model is awkward for our relational health data.

---

## ADR-003 — Monorepo (pnpm workspaces) over separate repos

**Decision**: Single monorepo with `apps/mobile`, `apps/web`, `packages/shared`

**Why:**
- Shared TypeScript types from Supabase schema — one `gen types` command, both apps benefit
- Shared Supabase client factory — one place to update the client configuration
- Shared constants (colours, spacing, sample data) — design system consistency without duplication
- Atomic commits — a schema change + mobile update + web update in one PR
- `pnpm workspaces` keeps it lightweight (no Nx, no Turborepo needed at this scale)

---

## ADR-004 — Expo Router over React Navigation

**Decision**: Expo Router v4 (file-based routing)

**Why:**
- File-based routing mirrors the web mental model — `(tabs)/family/circle.tsx` is obvious
- Deep links auto-generated from file structure — `prakrit.ai/join/{token}` → `/(onboarding)/join/[token].tsx`
- Typed routes in TypeScript — no string-based `navigate('FamilyCircle', { id })` typos
- Layouts (`_layout.tsx`) handle auth guards, bottom nav, and header config in one place
- Better compatibility with Expo SDK 52 and New Architecture

---

## ADR-005 — FlashList over FlatList

**Decision**: `@shopify/flash-list` for ALL scrollable lists

**Why:**
- FlatList re-renders blank cells during fast scroll on Android (especially low-RAM devices)
- FlashList recycles cells natively — no blank cells, consistent 60fps
- Medication list, document library, timeline, family member list — all will have 20–100+ items
- The API is nearly identical to FlatList — `estimatedItemSize` is the only required addition
- Backed by Shopify, well-maintained, production-proven

**Rule**: If you write `<FlatList`, it will be rejected in code review.

---

## ADR-006 — React Native Reanimated 3 over Animated API

**Decision**: Reanimated 3 for all animations

**Why:**
- The `Animated` API runs on the JS thread — if the JS thread is busy (AI streaming, data processing), animations drop frames
- Reanimated 3 worklets run on the UI thread in a separate JS runtime — completely isolated from the JS thread
- Health score ring animation, BMI scale, grade badge transitions, bottom sheet — all must be smooth regardless of network/compute state
- `useSharedValue` + `useAnimatedStyle` is slightly more verbose than `Animated.Value` but the result is always 60fps

---

## ADR-007 — MMKV over AsyncStorage

**Decision**: `react-native-mmkv` for non-sensitive key-value storage; `expo-secure-store` for auth tokens

**Why:**
- AsyncStorage is async — auth token reads at startup cause a loading flash before the app knows if the user is logged in
- MMKV reads are synchronous — the app can know immediately on launch whether a session exists
- MMKV is 10× faster than AsyncStorage in benchmarks (C++ implementation using mmap)
- `expo-secure-store` uses iOS Keychain / Android Keystore for auth tokens — cannot be read by other apps

**What goes where:**
- `expo-secure-store`: Supabase session token, biometric enrollment flag
- `mmkv`: Emergency card cache, last-known medications, user preferences, app state

---

## ADR-008 — No OTP Authentication

**Decision**: Google Sign-In (primary) + Phone/Password (secondary) + Email/Password (tertiary). No OTP.

**Why:**
- 99% of Indian Android users have a Google account on their device — one tap is the fastest possible sign-in
- OTP introduces SMS cost (Twilio/MSG91), delivery delays, and failure cases (no signal, wrong number)
- Phone + persistent password is standard for Indian apps (PharmEasy, 1mg, Practo all support this)
- OTP is useful for verification but not as the primary auth method for a health app where users return daily
- Biometric (Face ID / Fingerprint) handles the "fast re-auth" use case that OTP was often used for

---

## ADR-009 — No In-App Purchases on Android (v1)

**Decision**: Redirect to `prakrit.ai/upgrade` for paid plans; no Razorpay/Stripe in-app on Android

**Why:**
- Google Play policy requires all digital purchases within an Android app to go through Google Play Billing API
- Play Billing requires a specific integration (`react-native-purchases` via RevenueCat)
- Violating this policy = app removal, not just rejection
- For v1, the simplest compliant approach is: no in-app price mention, redirect to web for upgrades
- RevenueCat integration is planned for v2 once the app is stable and monetisation is prioritised

---

## ADR-010 — Supabase Mumbai Region

**Decision**: `ap-south-1` (Mumbai) for the Supabase project

**Why:**
- 90%+ of users are in India
- Latency from Mumbai to Indian mobile networks: ~20–40ms
- Latency from US East (default) to India: ~200–300ms
- Health data fetches are latency-sensitive (the app feels slow if data takes >500ms)
- DPDP (Digital Personal Data Protection) Act 2023 — Indian health data should ideally be stored in India; Mumbai region satisfies this requirement

---

## ADR-011 — Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTS                              │
│  Android App    iOS App    Web Browser                   │
│  (Play Store)  (App Store) (prakrit.ai)                  │
└───────┬─────────────┬──────────────┬───────────────────┘
        │             │              │
        └─────────────┴──────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │   Supabase (Mumbai)      │
        │   ├── Postgres DB        │
        │   ├── Auth               │
        │   ├── Storage            │
        │   ├── Edge Functions     │
        │   └── Realtime           │
        └─────────────┬───────────┘
                      │ (edge functions call)
        ┌─────────────┴───────────┐
        │   External AI APIs       │
        │   ├── Anthropic (Claude) │
        │   └── OpenAI (voice)     │
        └─────────────────────────┘

Web hosting: Vercel (prakrit.ai)
  ├── /                → Landing page
  ├── /doctor          → Doctor Portal (Next.js)
  ├── /emergency/{tok} → Public emergency page
  ├── /join/{tok}      → Invite deep link (redirects to app or shows web fallback)
  └── /upgrade         → Subscription page (Razorpay)

Mobile OTA: EAS Update (JS-only updates bypass store review)
```
