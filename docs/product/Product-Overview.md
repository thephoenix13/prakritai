# Prakrit AI — Product Overview

**Document Type:** Internal product overview
**Audience:** Team members, partners on the product side, and end users who want a complete picture of what Prakrit AI is and how it works
**Date:** May 2026

---

## 1. What is Prakrit AI

Prakrit AI is a family health management app. It pulls everyone's medical records into one place, explains what they mean in plain language, tracks medications, and offers an AI health assistant that has full context on the family's history. It runs as a web app and, through WhatsApp, as a chat-only experience called **Prakrit GPT**.

In one line: *Your family's health intelligence — records, reminders, and answers, in one place.*

---

## 2. Why it exists

Families today manage health across paper prescriptions, PDFs in email, photos on phones, and notes in someone's head. Even when records are findable, the numbers on a lab report don't mean much to most people. The next doctor's appointment is weeks away, and in between, families are on their own.

Prakrit AI exists to close that gap with three things:

1. **One place** for every family member's health information.
2. **Plain-language understanding** of every document — what the values mean, what's out of range, what to ask a doctor.
3. **An always-on AI assistant** that answers health questions using the family's own context, not generic advice.

---

## 3. Who it's for

- **Families** managing health across multiple people and ages
- **Caregivers** looking after elderly parents or relatives with chronic conditions
- **Individuals** who want their own health history organised and explained
- **Partners** (e.g. Apollo 247) who want to embed continuous patient engagement into their existing healthcare touchpoints

---

## 4. Product surface — the core features

Each feature is built around a real family-health pain point. The web app exposes all of them; WhatsApp (Prakrit GPT) currently exposes the assistant and document analysis.

### Family Health Profiles
Each family member gets their own profile — separate records, medications, document store, and timeline. Built around the reality that most health management happens for someone else.

### Document Analysis
Upload a lab report, prescription, scan, or any medical PDF/image. The AI reads it, extracts the metrics, flags abnormals, and explains everything in plain language. No medical degree needed.

### Medication Tracking
Add a medication for any family member with dosage and schedule. The app sends reminders and surfaces upcoming refills. Especially useful for families managing multiple chronic medications.

### AI Health Assistant
A 24/7 assistant available as text or voice. It has context on the family's documents, medications, and history, so answers are personalised rather than generic. Voice mode supports natural back-and-forth conversation.

### Health Insights
Cross-document analysis. Compare results over time, spot trends across reports, and get a "what's changed" summary to take into the next doctor's visit.

### Health Timeline
A chronological record built automatically from documents, medications, and consultations. Lets families see how things are trending — blood pressure, HbA1c, weight — rather than living in scattered snapshots.

### Emergency Info Card
Blood type, allergies, contacts, current medications — stored as a quick-access card. The information that matters most in an emergency, ready before it's needed.

### Prakrit GPT (WhatsApp + Web)
A conversational entry point. On the web it's a public chat; on WhatsApp it's the same assistant available through the channel families already use every day. Works for anonymous users — no signup needed to try it.

---

## 5. How users access it

| Channel | What's there | Who it's for |
|---|---|---|
| **Web app** (`prakrit.ai`) | Full product — profiles, documents, medications, timeline, insights, AI assistant, emergency card | The primary experience |
| **WhatsApp** (via Twilio) | Prakrit GPT — chat with the AI, ask health questions, document analysis (in testing) | Low-friction entry; partner beta testing |
| **Public landing + demo** | `prakrit.ai` landing page, plus a WhatsApp demo page for partner sharing | Acquisition and partner conversations |

---

## 6. WhatsApp Implementation — the full app, in a chat

Prakrit AI on WhatsApp is not a stripped-down companion — the goal is for a family to do everything they'd do in the web app from a single WhatsApp thread. WhatsApp is where families already coordinate; bringing the product there removes the friction of installing, signing in, and remembering to come back.

This section covers how users interact with each feature on WhatsApp, what's live today, and what's in active build.

### 6.1 Getting started

