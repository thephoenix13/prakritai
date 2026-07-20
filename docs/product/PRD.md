# Prakrit AI — Mobile App PRD
**Document Type:** Product Requirements Document  
**Version:** 1.0  
**Date:** July 2026  
**Status:** Draft — ready for development  
**Audience:** App developers, Claude Code, QA, design

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [Tech Stack](#4-tech-stack)
5. [Authentication & Onboarding](#5-authentication--onboarding)
6. [Navigation Structure](#6-navigation-structure)
7. [Feature Specifications](#7-feature-specifications)
8. [Notifications & Reminders](#8-notifications--reminders)
9. [Design System](#9-design-system)
10. [Data Model](#10-data-model)
11. [Backend & API](#11-backend--api)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Platform Requirements](#13-platform-requirements)
14. [Out of Scope — v1](#14-out-of-scope--v1)
15. [Screen Inventory](#15-screen-inventory)

---

## 1. Product Overview

### What
Prakrit AI is a family health management app. It centralises every family member's medical records, explains them in plain language, tracks medications with reminders, and provides an always-on AI health assistant with full family context.

### One-line
*Your family's health intelligence — records, reminders, and answers, in one place.*

### Why a mobile app
The existing web app at `prakrit.ai` covers all core features but is not optimised for on-the-go use — the primary use cases (checking a medication schedule, referencing a report at a clinic, logging a dose, emergency info) happen away from a desktop. A native mobile app enables push notifications, camera-based document capture, biometric auth, and offline access to critical info (emergency card).

### Existing backend
The web app is live at `prakrit.ai`. Its Supabase backend (Postgres + Auth + Edge Functions + RLS) is fully operational and will be reused as-is. The mobile app is a new client consuming the same APIs.

---

## 2. Goals & Success Metrics

### v1 Goals
1. Parity with the web app on all core user-facing features
2. Better than web on: push notifications, camera capture, offline emergency card, biometric login
3. Onboard a user to their first family member within 3 minutes of install

### Success Metrics (30 days post-launch)
| Metric | Target |
|---|---|
| Day-1 retention | ≥ 60% |
| Day-7 retention | ≥ 35% |
| Time to first family member added | < 3 min median |
| Medication reminder tap-through rate | ≥ 50% |
| App Store rating | ≥ 4.2 |
| Crash-free sessions | ≥ 99.5% |

---

## 3. User Personas

### Priya — Primary Caregiver (core persona)
- 32–45 yrs, urban, Android or iPhone
- Manages health for herself + husband + elderly parent(s) + kids
- Uploads lab reports after every doctor visit
- Needs reminders for family medication schedules
- Wants to quickly share a report with a doctor

### Ramesh — Family Member with Chronic Condition
- 45–60 yrs, T2 Diabetes / Hypertension
- Primarily a consumer of the app — Priya manages his profile
- Occasionally uses voice mode to ask health questions
- Needs his medication reminders to be reliable

### Rajeev — Caregiver at a Distance
- Son/daughter living in another city, managing elderly parent's health
- Uses Family Circle to stay connected to parent's health data
- Primary device: iPhone, occasional desktop

### Dr. Anjali — Doctor (secondary persona)
- Accesses patient records through the Doctor Portal (web-only in v1)
- Not the primary user of the mobile app

---

## 4. Tech Stack

### Recommended Stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo (SDK 52+) | Shares logic with existing React web app; fastest path to iOS + Android |
| Language | TypeScript | Consistent with existing codebase |
| Navigation | Expo Router (file-based) | Clean, consistent with web routing patterns |
| State / Data | TanStack Query v5 | Already used in web app; handles caching, background refresh |
| UI Components | Custom + NativeWind (Tailwind for RN) | Matches web design tokens; no third-party component lock-in |
| Auth | Supabase Auth + Google Sign-In (`@react-native-google-signin/google-signin`) | Supabase handles session; Google plugin handles OAuth |
| Backend | Supabase (existing) — Postgres + Auth + Edge Functions | No backend changes needed for v1 |
| Push Notifications | Expo Push Notifications + Supabase Edge Function trigger | Supabase writes notification → edge function triggers Expo push |
| File Handling | Expo Document Picker + Expo Image Picker + Expo Camera | For document upload via camera or files |
| Offline | MMKV + TanStack Query persistence | Emergency card + last-known state available without network |
| Analytics | PostHog React Native | Event tracking, funnels, session replay |
| Error Monitoring | Sentry for React Native | Crash reporting, performance tracing |
| Build & Deploy | EAS Build + EAS Submit | Managed CI/CD, direct Play Store + App Store submission |

### Performance-Critical Library Choices
These are non-negotiable for a smooth, fast feel. Using the wrong library here is the most common cause of janky React Native apps.

| Problem | Wrong choice | Correct choice | Why |
|---|---|---|---|
| Long lists (meds, docs, timeline) | `FlatList` | `FlashList` (Shopify) | FlashList is 5–10× faster; no blank cells on fast scroll |
| Animations | `Animated` API | `React Native Reanimated 3` | Reanimated runs on UI thread — no JS bridge = 60fps guaranteed |
| Charts (trend lines, BMI scale, score ring) | `Victory Native` / `Recharts` | `React Native Skia` + `Victory Native XL` | GPU-accelerated via Skia; smooth even on low-end Android |
| Key-value storage (tokens, prefs) | `AsyncStorage` | `react-native-mmkv` | MMKV is 10× faster; synchronous reads mean no loading flash on startup |
| Images (avatars, doc thumbnails) | `<Image>` from RN | `expo-image` | Built-in disk + memory cache; blurhash placeholders; no layout shift |
| Secure token storage | `AsyncStorage` | `expo-secure-store` | Uses iOS Keychain / Android Keystore; required for auth tokens |
| Gesture handling | `TouchableOpacity` | `react-native-gesture-handler` | Native gesture recognition; no JS thread delay on touch |
| Bottom sheets / modals | Custom View | `@gorhom/bottom-sheet` | Runs on UI thread via Reanimated; buttery smooth open/close |

### React Native New Architecture (Required)
Enable the New Architecture in `app.json`:
```json
{
  "expo": {
    "newArchEnabled": true
  }
}
```
- **Fabric renderer**: UI updates happen synchronously on the UI thread — eliminates the "white flash" on navigation
- **JSI (JavaScript Interface)**: Native modules communicate without the bridge — MMKV, Reanimated, Gesture Handler all use this
- **Concurrent Mode**: React 18 concurrent features work correctly in RN New Arch

### Hermes JavaScript Engine (Required)
Enabled by default in Expo SDK 52. Verify in `app.json`:
```json
{ "expo": { "jsEngine": "hermes" } }
```
Hermes pre-compiles JS to bytecode at build time — faster startup, lower memory on mid-range Android.

### Build Configuration
- **EAS Build** for all builds (dev, preview, production) — never local `expo build`
- **App Bundle (.aab)** format for Play Store (not .apk)
- **ProGuard / R8** enabled on production Android builds for code shrinking
- **Hermes**: enabled (see above)
- Separate `development`, `preview`, and `production` build profiles in `eas.json`

### Supabase Configuration Additions Needed
- Enable Google OAuth provider in Supabase Auth dashboard
- Add `expo_push_token` column to `users` or `profiles` table
- Add `height_cm`, `weight_kg` columns to `family_members` table
- Add `medication_logs` table (for "Take" button adherence tracking)

---

## 5. Authentication & Onboarding

### 5.1 Auth Options

Three methods — ordered by priority on the sign-in screen:

#### Option A: Google Sign-In (Primary — most prominent)
- Large "Continue with Google" button with Google logo
- Uses native Google Sign-In SDK on device — one tap, no typing
- On first sign-in: creates Supabase account via Google OAuth
- On return: re-authenticates silently if Google session is active
- **Implementation**: `@react-native-google-signin/google-signin` + Supabase `signInWithIdToken`
- **Required**: Google OAuth Client ID configured in Supabase + Google Cloud Console

#### Option B: Phone Number + Password
- Phone number field (with country code picker, default +91)
- Password field (min 8 chars, show/hide toggle)
- "Forgot password?" → sends reset link via SMS or email
- **Implementation**: Use phone number as the username stored in `profiles` table; Supabase email/password auth with phone stored separately, OR implement phone-as-identifier with a custom auth flow
- **Note**: This is NOT phone OTP — it is a persistent password set by the user

#### Option C: Email + Password (tertiary, "Other options" collapse)
- Collapsed by default, expands on tap
- Standard email + password fields
- "Forgot password?" → email reset link

### 5.2 Sign-Up vs Sign-In
- Same screen, toggle between "Sign in" and "Create account"
- Google button always works for both (Supabase creates account on first use)
- For phone/email: "Create account" shows name field additionally

### 5.3 Acceptance Criteria — Auth
- [ ] Google Sign-In works on both iOS and Android
- [ ] Silent re-auth on app reopen if Google session is valid
- [ ] Phone + password login works without OTP
- [ ] Password reset via email works for phone-registered users
- [ ] Biometric auth (Face ID / Fingerprint) available as a shortcut after first login — prompts on second app open
- [ ] Auth state persists across app kills (Supabase session stored in SecureStore)
- [ ] On auth failure, clear error message displayed (no raw Supabase errors shown)

### 5.4 Onboarding Flow (first-time users)
Runs once after account creation. Skippable at any step (user can complete later from Settings).

**Step 1 — Splash Carousel** (6 screens, swipeable)
- S01: Wordmark splash
- S35: AI Reports
- S36: Family Hub
- S38: Medication Reminders
- S39: Emergency Hub
- S40: Prakrit Voice
- Each has a "Next →" button and step dots

**Step 2 — Profile Setup** (Screen S37)
- Full name (pre-filled from Google if available)
- Gender selector: Female / Male / Other
- Height (cm) — stepper or slider, range 100–220 cm
- Weight (kg) — stepper or slider, range 20–200 kg
- Live BMI calculated and displayed as user adjusts
- BMI categories: Underweight (<18.5), Normal (18.5–24.9), Overweight (25–29.9), Obese (≥30)
- BMI colour scale visualised (blue → teal → yellow → red)
- "View my health score →" CTA to proceed

**Step 3 — Add First Family Member** (optional nudge)
- "You're all set! Add your first family member to start tracking their health."
- "Add family member" button → goes to Add Family Member screen
- "Skip for now" → goes to dashboard

### 5.5 Returning Users
- App opens to dashboard directly if session is valid
- If session expired: show sign-in screen with last-used method pre-selected
- Biometric prompt shown immediately on app open (if enabled)

---

## 6. Navigation Structure

### Bottom Navigation Bar (5 tabs)
Always visible except on full-screen modals and splash screens.

| Tab | Icon | Screen |
|---|---|---|
| Home | House | Dashboard |
| Family | Users | Family Hub |
| AI | Sparkles / Brain | AI Health Assistant |
| Meds | Pill | Medications List |
| More | Grid / Menu | Documents, Timeline, Insights, Emergency, Settings |

### "More" Tab expands to:
- Documents
- Health Timeline
- Health Insights
- Emergency Card
- Settings

### Header Pattern
Most screens have:
- Back arrow (if not a root tab)
- Screen title (left-aligned, bold)
- Optional action icon top-right (e.g., add, share, filter)

### Modal Pattern
Full-screen modals (slide up from bottom) for:
- Add Family Member
- Upload Document
- Add Medication
- Invite to Circle

---

## 7. Feature Specifications

---

### 7.1 Home Dashboard
**Mockup:** S04, S32 (empty state)

**What it is:** The landing screen after login. Shows family health summary, quick actions, and recent activity.

**User Stories**
- As a user, I want to see a greeting and the overall state of my family's health at a glance
- As a user, I want to reach any core feature within 2 taps from the dashboard

**UI Elements**
- Greeting: "Good morning, Priya" (time-aware)
- 2-column stat grid:
  - Bio Age (AI-calculated — show "–" until computed)
  - BMI (from profile setup; show category label)
  - Family Members count
  - Active Medications count
- Health Score ring (0–100, grade A/B/C/D) — show skeleton until computed; tap → Health Score detail screen
- Family members quick-list (up to 4 cards with avatar, name, age, latest alert badge if any)
- Quick actions row: AI Chat, Upload Report, Add Medication, Emergency
- "Health Tip of the Day" card (static, rotates daily)

**Acceptance Criteria**
- [ ] Dashboard loads within 1.5s on 4G
- [ ] Empty state (S32) shown if no family members added yet — with prominent "Add your first family member" CTA
- [ ] Health Score ring shows skeleton loader, not empty, while computing
- [ ] BMI shown as "23.3 · Normal" format with teal background if Normal, yellow if Overweight, red if Obese
- [ ] Tapping a family member card goes to that member's detail screen
- [ ] Pull-to-refresh works

---

### 7.2 Health Score
**Mockup:** S05, S06, S07, S08

**What it is:** An AI-computed 0–100 health score for each family member, broken into biomarker categories, with drill-down to individual markers.

**Screens**
- S05: Overall score ring + grade + category breakdown
- S06: Biomarker category list (Metabolic, Cardiovascular, Hormonal, etc.)
- S07: Category detail (e.g., Metabolic — shows sub-markers)
- S08: Individual biomarker detail (e.g., HbA1c — value, range, trend chart, AI explanation)

**User Stories**
- As a user, I want to understand my family member's overall health at a score level
- As a user, I want to know which category is dragging the score down
- As a user, I want a plain-language explanation of what each biomarker means

**Acceptance Criteria**
- [ ] Score computed from uploaded documents via `generate-health-score` edge function (to be built)
- [ ] Grade badges: A (teal, 80–100), B (yellow, 60–79), C (rose, 40–59), D (red, 0–39)
- [ ] Score ring animates on load (0 → final value)
- [ ] Each category shows grade + contributing markers count
- [ ] HbA1c detail shows 6-month trend line chart
- [ ] "Last updated: Jul 10" shown with each score
- [ ] If no documents uploaded yet: "Upload a report to compute your score" prompt

---

### 7.3 Family Hub
**Mockup:** S15, S16, S17

**What it is:** List of all family members with health summary cards. Entry point to individual member profiles.

**Screens**
- S15: Family Hub — list of members with avatar, name, age, grade badge, alert count
- S16: Member detail — Ramesh's full profile (conditions, medications, documents, timeline)
- S17: Critical Alert detail

**User Stories**
- As a user, I want to see all family members and their current health status in one view
- As a caregiver, I want to tap into a member's profile and see everything about their health
- As a user, I want to be alerted immediately if a critical health value is detected

**Acceptance Criteria**
- [ ] Member card shows: avatar (initials-based, colour-coded), name, age, gender, grade badge, alert badge (red dot + count)
- [ ] "Add member" FAB (floating action button) in bottom-right
- [ ] Member detail shows: profile header, active conditions (chips), current medications list, recent documents (horizontal scroll), timeline preview
- [ ] Critical alerts (from AI document analysis) shown as a red banner at top of member detail
- [ ] Tapping alert → Alert detail with AI explanation and recommended action
- [ ] Swipe-left on member card in list → Delete member (with confirmation dialog)

---

### 7.4 Add Family Member
**Mockup:** S37 (profile setup flow, same form)

**Fields**
- Full name (required)
- Relationship to account holder: Self / Spouse / Parent / Child / Sibling / Other
- Date of birth (date picker — required)
- Gender: Female / Male / Prefer not to say
- Blood type: A+/A−/B+/B−/AB+/AB−/O+/O− / Unknown (optional)
- Height in cm (optional, number input)
- Weight in kg (optional, number input)
- Profile photo (optional, camera or gallery)
- BMI auto-calculated and shown if height + weight are provided

**Acceptance Criteria**
- [ ] Name and DOB are required; all else optional
- [ ] BMI calculates live as user changes height/weight
- [ ] Profile photo upload compresses to ≤ 500KB before upload
- [ ] Successful add → navigates to new member's profile
- [ ] If Self relationship already exists, disable "Self" option

---

### 7.5 Family Circle & Invite Flow
**Mockup:** S41, S42, S43, S44, S45

**What it is:** A controlled sharing system that lets users share their family's health data with other Prakrit AI users (relatives, caregivers at a distance) and manage who has access.

**Screens**
- S41: Family Circle Hub — overview of your family, connected families, doctor access, pending requests
- S42: Send Invite — generate and share an invite link
- S43: Join via Link — what the recipient sees (request to join)
- S44: Manage Requests — accept / decline incoming requests, revoke active connections
- S45: Linked Family View — read-only view of a connected family's shared data

**User Stories**
- As a user, I want to share my family's health data with a sibling in another city so they can stay informed
- As a recipient, I want to request access to a family member's health circle
- As a host, I want to approve or decline access requests
- As a host, I want to revoke access at any time
- As a connected user, I want to view a linked family's data in read-only mode

**Data Flow**
1. Host generates invite link → stored in `circle_invites` table with a UUID token, `host_user_id`, expiry (48 hrs), and `used: false`
2. Recipient opens link → sees S43 (Join Request screen) → taps "Request to Join" → creates row in `circle_requests` table
3. Host sees badge on Family Circle → taps → S44 → accepts or declines
4. On accept: creates row in `circle_connections` table linking the two user IDs
5. Both users can now see each other's family in S45 (read-only)
6. Revoke: deletes the `circle_connections` row

**Acceptance Criteria**
- [ ] Invite link is a deep link (`prakrit.ai/join/{token}`) — on mobile opens app; on desktop opens web
- [ ] Link expires after 48 hours and is single-use
- [ ] Invite link shareable via WhatsApp, SMS, and system share sheet
- [ ] Request badge shown on Family tab icon when pending requests exist
- [ ] Linked family view is read-only — no add/edit/delete buttons visible
- [ ] "Remove connection" available to both parties
- [ ] Access history (accepted + revoked) shown in S44
- [ ] Max 10 active circle connections per user (show error if exceeded)

**DB Tables Needed**
```sql
circle_invites (id, host_user_id, token uuid, expires_at, used boolean, created_at)
circle_requests (id, invite_id, requester_user_id, status: pending|accepted|declined, created_at)
circle_connections (id, user_a_id, user_b_id, connected_at, revoked_at nullable)
```

---

### 7.6 Documents & AI Analysis
**Mockup:** S09, S10, S11, S30

**What it is:** Upload medical documents (lab reports, prescriptions, scans), get AI analysis in plain language.

**Screens**
- S09: Documents Library — list of all uploaded documents, filterable by member and type
- S10: Upload Document — camera capture or file picker, member selector, document type
- S11: Document Viewer — rendered document + AI analysis panel below
- S30: Full Document Analysis — expanded AI analysis with sections (summary, findings, medications, lab values, recommendations)

**User Stories**
- As a user, I want to upload a lab report and immediately understand what the values mean
- As a user, I want to find any document I've uploaded by member or type
- As a user, I want the AI analysis to flag anything out of range in plain language

**Upload Sources**
1. Camera (photo the report on paper)
2. Device gallery (select existing photo)
3. Files app (select PDF)

**Accepted Formats:** PDF, JPG, PNG, HEIC (auto-converted to JPEG on device before upload)

**Acceptance Criteria**
- [ ] Upload screen: select family member first, then document type (Lab Report / Prescription / Scan / Hospital Discharge / Other), then capture/select file
- [ ] File compressed to ≤ 5MB before upload (show error if still too large)
- [ ] Upload progress bar shown
- [ ] AI analysis triggered automatically after upload — streaming response displayed
- [ ] Analysis sections: Summary, Key Findings (with normal/abnormal badges), Lab Values table, Medications listed, Recommendations
- [ ] Abnormal values highlighted in red; normal in teal
- [ ] Documents searchable by name, member, date, type
- [ ] Documents sortable: newest first (default), oldest first, by member
- [ ] Tap document card → Document Viewer
- [ ] Document Viewer shows: document thumbnail/preview + full AI analysis below
- [ ] Share document + analysis: export as PDF or share link (doctor code)

---

### 7.7 Medications
**Mockup:** S18, S19, S33

**Screens**
- S18: Medications List — all medications across all family members, filterable
- S19: Medication Detail — single medication with schedule, history, AI notes
- S33: Add Medication — form with drug interaction check

**User Stories**
- As a user, I want to track all family medications in one view
- As a user, I want to log when a dose was taken
- As a user, I want to be warned if two medications interact
- As a user, I want to receive push notification reminders for each dose

**Add Medication Fields**
- Family member (required)
- Medication name — search with autocomplete from drug database
- Dosage (e.g., 500mg)
- Form: Tablet / Capsule / Syrup / Injection / Topical
- Frequency: Once daily / Twice daily / Three times daily / As needed / Custom
- Time(s) of day: Morning / Afternoon / Evening / Bedtime (multi-select)
- With food: Yes / No / Doesn't matter
- Start date (required)
- End date (optional)
- Notes (optional)
- Reminder toggle — if on, schedules push notifications at selected times

**Drug Interaction Check**
- On adding a medication, check against other active medications for the selected family member
- Call `check-drug-interactions` edge function (uses Claude to assess)
- If interaction found: show yellow warning card with severity and explanation
- User must explicitly acknowledge before saving

**Medication "Take" Button — Adherence Tracking**
- On medication list and in push notifications: "Take" button
- Tap → logs a row in `medication_logs` (member_id, medication_id, scheduled_time, taken_at, taken: true)
- Missed dose: if 2 hrs past scheduled time and not logged → mark as "Missed" in log
- Medication detail shows 7-day adherence calendar (taken / missed / upcoming)

**Acceptance Criteria**
- [ ] Medication list filterable by family member (chip row)
- [ ] Active and History tabs
- [ ] "Take" button on each active medication card
- [ ] Push notification sent at scheduled dose time with "Take" action button in notification (tappable without opening app)
- [ ] Drug interaction check runs before saving (not blocking — shows warning, user proceeds with acknowledgement)
- [ ] Adherence calendar in medication detail (last 7 days)
- [ ] Edit medication → same form, pre-filled
- [ ] Delete → confirm dialog → soft-delete (moves to History)

---

### 7.8 Health Timeline
**Mockup:** S20

**What it is:** A chronological view of all health events (uploaded documents, medications started/stopped, consultations noted, alerts triggered).

**User Stories**
- As a user, I want to see a family member's complete health history in order
- As a user, I want to filter the timeline by event type

**Entry Types**
| Type | Icon | Colour |
|---|---|---|
| Lab Test / Document Upload | Flask | Teal |
| Prescription | Pill | Purple |
| Doctor Visit | Stethoscope | Blue |
| Hospital Visit | Building | Red |
| Manual Note | Note | Grey |
| Medication Started | Plus-Pill | Green |
| Alert Triggered | Alert | Rose |

**Acceptance Criteria**
- [ ] Timeline entries auto-created when: document uploaded, medication added, alert triggered
- [ ] Users can add manual notes (Doctor Visit, Hospital Visit, general note)
- [ ] Filter by member (pill selector) and by type (dropdown)
- [ ] Search by keyword
- [ ] Tap entry → detail view (document viewer / medication detail / note editor)
- [ ] Infinite scroll (paginated, 20 entries per page)

---

### 7.9 Health Insights
**Mockup:** S21

**What it is:** AI-driven cross-document analysis — trends over time, comparison reports, and a "what to tell your doctor" summary.

**User Stories**
- As a user preparing for a doctor visit, I want a summary of what's changed since my last visit
- As a user, I want to understand long-term trends in key biomarkers (HbA1c, BP, cholesterol)

**Acceptance Criteria**
- [ ] Member selector at top
- [ ] "Generate Insights" button → calls `generate-health-insights` edge function → streaming response
- [ ] Insights show: Overall summary, Improving markers, Declining markers, Stable markers, Actionable recommendations
- [ ] Trend badges: ↑ Improving (teal), ↓ Declining (red), → Stable (grey)
- [ ] Severity badges: Critical (red), Warning (yellow), Info (blue), Normal (teal)
- [ ] Upload multiple reports for comparison: session-based analysis (select 2–5 docs, compare)
- [ ] Insights history: list of past generated insights, tappable to reload
- [ ] Share insights: export as PDF or text summary

---

### 7.10 Emergency Card
**Mockup:** S22, S39

**What it is:** A quick-access card with the most critical health information for each family member. Must be accessible even offline.

**What it shows**
- Blood type (large display)
- Known allergies (with severity — Severe in red)
- Medical conditions
- Current medications (name + dosage)
- Emergency contacts (with Call button)
- QR code (encodes a URL to a public read-only emergency page)

**Acceptance Criteria**
- [ ] Emergency Card cached locally for offline access
- [ ] Accessible from lock screen via a widget (iOS/Android widget — v2)
- [ ] QR code generated client-side using member's emergency public token
- [ ] QR code, when scanned, opens `prakrit.ai/emergency/{token}` — a public read-only page (no login required)
- [ ] Share button: share the emergency URL via WhatsApp/SMS
- [ ] Member selector to switch between family members' cards
- [ ] "Edit Emergency Info" navigates to edit screen

---

### 7.11 AI Health Assistant
**Mockup:** S12, S13, S31

**Screens**
- S12: AI Chat — text conversation with streaming responses
- S13: Voice Listening — full-screen voice mode
- S31: Voice Response — AI speaking back

**What it is:** A 24/7 AI assistant with full context on the selected family member's documents, medications, conditions, allergies, and history.

**User Stories**
- As a user, I want to ask a health question in plain language and get a contextualised answer
- As a user, I want to use voice so I can ask while my hands are busy
- As a user, I want to get an answer in my preferred language

**Text Chat**
- Member selector chip row at top
- Chat bubbles (user right, AI left)
- Streaming response (token by token)
- Quick-prompt chips: "Explain my last report", "Any drug interactions?", "What should I tell my doctor?", "How is my HbA1c trending?"
- Markdown rendering (bold, lists, headings)
- Scroll to bottom button when not at bottom

**Voice Mode**
- Full-screen overlay
- Mic button to start/stop recording
- Animated pulse while recording
- Transcription shown as user speaks
- "Thinking..." spinner during AI processing
- AI response shown as text + optionally read aloud (TTS)
- Language chips: हिंदी / English / मराठी / తెలుగు

**Acceptance Criteria**
- [ ] Streaming works on mobile (SSE or websocket)
- [ ] Voice recording uses device mic; audio sent to transcription (Whisper or OpenAI Realtime API)
- [ ] Chat history persists within the session; new conversation on next app open (v1)
- [ ] Rate limit (429) shows friendly message: "You've reached today's limit. Upgrade to Pro for unlimited questions."
- [ ] File attachment: user can attach a photo/PDF in chat for one-off document analysis (same as PrakritGPT)
- [ ] Quick-prompt chips scroll horizontally if more than 3 visible

---

### 7.12 Doctor Network
**Mockup:** S23, S28

**Screens**
- S23: Doctor Network — list of enrolled doctors in the Prakrit network
- S28: Doctor Profile — individual doctor with specialisation, hospital, contact, and "Share my records" button

**User Stories**
- As a user, I want to find a doctor in the Prakrit network who has access to AI insights
- As a user, I want to share my records with a doctor I'm consulting with

**Acceptance Criteria**
- [ ] Doctor list filterable by specialty and city
- [ ] Doctor card: photo/avatar, name, specialty, hospital, Prakrit-verified badge
- [ ] Doctor profile: full bio, languages spoken, clinic hours, "Generate access code" button
- [ ] Access code: 8-character code (PRK-XXXX-XXXX format), valid 72 hrs, shared via copy/WhatsApp
- [ ] Active access grants list: doctor name, expiry, "Revoke" button
- [ ] Access history shown below active grants

---

### 7.13 Personalized Protocol
**Mockup:** S29

**What it is:** An AI-generated 30-day health improvement plan for a family member based on their current health data.

**User Stories**
- As a user with a chronic condition, I want a structured health plan with daily/weekly actions
- As a user, I want to track my progress through the plan

**Acceptance Criteria**
- [ ] Protocol generated via `generate-protocol` edge function (to be built)
- [ ] Protocol shows: Day X of 30 banner with progress bar, Week 1–2 tasks (checkboxes), Week 3–4 tasks (dimmed until week 1 complete), Month End goals
- [ ] Tasks are checkable — completion logged in `protocol_logs` table
- [ ] "Adjust Plan" button → asks Claude to modify based on updated context
- [ ] "Log today" button → quick-log for the day's activities
- [ ] One active protocol per family member at a time

---

### 7.14 Settings & Profile
**Mockup:** S24, S25, S26

**Screens**
- S24: Profile & Settings — personal info, notifications, membership
- S25: Membership / Upgrade
- S26: Lock Screen (biometric prompt)

**Settings Sections**

**Account**
- Personal details (name, phone, email)
- Change password
- Language & Region
- Linked accounts (Google — show linked email, option to unlink)

**Profile**
- Profile photo
- Height / Weight (editable, BMI recalculates)
- Date of birth

**Notifications**
- Medication reminders toggle
- Health insights weekly summary toggle
- Critical alert notifications toggle
- Push notification permission prompt if not granted

**Privacy & Security**
- Biometric login toggle
- Data export (download all health data as JSON/PDF)
- Delete account (irreversible, requires confirmation)

**Membership**
- Current plan (Free / Pro / Family)
- Upgrade options
- Billing history

**Acceptance Criteria**
- [ ] Language change applies immediately across the app (i18n)
- [ ] Notification toggles update local preference AND Supabase `user_preferences` table
- [ ] Biometric toggle: enabling shows Face ID / Fingerprint prompt; disabling requires password confirmation
- [ ] Data export: triggers async job, sends download link via email when ready
- [ ] Delete account: shows 2-step confirmation; clears all user data from Supabase (GDPR)

---

### 7.15 Share Report with Doctor
**Mockup:** S34

**What it is:** Generate a time-limited access code so a doctor can view specific records via the Doctor Portal.

**Acceptance Criteria**
- [ ] Code format: PRK-XXXX-XXXX (8 alphanumeric)
- [ ] Default expiry: 72 hours (adjustable: 24h / 72h / 7 days)
- [ ] Code shareable via WhatsApp, SMS, copy
- [ ] Active grants listed with remaining time
- [ ] Revoke button cancels access immediately
- [ ] Access log: timestamp + action for each code use

---

## 8. Notifications & Reminders

### Notification Types

| Type | Trigger | Action on Tap |
|---|---|---|
| Medication Reminder | Scheduled dose time | Opens medication; shows "Take" button |
| Missed Dose Alert | 2 hrs after scheduled time, not logged | Opens medication |
| Critical Health Alert | AI detects abnormal value in uploaded doc | Opens Alert detail |
| Weekly Health Summary | Every Sunday 8am | Opens Health Insights |
| Circle Request | Someone requests to join your circle | Opens Manage Access screen |
| Document Analysis Complete | Upload finishes processing | Opens Document Viewer |
| Refill Reminder | 7 days before estimated end date | Opens Medication Detail |

### Implementation
- Expo Push Notifications on device; token stored in `profiles.expo_push_token`
- Medication reminders: scheduled on device using `expo-notifications` local notifications (no server needed for local; server-side for multi-device sync)
- Critical alerts and circle requests: triggered by Supabase Edge Functions → Expo Push API

### Acceptance Criteria
- [ ] Notification permission requested on first medication added (not on app install)
- [ ] "Take" action available directly in notification tray (without opening app) on both iOS and Android
- [ ] Notification preferences sync to server so they can be managed from any device
- [ ] Quiet hours: no notifications between 10pm–7am (configurable)

---

## 9. Design System

### Colours
```
Background:    #FAFAFA
Surface:       #F4F4F5
Border:        #E4E4E7
Text Primary:  #09090B
Text Secondary:#71717A
Text Tertiary: #A1A1AA

Teal (primary): #00B894
Teal Light:     #CCFBF1
Teal Lighter:   #E8FDF8

Yellow:         #D4A017
Yellow Light:   #FEF3C7

Rose:           #F472B6
Rose Light:     #FCE7F3

Red:            #EF4444
Red Light:      #FEE2E2
```

### Typography
- **Display / Headings**: Space Grotesk (weights: 400, 500, 600, 700, 800)
- **Body / Labels**: Inter (weights: 400, 500, 600)

### Grade Badges
| Grade | Score | Background | Text/Border |
|---|---|---|---|
| A | 80–100 | #CCFBF1 | #00725E / #00B894 |
| B | 60–79 | #FEF3C7 | #8a5e0a / #D4A017 |
| C | 40–59 | #FCE7F3 | #be185d / #F472B6 |
| D | 0–39 | #FEE2E2 | #b91c1c / #EF4444 |

### Border Radius
- Cards: 14px
- Buttons: 13px
- Chips / Pills: 50px (full round)
- Avatars: 50% (circle)

### Spacing
- Screen horizontal padding: 24px
- Card internal padding: 16px
- Section gap: 20–24px
- Element gap: 8–12px

### Components
- **Card**: white bg, 1px border (#E4E4E7), 14px radius, 16px padding
- **Surface Card**: #F4F4F5 bg, no border, 14px radius, 16px padding
- **Primary Button**: 50px height, 13px radius, #09090B bg, white text, Space Grotesk 700 14px
- **Teal Button**: 50px height, #00B894 bg, white text
- **Outline Button**: 50px height, white bg, 1.5px #E4E4E7 border, dark text
- **Chip Active**: #E8FDF8 bg, #007A64 text, 1px #CCFBF1 border
- **Chip Inactive**: #F4F4F5 bg, #71717A text, 1px #E4E4E7 border
- **Status Bar**: 56px height, Space Grotesk 700 15px "9:41" on left, icons right
- **Bottom Nav**: 80px height, 5 items, active item has darker icon + label

---

## 10. Data Model

### Existing Tables (Supabase — do not modify structure, only add columns)
```sql
-- users (managed by Supabase Auth)

-- profiles
profiles (
  id uuid PK references auth.users,
  display_name text,
  phone text,                    -- for phone+password auth
  avatar_url text,
  expo_push_token text,          -- ADD: for push notifications
  language text default 'en',
  notification_prefs jsonb,
  created_at timestamptz
)

-- family_members
family_members (
  id uuid PK,
  user_id uuid references profiles,
  name text,
  date_of_birth date,
  gender text,
  blood_type text,
  profile_photo_url text,
  height_cm numeric,             -- ADD
  weight_kg numeric,             -- ADD
  relationship text,             -- ADD: self/spouse/parent/child/sibling/other
  created_at timestamptz
)

-- documents (existing)
-- medications (existing)
-- ai_chat_conversations (existing)
-- ai_health_insights (existing)
-- emergency_info (existing)
-- timeline_entries (existing)
```

### New Tables Needed
```sql
-- medication_logs (adherence tracking)
medication_logs (
  id uuid PK,
  user_id uuid,
  medication_id uuid references medications,
  family_member_id uuid references family_members,
  scheduled_time timestamptz,
  taken_at timestamptz nullable,
  status text check (status in ('taken','missed','skipped')),
  created_at timestamptz
)

-- circle_invites
circle_invites (
  id uuid PK,
  host_user_id uuid references profiles,
  token uuid unique default gen_random_uuid(),
  expires_at timestamptz,
  used boolean default false,
  used_at timestamptz nullable,
  created_at timestamptz
)

-- circle_requests
circle_requests (
  id uuid PK,
  invite_id uuid references circle_invites,
  requester_user_id uuid references profiles,
  status text check (status in ('pending','accepted','declined')),
  resolved_at timestamptz nullable,
  created_at timestamptz
)

-- circle_connections
circle_connections (
  id uuid PK,
  user_a_id uuid references profiles,
  user_b_id uuid references profiles,
  connected_at timestamptz,
  revoked_at timestamptz nullable,
  revoked_by uuid references profiles nullable
)

-- protocol_logs (personalized protocol tracking)
protocol_logs (
  id uuid PK,
  user_id uuid,
  family_member_id uuid references family_members,
  protocol_id uuid,
  task_id text,
  completed_at timestamptz,
  notes text
)

-- health_scores (cached computed scores)
health_scores (
  id uuid PK,
  family_member_id uuid references family_members,
  score numeric check (score between 0 and 100),
  grade text check (grade in ('A','B','C','D')),
  breakdown jsonb,          -- {metabolic: 72, cardiovascular: 65, ...}
  computed_at timestamptz
)
```

### Row-Level Security
All tables above must have RLS enabled. Users can only read/write rows where `user_id = auth.uid()`. Circle connections: user can read rows where `user_a_id = auth.uid() OR user_b_id = auth.uid()`.

---

## 11. Backend & API

### Existing Edge Functions (Supabase — no changes needed)
- `ai-health-assistant` — chat with context injection
- `generate-health-insights` — cross-document analysis
- `compare-health-reports` — multi-report comparison
- `doctor-generate-insights` — doctor portal insights
- `whatsapp-webhook` — WhatsApp handler

### New Edge Functions Required
| Function | Trigger | Description |
|---|---|---|
| `generate-health-score` | On demand (family member ID) | Reads all documents for member, computes 0–100 score + grade + category breakdown using Claude |
| `check-drug-interactions` | On add medication | Takes new medication + existing meds list, returns interaction risks |
| `generate-protocol` | On demand (family member ID) | Generates a 30-day health protocol based on member's data |
| `send-push-notification` | Scheduled or triggered | Sends push via Expo Push API for reminders and alerts |
| `circle-invite-create` | On invite generation | Creates invite token, returns shareable URL |
| `circle-invite-redeem` | On link open | Validates token, creates circle_request |
| `emergency-public-page` | Public GET | Returns emergency info for a token (no auth required) |

### Auth Flow for Google Sign-In
```
1. User taps "Continue with Google"
2. @react-native-google-signin returns idToken
3. Call supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })
4. Supabase creates/retrieves user, returns session
5. Store session in SecureStore
6. Navigate to dashboard (or onboarding if new user)
```

### Deep Links
- `prakrit.ai/join/{token}` → opens S43 (Join via Link) in app
- `prakrit.ai/emergency/{token}` → public web page (no app required)
- `prakrit.ai/doctor/{code}` → opens Doctor Portal web (not in app)

---

## 12. Non-Functional Requirements

### Performance Targets
| Metric | Target |
|---|---|
| Cold start → dashboard visible | < 2s on mid-range Android (Snapdragon 680-class) |
| Tab switch | < 100ms perceived (instant) |
| List scroll (FlashList) | Consistent 60fps, no blank cells |
| API data fetch (p95) | < 1.5s |
| AI streaming first token | < 500ms |
| Image load (cached) | < 50ms (blurhash placeholder shown immediately) |
| Document upload feedback | Progress shown from 0% within 200ms of tap |

### Performance Engineering Requirements
These patterns must be followed. Non-compliance = failed PR review.

**JS Thread — keep it free**
- All animations must use `Reanimated` worklets — zero `Animated` API usage on critical paths
- No synchronous heavy computation on the JS thread — move to `runOnJS` or a background task
- `InteractionManager.runAfterInteractions` for any non-urgent work after navigation

**Lists — always FlashList**
- Every scrollable list in the app uses `FlashList` with a `estimatedItemSize` prop set
- `keyExtractor` always returns a stable string ID (never array index)
- Items that appear in lists use `React.memo` with correct dependency comparison

**Re-renders — minimise**
- All screen-level components wrapped in `React.memo`
- `useCallback` on every function passed as a prop to a list item
- `useMemo` on derived values (e.g., filtered medication list)
- TanStack Query `select` used to derive subsets — avoids re-renders when unrelated data changes
- No anonymous objects/arrays as props to memoised components

**Navigation — instant feel**
- All screens pre-load their data query on hover/press (TanStack Query `prefetchQuery`)
- Navigation transitions use Reanimated shared element transitions where applicable
- Heavy screens (Document Analysis, Health Insights) use `React.lazy` + `Suspense`

**Images — no layout shift**
- All `expo-image` instances have explicit `width` and `height` or `flex` — no dimension inference
- `placeholder` (blurhash string) set on every remote image
- Document thumbnails generated at 2× device pixel ratio, stored in Supabase Storage

**Startup performance**
- Zero blocking operations in `App.tsx` before first render
- Auth token read from MMKV (synchronous) — no async wait on startup
- Splash screen held until auth state resolved, then released — no flash of unauthenticated screen
- `expo-splash-screen` used; `SplashScreen.preventAutoHideAsync()` + `SplashScreen.hideAsync()` pattern

**Network**
- TanStack Query `staleTime: 5 * 60 * 1000` (5 min) on all data queries — no unnecessary refetches
- `gcTime: 10 * 60 * 1000` (10 min) — data stays in cache for tab switches
- Optimistic updates on: "Take" button, checkbox taps, member card edits — never wait for server before updating UI
- Retry: 3 attempts with exponential backoff on network errors

**Offline**
- Emergency card data persisted to MMKV on every fetch — readable offline with zero network
- Last-known medications and family members readable offline via TanStack Query persistence
- Offline banner shown at top of screen when `NetInfo.isConnected` is false
- Mutations queued while offline and replayed when connection restored (TanStack Query `persistQueryClient`)

### Security
- Auth tokens stored in SecureStore (iOS Keychain / Android Keystore) — never AsyncStorage
- No raw Supabase errors surfaced to users
- Biometric auth wraps SecureStore retrieval — if biometrics fail 3x, require password
- Document uploads go to Supabase Storage with signed URLs (not public)
- Circle connections: recipient can only see data explicitly shared; RLS enforces this at DB level
- Emergency public token is a UUID — not guessable; can be rotated by user

### Accessibility
- Minimum tap target: 44×44pt
- All interactive elements have `accessibilityLabel`
- Dynamic text size supported (iOS Dynamic Type / Android font scale)
- Colour is never the only indicator (always paired with text/icon)

### Internationalisation
- English (default)
- Hindi (हिंदी)
- Marathi (मराठी)
- Telugu (తెలుగు)
- Language switching in Settings applies immediately
- All AI responses in the user's selected language (pass `language` to edge function prompts)

### Crash & Error Handling
- Sentry integrated; all unhandled errors reported
- Network error: show "No connection" banner; retry button
- API error: show user-friendly message, log to Sentry
- AI timeout (> 30s): show "Taking longer than usual — still working..." message

---

## 13. Platform Requirements

### iOS
- Minimum: iOS 16.0
- Face ID / Touch ID via `expo-local-authentication`
- Push notifications via APNs (Expo handles provisioning)
- Share sheet via `expo-sharing`
- Deep links via Universal Links (requires `apple-app-site-association` on `prakrit.ai`)
- App Clip (v2): for emergency card access without installing the full app

### Android
- Minimum: Android 10 (API 29)
- **Target API: Android 14 (API 34)** — required by Play Store for all new apps as of August 2024
- Fingerprint / Face Unlock via `expo-local-authentication`
- Push notifications via FCM (Expo handles)
- Adaptive icons (foreground + background layers in `app.json`)
- Deep links via App Links (requires `assetlinks.json` on `prakrit.ai`)
- `SCHEDULE_EXACT_ALARM` permission required for precise medication reminders on Android 12+ — user must grant manually from Settings; app must handle gracefully if denied

---

## 13b. Play Store Compliance

Health apps are heavily scrutinised by Google Play. The following requirements must be met before submission. A missed item = rejection + 3–7 day review delay.

### Target API Level
- Must target API 34 (Android 14) — hard requirement since August 2024
- Set in `app.json`: `"targetSdkVersion": 34`
- Must also compile against API 34: `"compileSdkVersion": 34`

### App Bundle Format
- Submit as `.aab` (Android App Bundle) — NOT `.apk`
- EAS Build produces `.aab` by default for production builds
- Enable Play App Signing (Google manages the release key)

### Data Safety Section (Play Store Console)
This is the #1 rejection reason for health apps. Must be filled out accurately.

| Data Type | Collected? | Shared? | Can user request deletion? |
|---|---|---|---|
| Health and fitness info (medical records, medications, conditions) | Yes | No (not shared with third parties) | Yes |
| Personal info (name, DOB, phone) | Yes | No | Yes |
| App activity (feature usage, session length) | Yes (analytics) | No | Yes |
| Device identifiers (push token) | Yes | No | Yes |
| Photos / videos (uploaded documents) | Yes | No | Yes |
| Voice / audio (voice mode recordings) | Yes (processed, not stored) | No | N/A |

- All health data is collected for "App functionality" only — not for "Analytics" or "Developer communications"
- "Data is encrypted in transit" → Yes (HTTPS / Supabase TLS)
- "User can request data deletion" → Yes — must be true and functional (Settings → Delete Account)

### Privacy Policy
- Must be publicly accessible at a URL (e.g., `prakrit.ai/privacy`)
- Must specifically mention: what health data is collected, how it is used, how it is protected, how to delete it
- Must be linked from both the Play Store listing AND within the app (Settings screen)
- Must mention AI processing of health data

### Sensitive Permissions — Justification Required
Each permission needs a clear in-app rationale shown before the system prompt:

| Permission | When requested | Rationale shown to user |
|---|---|---|
| `CAMERA` | First time user taps "Upload via Camera" | "To photograph your medical documents for AI analysis" |
| `RECORD_AUDIO` | First time user taps Voice Mode mic | "To record your voice for the health assistant" |
| `POST_NOTIFICATIONS` | After first medication is added | "To send you medication reminders at the right time" |
| `USE_BIOMETRIC` | After first successful login | "To let you log in faster with your fingerprint or face" |
| `SCHEDULE_EXACT_ALARM` | When first medication reminder is set | "To deliver your medication reminders at the exact scheduled time" — redirect to system settings |

**Critical rules:**
- App must function correctly if ANY permission is denied — no crashes, no blank screens
- Never request a permission before the user understands why they need it
- Never request permissions on app launch / splash screen
- Camera permission denied → show "Enable camera in Settings" message with a deep link to app settings
- Notification permission denied → reminders silently disabled with a visible in-app banner

### Medical Disclaimer — Required
AI-generated content in the app (health scores, AI chat responses, insights, document analysis) must display a disclaimer. Non-compliance risks rejection under Play's "misleading health claims" policy.

**Implementation:**
- First time a user sees AI-generated health content: show a one-time modal with the disclaimer and "I understand" button
- In the AI chat interface: persistent small-text disclaimer at top: *"Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment."*
- AI edge function prompts must include instruction to avoid definitive medical diagnoses
- Health Score must be labelled as "AI-estimated" — not "medical diagnosis"

### Content Rating
- Complete the Play Store content rating questionnaire
- Select "Health & Fitness" category
- Answer "No" to: violence, sexual content, controlled substances, gambling
- Answer "Yes" to: app collects personal information (health data)
- Expected rating: **Everyone** (PEGI 3 / Everyone)

### No Misleading Metadata
- App name: "Prakrit AI — Family Health" (or similar descriptive name)
- Short description and full description must accurately represent features
- Screenshots must match actual app UI (Clinical mockup screenshots are acceptable)
- No claims like "Diagnose your illness" or "Replace your doctor"
- Acceptable: "Understand your health reports", "Track family medications", "AI health assistant"

### Billing — Google Play Billing API
- If the app offers paid plans (Pro / Family), all in-app purchases on Android **must** go through Google Play Billing API
- Do NOT accept Razorpay or Stripe for in-app upgrades on Android — this is a hard rejection reason
- Workaround for v1: do not implement in-app upgrade flow; redirect to `prakrit.ai/upgrade` (web purchase) — this is allowed as long as the app doesn't mention the price or a direct upgrade button inside the app
- v2: implement `react-native-purchases` (RevenueCat) for cross-platform subscriptions via Play Billing + App Store

### Network Security
- All API calls must use HTTPS — no HTTP endpoints
- Add `android:usesCleartextTraffic="false"` in AndroidManifest (Expo sets this by default in production builds)
- Certificate pinning not required for v1 but recommended for v2

### 64-bit Requirement
- All native code must support 64-bit — Expo + EAS Build handles this automatically
- Do not include any 32-bit-only native library

### App Size
- Play Store recommends < 150MB initial download
- EAS Build with Hermes + ProGuard keeps Expo apps typically under 30–50MB
- Large assets (fonts, images) should be fetched remotely, not bundled

### Pre-launch Report
After first submission, Play Console runs an automated pre-launch report on Firebase Test Lab devices. Common failures to pre-fix:
- App crashes on launch on low-RAM devices (< 2GB) — test on Android Go edition emulator
- Accessibility failures — all interactive elements need `accessibilityLabel`
- ANR (App Not Responding) — no blocking operations on the main thread
- Broken permission flows — test with all permissions denied

### Pre-Submission Checklist
- [ ] Target SDK = 34
- [ ] App Bundle (.aab) uploaded, not .apk
- [ ] Data Safety section fully and accurately completed
- [ ] Privacy policy URL set in Play Console and accessible from within app
- [ ] Medical disclaimer shown before first AI content
- [ ] All permissions requested only when needed, denied gracefully
- [ ] Content rating questionnaire completed
- [ ] App description contains no medical claims
- [ ] No in-app payment screen (redirect to web for v1)
- [ ] `SCHEDULE_EXACT_ALARM` handled gracefully if denied
- [ ] Tested on Android 10, 12, and 14 (emulator or device)
- [ ] Tested with all permissions denied
- [ ] Tested with no internet connection (offline emergency card works)
- [ ] Sentry integrated and reporting test error
- [ ] Crash-free session rate ≥ 99% on internal testing track before promoting to production

---

## 14. Out of Scope — v1

The following are explicitly deferred to v2 or later:

| Feature | Reason |
|---|---|
| Apple Health / Google Fit sync | Complex integration; not core to v1 value prop |
| WhatsApp bot (mobile-side management) | Web-based; existing implementation sufficient |
| Wearables integration (smartwatch) | Requires separate SDK work |
| In-app billing / payment (Razorpay) | Membership managed via web for v1 |
| Doctor Portal in app | Doctor-facing; low mobile usage expected |
| Lock screen / Home screen widget | Explore after v1 launch |
| App Clip (iOS) | Emergency card shortcut — v2 |
| Multi-language voice (TTS) | Hindi/Marathi TTS — v2 |
| PDF export of health summary | v2 |
| Offline AI (on-device model) | Not feasible on current models |

---

## 15. Screen Inventory

All 44 screens from the Clinical Mockup (`Prakrit_AI_Clinical_Mobile.html`) map directly to app screens:

| Screen ID | Label | Section |
|---|---|---|
| S01 | Splash 1 — Wordmark | Onboarding |
| S35 | Splash 2 — AI Reports | Onboarding |
| S36 | Splash 3 — Family Hub | Onboarding |
| S38 | Splash 4 — Medication Reminders | Onboarding |
| S39 | Splash 5 — Emergency Hub | Onboarding |
| S40 | Splash 6 — Prakrit Voice | Onboarding |
| S02 | Onboarding Hero | Onboarding |
| S03 | Login / Sign-Up | Auth |
| S37 | Profile Setup — Height & Weight | Onboarding |
| S04 | Home Dashboard | Dashboard |
| S32 | Empty Dashboard | Dashboard |
| S05 | Health Score | Health Score |
| S06 | Biomarker Categories | Health Score |
| S07 | Metabolic Category | Health Score |
| S08 | HbA1c Detail | Health Score |
| S09 | Documents Library | Documents |
| S10 | Upload Document | Documents |
| S11 | Document Viewer | Documents |
| S30 | Full Document Analysis | Documents |
| S12 | AI Chat | AI Assistant |
| S13 | Voice Listening | AI Assistant |
| S31 | Voice Response | AI Assistant |
| S14 | Action Protocol | AI Assistant |
| S15 | Family Hub | Family |
| S16 | Member: Ramesh | Family |
| S17 | Critical Alert | Family |
| S41 | Family Circle Hub | Family Circle |
| S42 | Send Invite | Family Circle |
| S43 | Join via Link (Recipient) | Family Circle |
| S44 | Manage Requests | Family Circle |
| S45 | Linked Family View | Family Circle |
| S18 | Medications List | Medications |
| S19 | Medication Detail | Medications |
| S33 | Add Medication | Medications |
| S20 | Health Timeline | Timeline |
| S21 | Health Insights | Insights |
| S22 | Emergency Card | Emergency |
| S23 | Doctor Network | Doctors |
| S28 | Doctor Profile | Doctors |
| S29 | Personalized Protocol | Protocol |
| S34 | Share Report | Sharing |
| S24 | Profile & Settings | Settings |
| S25 | Membership | Settings |
| S26 | Lock Screen | Auth |

---

*Prakrit AI Mobile PRD v1.0 — July 2026*  
*Reference mockup: `docs/product/Prakrit_AI_Clinical_Mobile.html` (44 screens)*  
*Existing web app: `prakrit.ai` — Supabase backend reused as-is*
