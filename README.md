# PrakritAI

**Your family's health intelligence — records, reminders, and answers, in one place.**

Family health management app. AI-powered document analysis, medication tracking with reminders, health timeline, and an always-on AI assistant with full family context.

- **Mobile app**: React Native + Expo → Google Play Store + Apple App Store
- **Web companion**: Next.js → Vercel (`prakrit.ai`)
- **Backend**: Supabase (Postgres + Auth + Edge Functions + Storage) — Mumbai region

---

## Quick Start

See **`docs/setup/Setup-Guide.md`** for the full step-by-step.

```bash
pnpm install
cd apps/mobile && pnpm start   # mobile dev server
cd apps/web && pnpm dev        # web dev server (localhost:3000)
```

---

## Key Docs

| Document | What it is |
|---|---|
| `CLAUDE.md` | Instructions for Claude Code — read this first |
| `docs/product/PRD.md` | Full mobile PRD — all feature specs, acceptance criteria, data model |
| `docs/design/mockups/Screens-Clinical-44.html` | 44-screen visual mockup — open in browser |
| `docs/setup/Supabase-Schema.sql` | Complete DB schema — run in Supabase SQL Editor |
| `docs/setup/Setup-Guide.md` | Step-by-step dev environment setup |
| `docs/architecture/Decisions.md` | Why we chose the tech we chose |

---

## Monorepo Structure

```
apps/
  mobile/     React Native + Expo (primary product)
  web/        Next.js (doctor portal, emergency page, landing)
packages/
  shared/     Types, Supabase client, design tokens, utilities
docs/
  product/    PRD, product overview, user manual
  design/     Mockups, design system
  setup/      Schema SQL, setup guides
  architecture/ Tech decisions
```

---

## Stack at a Glance

**Mobile**: Expo SDK 52 · Expo Router · TanStack Query · Reanimated 3 · FlashList · MMKV · NativeWind · Supabase JS · EAS Build

**Web**: Next.js 15 · Tailwind CSS · Supabase JS · Vercel

**Backend**: Supabase (Mumbai) · Postgres · Row-Level Security · Edge Functions (Deno/TS) · Supabase Auth

**AI**: Anthropic Claude (chat, document analysis, health score, insights) · OpenAI Realtime API (voice mode)

---

## Brand

- Name: **Prakrit AI** (display) / **PrakritAI** (code)
- Domain: **prakrit.ai**
- Colours: Teal `#00B894` · Dark `#09090B` · Background `#FAFAFA`
- Fonts: Space Grotesk (headings) · Inter (body)