1. The user adds Prakrit AI's WhatsApp number to their contacts (currently the Twilio sandbox `+1 415 523 8886` with join code `join married-station`; production number coming).
2. They send any message to start a session with Prakrit GPT — anonymous use works out of the box.
3. To unlock their full account (family, documents, medications, etc.), they send a single command:
   ```
   link your@email.com
   ```
   From that point on, the WhatsApp number is paired to their Prakrit AI account, and the assistant has read access to their family's health data.

No app install, no password, no OTP. Demo-grade for now (see 6.3).

### 6.2 Commands available today

| Command | What it does |
|---|---|
| `link your@email.com` | Pairs this WhatsApp number with the Prakrit AI account matching that email. Replies confirm the link. |
| `unlink` | Disconnects this WhatsApp number from any linked account. |
| `whoami` | Reports the current link status — who you're linked as, or that you're anonymous. |
| `reset` / `clear` | Wipes the chat history for this phone number. Preserves the account link. |
| Any health question | Goes to Prakrit GPT — uses the linked account's context when available. |
| Sending an image or PDF | The webhook downloads and analyses the document (lab report, prescription, scan). |

### 6.3 Account linking and security

The current implementation is built for **controlled demos**, not for public release:

- **No verification** — anyone who knows a demo user's email can claim that account from WhatsApp. That's intentional friction-removal for showing the product to partners and stakeholders.
- **Linking is per-phone** — each WhatsApp number can be linked to one Prakrit AI account at a time. `unlink` clears it; `link` to a different email overwrites it.
- **Anonymous fallback** — if no link is set, the bot still works as a generic health assistant with no access to records.

**Before public launch** the linking flow will be upgraded to require either an OTP sent to the email/phone or a one-time link-code surfaced in the web app. The current code path stays the same — only the verification gate is added.

### 6.4 What the assistant can answer when linked

Once a phone is linked, every message is enriched with the user's account context, fetched live from the database on each turn. The assistant can answer questions across:

- **Family members** — names, ages, gender, blood types
- **Active medications** — per family member, with dosage and frequency
- **Active medical conditions**
- **Allergies** and severities
- **Recent medical documents** — the last 10 uploads (lab reports, prescriptions, scans), by type and date
- **Emergency contacts** — top contacts with relationship and phone number

So a linked user can now ask:
- *"What medications is the whole family on?"*
- *"Does Dad have any allergies I should worry about?"*
- *"What was the last lab report we uploaded for Mom?"*
- *"Who's the emergency contact for my son?"*

The data flows **read-only** from the WhatsApp side — the assistant can describe and reason over the user's records, but does not yet write back to them (see 6.5).

### 6.5 What's live, what's in build

**Live today (deployed)**
- Two-way chat with Prakrit GPT (anonymous + linked)
- Per-phone conversation history in `whatsapp_conversations`
- Reset/clear command
- Server-side reply length cap (5–8 lines) for WhatsApp readability
- Anonymous use without auth

**Just shipped, awaiting deploy verification**
- `link / unlink / whoami` commands and the `user_id` column on `whatsapp_conversations`
- Read-only account context injection into Claude's system prompt (family, meds, conditions, allergies, recent documents, emergency contacts)
- Image and PDF download fix for Twilio media URLs (manual redirect handling to avoid the auth header leaking to S3)

**In active build / next up**
- **Conversational write actions** — adding medications, switching the active family member, recording allergies, all through natural language
- **Scheduled medication reminders** — proactive WhatsApp pings at dose times, with adherence logging via reply
- **Refill alerts** — automatic messages a few days before a medication runs out
- **Verified linking flow** — OTP or one-time link-code to replace the demo's bare-email link
- **Production WhatsApp Business number** — moving off the Twilio sandbox to a verified Meta-approved number

### 6.5 Why WhatsApp matters as a channel

- **Zero install friction** — WhatsApp is already on every Indian smartphone; no download, no signup
- **Family-native** — families already use WhatsApp to share lab reports and discuss medications; Prakrit AI meets them there instead of asking them to migrate
- **Always-on** — reminders, follow-ups, and proactive nudges land in the same thread as everything else
- **Caregiver-friendly** — an adult child can manage an elderly parent's health profile from their own WhatsApp without the parent needing to use any app at all

