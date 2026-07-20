# Prakrit.ai × Apollo 247 — Integration Master Plan

**Document Type:** Strategic Partnership & Technical Integration Plan  
**Prepared by:** Prakrit.ai / Digital5  
**Date:** April 2026  
**Classification:** Confidential

---

## Table of Contents

1. [Integration Philosophy](#1-integration-philosophy)
2. [Feature Integration Map](#2-feature-integration-map)
   - [Lab Reports → AI Document Analysis](#21-lab-reports--ai-document-analysis)
   - [Doctor Prescriptions → Medication Tracking](#22-doctor-prescriptions--medication-tracking)
   - [Apollo Circle → Family Health Profiles](#23-apollo-circle--family-health-profiles)
   - [Post-Consultation → AI Health Assistant](#24-post-consultation--ai-health-assistant)
   - [Apollo Diagnostics → Health Timeline](#25-apollo-diagnostics--health-timeline)
   - [Chronic Disease Programs → Health Insights Engine](#26-chronic-disease-programs--health-insights-engine)
   - [MomVerse → Maternal Health Tracking](#27-momverse--maternal-health-tracking)
   - [Emergency Info → Apollo Hospital Network](#28-emergency-info--apollo-hospital-network)
   - [Ask Apollo → PrakritGPT Upgrade](#29-ask-apollo--prakritgpt-upgrade)
3. [Integration Architecture](#3-integration-architecture)
4. [UI Placement in Apollo App](#4-ui-placement-in-apollo-app)
5. [Phased Rollout Plan](#5-phased-rollout-plan)

---

## 1. Integration Philosophy

Apollo 247 owns the **healthcare transactions** — consultations, diagnostics, pharmacy. That's a strong foundation. But there's a gap: patients use Apollo when something goes wrong, then disappear until the next problem. The 98% of time they're at home, unengaged, managing (or mismanaging) their health on their own — Apollo has no presence there.

That's exactly where Prakrit lives.

The integration creates a **closed engagement loop**:

> Apollo triggers a health event → Prakrit engages the patient continuously → Prakrit drives the patient back to Apollo services → Apollo generates revenue

Every Prakrit feature inside Apollo is designed to do one of two things:

- **Generate more Apollo revenue** — more pharmacy orders, consultations, and diagnostic bookings
- **Build deeper Apollo retention** — Circle membership stickiness, daily engagement, and data lock-in that makes switching genuinely costly

---

## 2. Feature Integration Map

### 2.1 Lab Reports → AI Document Analysis

**Apollo touchpoint:** `My Orders → View Report` (post-report delivery screen)

#### Where things stand today
A patient gets a PDF lab report. Apollo's Smart Reports add some basic flagging of abnormal values, which is useful — but then it stops. The patient stares at numbers they don't understand and, more often than not, does nothing about it.

#### What Prakrit adds
- Every lab report delivered by Apollo Diagnostics automatically runs through Prakrit's `analyze-medical-document` engine
- Prakrit produces a plain-language explanation: what each value means, what's normal vs. abnormal, and what to do next
- A **"Your Report Explained"** card appears directly below the report in Apollo's UI — no extra steps, no separate app
- If values are abnormal, a **"Book a follow-up consult"** CTA surfaces automatically
- The report is saved to the patient's Prakrit health timeline and family profile for future reference

#### Why this matters for Apollo
- One of the biggest drivers of non-compliance is patients not knowing what their results mean. This removes that barrier entirely.
- It turns a passive report delivery moment into an active consultation-booking trigger
- Patients who previously ignored their results now have a clear next step — and that next step lives inside Apollo

---

### 2.2 Doctor Prescriptions → Medication Tracking

**Apollo touchpoint:** `Post-Consultation → Your Prescription → Buy Medicines`

#### Where things stand today
A patient sees their prescription, buys from Apollo Pharmacy, and that's where Apollo's visibility ends. No adherence monitoring, no refill reminder, no way to know if the patient is actually taking what was prescribed. The loop is completely broken after that first purchase.

#### What Prakrit adds
- Prakrit parses the prescription — extracting medicine names, dosages, frequencies, and duration
- Each medicine is automatically imported into the patient's **Prakrit Medication Tracker** without them doing anything
- Daily and weekly adherence reminders go out via push notification
- When a medication is running low (calculated from dosage × quantity × start date), Prakrit sends a **refill reminder that deep-links directly into Apollo Pharmacy**
- If a patient misses three or more consecutive doses, Prakrit surfaces: *"Having side effects? Talk to your doctor"* — which routes to a new consultation booking

#### Why this matters for Apollo
- Every refill reminder is a direct pharmacy transaction
- Every side-effect flag is a new consultation booking
- This directly addresses the massive patient non-compliance problem — and turns it from a lost revenue issue into a revenue-generating loop

---

### 2.3 Apollo Circle → Family Health Profiles

**Apollo touchpoint:** `Apollo Circle Dashboard`

#### Where things stand today
Circle is a discount and priority access program. Family coverage is treated as a billing unit, not a health management unit. Members churn when they feel the discounts aren't worth the subscription fee — which happens, because discounts are a weak retention mechanic.

#### What Prakrit adds
- Every Circle member gets a **Prakrit Family Health Hub** as a core Circle benefit — not an add-on, but built into the dashboard
- Each family member added to a Circle account gets their own Prakrit profile: health history, medications, documents, and timeline
- The Circle dashboard transforms from a discount tracker into a **Family Health Dashboard**, showing:
  - Health scores per family member
  - Active medications and compliance status
  - Upcoming test reminders
  - Last consultation summaries
- Members can't leave Circle without losing their entire family health history — that's genuine data stickiness, not just discount lock-in

#### Why this matters for Apollo
- This goes after the 15–20% Circle churn that's a known problem
- Turning Circle from a discount program (low switching cost) into a health management platform (high switching cost) is a fundamentally better retention strategy
- The health data is the moat

---

### 2.4 Post-Consultation → AI Health Assistant

**Apollo touchpoint:** `Post-Consultation Screen` (currently a dead end after summary delivery)

#### Where things stand today
The patient gets a consultation summary and maybe a prescription. Then the engagement ends — completely. There's no mechanism to maintain any kind of patient-doctor relationship between visits. Apollo only sees the patient again when something goes wrong.

#### What Prakrit adds
- Right after consultation, Prakrit's **AI Health Assistant** activates with full context from what the doctor just said
- It opens naturally: *"Dr. Sharma recommended reducing sodium and walking 30 minutes daily. Want me to help you track this?"*
- Between consultations, it checks in proactively: *"It's been 2 weeks since your blood pressure check — how are you feeling?"*
- If a patient describes worsening symptoms, it triages and surfaces a **"Book Consult"** button
- Voice mode (powered by OpenAI Realtime API) makes hands-free health check-ins possible — especially useful for elderly users who find typing cumbersome

#### Why this matters for Apollo
- A one-time consultation becomes an ongoing managed relationship
- Every triage that escalates to a consult recommendation generates consultation revenue
- Continuous engagement between visits is one of the most effective levers against Circle churn

---

### 2.5 Apollo Diagnostics → Health Timeline

**Apollo touchpoint:** `Lab Test Booking → Sample Collection → Report Delivery` (full diagnostic journey)

#### Where things stand today
Each test lives in isolation inside "My Orders." There's no longitudinal view, no trend analysis, and nothing that prompts a patient to book a follow-up or repeat test. Every test result is an island.

#### What Prakrit adds
- Every Apollo Diagnostics test automatically creates an entry in the patient's **Prakrit Health Timeline**
- The timeline shows the full health story in chronological order: consultations, tests, prescriptions, diagnoses — everything together
- Prakrit's **Health Insights engine** spots trends across multiple tests: *"Your HbA1c has improved from 8.2 to 7.1 over 6 months — here's what changed"*
- The timeline surfaces **proactive booking prompts**: *"Your last lipid panel was 8 months ago. Apollo recommends an annual check. Book now?"*

#### Why this matters for Apollo
- Proactive test reminders generate incremental diagnostic bookings without any sales motion
- A longitudinal health view gives patients a compelling reason to keep all their health activity inside Apollo rather than spreading it across competitors

---

### 2.6 Chronic Disease Programs → Health Insights Engine

**Apollo touchpoint:** `Apollo ProHealth Program` and `Apollo Diabetes Reversal` dashboards

#### Where things stand today
ProHealth and Diabetes Reversal are program-led with human health instructors. Good structure — but there's no continuous monitoring between sessions. A patient's daily health data between appointments simply isn't captured or acted on.

#### What Prakrit adds
- Prakrit becomes the **daily companion** for patients in chronic disease programs — filling the gap between instructor sessions
- Patients upload all program-related documents: reports, prescriptions, dietary logs
- Prakrit's trend analysis tracks glucose levels, weight, HbA1c, and other markers across everything that's been uploaded
- The AI keeps patients accountable between sessions: *"You have a ProHealth check-in on Thursday. Your last 3 glucose readings have been elevated. Here's what to tell your instructor."*
- Instructors get a Prakrit-generated health summary before each session — they walk in prepared, not catching up

#### Why this matters for Apollo
- Higher program completion rates translate directly to better outcomes and stronger marketing data
- Reducing the prep burden on instructors improves the instructor-to-patient ratio economics
- ProHealth and Diabetes Reversal become AI-powered premium programs — a real differentiator against competitors

---

### 2.7 MomVerse → Maternal Health Tracking

**Apollo touchpoint:** `MomVerse Hub` (currently a content library organised by trimester)

#### Where things stand today
MomVerse is an excellent content resource — articles, guides, and information organised by pregnancy stage. But it's entirely informational. There's no personalisation, no document management, and no active tracking for the individual patient's actual pregnancy.

#### What Prakrit adds
- MomVerse gains a **"My Pregnancy Journey"** layer powered by Prakrit
- The mother uploads scan reports, blood work, and ultrasounds — Prakrit explains each one in plain language
- Trimester-specific medication tracking covers prenatal vitamins, iron supplements, and prescribed medications
- The health timeline tracks the entire pregnancy from first visit to delivery — every consultation, every test, every milestone in one place
- Post-delivery: the newborn gets added as a new family member profile with a vaccination schedule
- The AI assistant is available 24/7 for pregnancy-specific questions

#### Why this matters for Apollo
- MomVerse becomes one of the stickiest products in the Apollo ecosystem — 9 months of near-daily engagement with a single user
- A pregnancy creates a family health profile that persists for years after delivery, locking the whole family into the Apollo ecosystem long-term

---

### 2.8 Emergency Info → Apollo Hospital Network

**Apollo touchpoint:** `Hospital Finder` and `Apollo Emergency Services`

#### Where things stand today
The hospital finder helps patients locate the nearest Apollo facility. It's useful — but entirely location-based. When a patient arrives at an Apollo hospital in an emergency, they bring no structured health history with them. The treating team starts from scratch.

#### What Prakrit adds
- Prakrit's **Emergency Module** — blood type, allergies, emergency contacts, critical medications — generates a **shareable Emergency Health Card with a QR code**
- Any Apollo hospital or clinic can scan the code and instantly see the patient's critical health data
- Emergency contacts can be called directly from the Prakrit SOS button
- The treating Apollo doctor sees allergies and current medications before the consultation even begins

#### Why this matters for Apollo
- This makes Apollo hospitals smarter, data-connected emergency destinations — a real differentiation point
- It gives patients a compelling reason to keep their Prakrit profile current — and therefore keep their Apollo relationship active as their primary health record

---

### 2.9 Ask Apollo → PrakritGPT Upgrade

**Apollo touchpoint:** `Ask Apollo Q&A Section`

#### Where things stand today
Ask Apollo is a Q&A platform with expert-written answers. It's helpful as a reference, but it's static — not conversational, not personalised, and completely disconnected from the patient's own health data. Every user gets the same generic answer.

#### What Prakrit adds
- PrakritGPT replaces or augments Ask Apollo with a **conversational, document-aware AI**
- Patients can upload a report and ask: *"What does this mean for me?"* — and get an answer that's informed by their own health history, not just a generic article
- Conversation history is maintained across sessions — the AI knows the patient's context and builds on it each time
- When the AI detects a question that genuinely needs clinical judgement, it surfaces: **"Get a real doctor's opinion — Consult Now"**

#### Why this matters for Apollo
- Session depth and engagement on Ask Apollo increase substantially when the experience is personalised and conversational
- Every question that escalates to a real consultation generates consultation revenue
- This positions Apollo as the most intelligent health Q&A platform in the Indian market

---

## 3. Integration Architecture

### System Overview

```
Apollo 247 Backend
        │
        ├── Lab Reports API ──────────────► Prakrit: analyze-medical-document
        ├── Prescription API ─────────────► Prakrit: medication tracker + reminders
        ├── Consultation Summary API ─────► Prakrit: AI Health Assistant context
        ├── Circle Membership API ────────► Prakrit: family profile creation & sync
        └── Patient Profile API ──────────► Prakrit: health timeline sync
                                                    │
                                                    ▼
                                    ┌─── Prakrit Intelligence Layer ───┐
                                    │  Edge Functions + Claude AI       │
                                    │  Document Analysis                │
                                    │  Medication Engine                │
                                    │  Health Insights                  │
                                    │  AI Health Assistant              │
                                    └──────────────┬────────────────────┘
                                                   │
                               ┌───────────────────┼────────────────────┐
                               ▼                   ▼                    ▼
                       Push Notifications      Deep Links          Apollo APIs
                       (med reminders,      (Pharmacy,           (book consult,
                        test reminders,      Consult,              book test,
                        check-ins,           Lab Tests)            refill order)
                        alerts)
```

### Required API Touchpoints from Apollo

| # | API / Webhook | Trigger | Prakrit Action |
|---|---|---|---|
| 1 | Report delivery webhook | Lab report made available in My Orders | Trigger document analysis, populate timeline |
| 2 | Prescription data on consultation close | Doctor ends consultation with prescription | Import medications, start tracking |
| 3 | Circle member roster sync | New member added or membership renewed | Create / update family profiles |
| 4 | Patient profile read | On Prakrit session start | Populate health timeline and history |
| 5 | Deep-link spec | Prakrit generates CTA | Route user to Pharmacy, Consult, or Lab booking |
| 6 | Push notification pass-through | Prakrit adherence or reminder event | Deliver notification via Apollo's notification infrastructure |

### Data Flow Principles

- All patient health data stays within the Apollo + Prakrit secure infrastructure
- Prakrit works as a **processing and engagement layer** — not a separate data silo that competes with Apollo
- No patient data is shared with third parties without explicit consent
- All API communication uses token-based authentication with session-scoped access

---

## 4. UI Placement in Apollo App

| Apollo Screen | Prakrit Integration Point | Placement |
|---|---|---|
| Home Dashboard | Family Health Summary card | Persistent card below main nav |
| Post-Consultation | "Track Your Recovery" AI assistant activation | Full-width CTA below prescription |
| Lab Report View | "Your Report Explained" panel | Below the PDF viewer |
| Prescription Screen | "Track These Medicines" one-tap import | Below the prescription items |
| Circle Dashboard | "Family Health" tab | New tab alongside Benefits and Usage |
| MomVerse Home | "My Pregnancy" active tracking section | Top of MomVerse screen |
| Ask Apollo | PrakritGPT conversational interface | Replaces existing Q&A entry point |
| Hospital Finder | Emergency Health Card + QR code | Persistent card in patient profile |
| Chronic Program Dashboard | Daily AI companion check-in | Pinned widget on program home |

---

## 5. Phased Rollout Plan

### Phase 1 — Soft Launch (Months 1–3)

**Scope:** 100,000 Apollo Circle beta users

**Features going live:**
- Lab report → Prakrit AI analysis with plain-language explanation
- Prescription → medication tracker automatic import
- Post-consultation AI Health Assistant activation
- Basic health timeline populated from Apollo diagnostic data

**What success looks like:**
- Active engagement rate: 5% → 8%+
- Lab report follow-up consultation rate vs. control group
- Medication tracker daily active usage
- Beta user NPS score

**Gate to Phase 2:** Engagement metrics validated, integration stable, user feedback incorporated

---

### Phase 2 — Full Integration (Months 4–9)

**Scope:** All 10 million Apollo Circle members

**Features going live:**
- Circle Dashboard → Family Health Hub transformation
- Full health timeline across all Apollo touchpoints
- Proactive test reminders and pharmacy refill deep-link loop
- Health Insights engine — comparative analysis across reports
- MomVerse active tracking layer

**What success looks like:**
- Active engagement rate: 8% → 10%+
- Circle membership churn reduction: 15–20%
- Medication adherence improvement: 30–40%
- Pharmacy refill orders attributed to Prakrit reminders
- Incremental consultation bookings from AI assistant CTAs

---

### Phase 3 — Ecosystem Expansion (Months 10–12)

**Scope:** Full Apollo user base + external partnerships

**Features going live:**
- PrakritGPT upgrade to Ask Apollo
- Emergency Health Card at Apollo hospitals
- ProHealth and Diabetes Reversal AI companion integration
- B2B: corporate wellness program partnerships
- B2B: health insurance integrations (Care Health, Niva Bupa, Star Health, ICICI Lombard)
- International expansion planning

**What success looks like:**
- Premium feature adoption: 5% → 15%
- B2B partnership revenue activated
- Year 1 total revenue target: ₹57.5 Crore

---

*Document prepared by Prakrit.ai in partnership with Digital5 — Confidential — April 2026*