WhatsApp is not a secondary surface — for many families it will be the *primary* way they use Prakrit AI, with the web app serving as the deeper view when they need it.

---

## 7. How it works — light technical view

For internal team and technically curious partners.

### Frontend
- React 18 + TypeScript, built with Vite
- Tailwind CSS + shadcn/ui for design
- TanStack React Query for server state
- i18next for translations (English + Spanish)
- Mobile-first with a bottom navigation bar (Home, Family, AI, Meds, Docs, SOS)

### Backend
- Supabase for everything server-side: Postgres database, Auth, Row-Level Security (RLS), and Edge Functions
- RLS enforces strict per-user data isolation — every family's data is scoped to its own account
- ~15 edge functions cover the AI workloads (document analysis, health assistant, insights, comparisons, search, recommendations, WhatsApp webhook, voice tokens, etc.)

### AI providers
- **Claude (Anthropic)** powers all text-based AI features — document analysis, the health assistant, insights, and Prakrit GPT (web + WhatsApp). Migrated from Gemini in April 2026.
- **OpenAI Realtime API** powers the voice mode in the health assistant (24 kHz PCM16 audio pipeline).

### WhatsApp channel
- Twilio sandbox handles inbound messages
- A Supabase edge function (`whatsapp-webhook`) receives them, calls Claude, and persists per-phone conversation history in a `whatsapp_conversations` table
- Replies are length-capped server-side to keep them readable in the WhatsApp UI

### Data model
Core tables: `family_members`, `documents`, `medications`, `ai_chat_conversations`, `ai_chat_messages`, `ai_health_insights`, `whatsapp_conversations`. All user-scoped tables sit behind RLS.

---

## 8. Current state

### Live
- Web app at `prakrit.ai` — all core features
- Prakrit GPT on WhatsApp via Twilio sandbox (join code required, partner beta)
- Voice assistant
- Superadmin dashboard for ops and waitlist visibility

### Just shipped, awaiting deploy verification
- **WhatsApp account linking (demo flow)** — `link / unlink / whoami` commands, `user_id` column on `whatsapp_conversations`, and full read-only account context (family, meds, conditions, allergies, documents, emergency contacts) injected into the assistant on every turn
- **WhatsApp media download fix** — manual redirect handling so Twilio's pre-signed S3 URLs don't get the auth header that was breaking image and PDF downloads

### In progress / next up
- **WhatsApp file uploads end-to-end testing** — code is in place; needs the media download fix to land in the deployed function before validating with real prescriptions and lab reports
- **Verified linking flow** — replacing the bare-email demo link with OTP or one-time link-code from the web app
- **Conversational write actions on WhatsApp** — adding medications, switching active family member, recording allergies via natural language
- **WhatsApp production number** — moving off the Twilio sandbox to a verified WhatsApp Business number for public launch
- **Apollo 247 integration** — a partnership plan is drafted mapping nine Prakrit features into Apollo touchpoints (lab reports, prescriptions, Circle membership, consultations, diagnostics, MomVerse, Ask Apollo, etc.)

---

## 9. Privacy and data handling

Health data is sensitive by default, and Prakrit AI treats it that way.

- Data belongs to the user — no sharing with third parties without explicit consent
- Per-user isolation enforced at the database layer via Supabase RLS
- AI calls use the user's session token rather than a shared anon key, so requests are scoped and auditable
- Anonymous use is supported on Prakrit GPT for trial purposes without persisting personal records

---

## 10. The shape of the product, in one paragraph

Prakrit AI is built to be the connective tissue between a family and their health information. It captures what's already happening (documents, prescriptions, consultations), makes sense of it (AI explanations, trends, insights), and stays available between doctor visits (an assistant that has read everything). Whether a family uses it directly on the web, through WhatsApp, or embedded inside a partner's app like Apollo 247, the job is the same: keep the family's health understandable and under control.

---

*Prakrit AI — Your family's health intelligence.*
