# PrakritAI — Claude Code Instructions

## Project Identity
- **Product name**: PrakritAI
- **Brand URL**: prakrit.ai
- **Tagline**: Your family's health intelligence — records, reminders, and answers, in one place
- **Type**: Family health management app — AI-powered document analysis, medication tracking, health assistant
- **Users**: 89k+ on the old web app (migrating); target market is Indian families managing health for multiple members

## Repository Structure (Monorepo)
```
prakritai/
├── CLAUDE.md                        ← you are here
├── apps/
│   ├── mobile/                      ← React Native + Expo app (primary build)
│   └── web/                         ← Web companion (Next.js — doctor portal, emergency page, landing)
├── packages/
│   └── shared/                      ← Shared TypeScript types, Supabase client, constants
└── docs/
    ├── product/PRD.md               ← Full mobile PRD — read this for feature specs
    ├── design/mockups/Screens-Clinical-44.html  ← 44-screen visual mockup
    ├── setup/                       ← Supabase schema, setup guides
    └── architecture/                ← Tech decisions
```

**Always check `docs/product/PRD.md` before building any feature.** It contains screen references, acceptance criteria, data model, and edge function specs.

---

## Tech Stack — Mobile (`apps/mobile`)

| Layer | Library | Version |
|---|---|---|
| Framework | Expo | SDK 52+ |
| Language | TypeScript | 5.x |
| Navigation | Expo Router | v4 (file-based) |
| State/Data | TanStack Query | v5 |
| Animations | React Native Reanimated | v3 |
| Gestures | React Native Gesture Handler | v2 |
| Lists | FlashList (Shopify) | latest |
| Charts | React Native Skia + Victory Native XL | latest |
| Images | expo-image | latest |
| Storage (KV) | react-native-mmkv | latest |
| Secure storage | expo-secure-store | latest |
| Styling | NativeWind v4 (Tailwind for RN) | latest |
| Auth | Supabase Auth + @react-native-google-signin/google-signin | latest |
| Backend | Supabase JS client (@supabase/supabase-js) | v2 |
| Push notifications | expo-notifications | latest |
| Camera/Files | expo-camera, expo-image-picker, expo-document-picker | latest |
| Bottom sheets | @gorhom/bottom-sheet | v5 |
| Error monitoring | @sentry/react-native | latest |
| Build/Deploy | EAS Build + EAS Submit | latest |

## Tech Stack — Web (`apps/web`)
| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Backend | Same Supabase project as mobile |
| Deploy | Vercel |

## Shared Package (`packages/shared`)
All of these live here — never duplicate across apps:
- Supabase client factory
- TypeScript types (generated from Supabase schema)
- Design tokens (colours, spacing, typography as constants)
- Shared utility functions (BMI calculation, date formatting, grade calculation)
- API query functions (TanStack Query query/mutation factories)

---

## Mandatory Performance Rules
**These are non-negotiable. Violation = rewrite.**

1. **Never use `FlatList`** — always `FlashList` with `estimatedItemSize` set
2. **Never use the `Animated` API** — always `React Native Reanimated 3` worklets
3. **Never use `AsyncStorage`** for non-secure data — use `react-native-mmkv`
4. **Never use `AsyncStorage`** for auth tokens — use `expo-secure-store`
5. **Never use `<Image>` from React Native** — always `expo-image` with `placeholder` (blurhash)
6. **Always `React.memo`** on list item components
7. **Always `useCallback`** on functions passed as props to memoised components
8. **No anonymous object/array literals as props** to memoised components
9. **New Architecture must be enabled** — `"newArchEnabled": true` in app.json
10. **Hermes engine** — `"jsEngine": "hermes"` in app.json

---

## Mandatory Play Store Compliance Rules

1. **Medical disclaimer** must appear on all AI-generated content: *"Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment."*
2. **Never show raw Supabase errors** to users — always map to user-friendly messages
3. **All permissions requested contextually** — never on app launch
4. **App must not crash** if any permission is denied — handle gracefully with fallback UI
5. **No in-app payment UI on Android** — redirect to `prakrit.ai/upgrade` for subscriptions
6. **Target SDK 34** (Android 14)

---

## Design System

### Colours
```typescript
// Use these exact values — defined in packages/shared/tokens.ts
export const colors = {
  bg: '#FAFAFA',
  surface: '#F4F4F5',
  border: '#E4E4E7',
  text: '#09090B',
  textSecondary: '#71717A',
  textTertiary: '#A1A1AA',
  teal: '#00B894',
  tealLight: '#CCFBF1',
  tealLighter: '#E8FDF8',
  yellow: '#D4A017',
  yellowLight: '#FEF3C7',
  rose: '#F472B6',
  roseLight: '#FCE7F3',
  red: '#EF4444',
  redLight: '#FEE2E2',
  white: '#FFFFFF',
  black: '#000000',
}
```

### Typography
- **Headings / Display**: Space Grotesk (weights 400–800)
- **Body / Labels**: Inter (weights 400–600)

### Grade Badges (Health Score)
| Grade | Score | Background | Text colour |
|---|---|---|---|
| A | 80–100 | `#CCFBF1` | `#00725E` |
| B | 60–79 | `#FEF3C7` | `#8a5e0a` |
| C | 40–59 | `#FCE7F3` | `#be185d` |
| D | 0–39 | `#FEE2E2` | `#b91c1c` |

### Spacing & Radius
```typescript
export const spacing = { screenH: 24, card: 16, section: 20, gap: 8, gapMd: 12 }
export const radius = { card: 14, button: 13, chip: 50, avatar: 999 }
```

### Key Components
- **Primary button**: height 50, radius 13, bg `#09090B`, white text, Space Grotesk 700 14px
- **Teal button**: height 50, bg `#00B894`, white text
- **Card**: white bg, 1px `#E4E4E7` border, radius 14, padding 16
- **Bottom nav**: height 80, 5 tabs, active tab = darker icon + label

---

## Authentication
- **Primary**: Google Sign-In (`@react-native-google-signin/google-signin` + `supabase.auth.signInWithIdToken`)
- **Secondary**: Phone number + Password (phone stored in `profiles.phone`; Supabase email/password auth)
- **Tertiary**: Email + Password (collapsed under "Other options")
- **NO OTP anywhere** — not for sign-in, not for verification
- **Biometric**: available after first login via `expo-local-authentication`
- Session stored in `expo-secure-store` — never AsyncStorage

---

## Supabase
- Project: new (see `docs/setup/Supabase-Schema.sql` for full schema)
- Auth: Email/password + Google OAuth enabled
- RLS: enabled on ALL tables — users can only read/write their own data
- Edge functions: see `docs/product/PRD.md` section 11 for the full list of functions to build
- Types: generate with `supabase gen types typescript` → output to `packages/shared/types/supabase.ts`

---

## Sample Data (use in tests and dev seeds)
```typescript
// Family: Priya Sharma (account holder)
const PRIYA = { name: 'Priya Sharma', age: 34, gender: 'Female', bloodType: 'B+', heightCm: 163, weightKg: 62 }
// BMI: 23.3 → Normal

const RAMESH = { name: 'Ramesh Sharma', age: 45, gender: 'Male', bloodType: 'O+', heightCm: 172, weightKg: 88,
  conditions: ['Type 2 Diabetes', 'Hypertension'],
  medications: ['Metformin 500mg', 'Telmisartan 40mg'],
  hba1c: 7.2 }  // Grade C (Diabetic range)

const MEERA = { name: 'Meera Devi', age: 70, gender: 'Female', bloodType: 'A+',
  conditions: ['Hypertension'], medications: ['Amlodipine 5mg'] }

const RIYA = { name: 'Riya Sharma', age: 8, gender: 'Female', bloodType: 'B+' }

// Doctor
const DR_ANJALI = { name: 'Dr. Anjali Mehta', specialty: 'General Physician', hospital: 'Apollo Hospital' }
```

---

## Key Screens → File Mapping (mobile app)
Reference `docs/design/mockups/Screens-Clinical-44.html` for visual reference on all screens.

| Mockup ID | Screen | Route |
|---|---|---|
| S01–S40 | Splash + Onboarding | `/(onboarding)/` |
| S03 | Login / Sign-up | `/(auth)/sign-in` |
| S04 | Dashboard | `/(tabs)/` |
| S05–S08 | Health Score | `/(tabs)/score/[memberId]` |
| S09–S11, S30 | Documents | `/(tabs)/documents/` |
| S12–S13, S31 | AI Assistant | `/(tabs)/ai/` |
| S15–S17 | Family Hub | `/(tabs)/family/` |
| S41–S45 | Family Circle | `/(tabs)/family/circle` |
| S18–S19, S33 | Medications | `/(tabs)/medications/` |
| S20 | Timeline | `/(more)/timeline` |
| S21 | Health Insights | `/(more)/insights` |
| S22 | Emergency Card | `/(more)/emergency` |
| S23–S28 | Doctor Network | `/(more)/doctors` |
| S29 | Personalized Protocol | `/(more)/protocol` |
| S24–S26 | Settings | `/(more)/settings` |

---

## Edge Functions to Build (Supabase)
See `docs/product/PRD.md` section 11 for full specs.

| Function name | Purpose |
|---|---|
| `ai-health-assistant` | Chat with family member context |
| `generate-health-insights` | Cross-document trend analysis |
| `generate-health-score` | 0–100 score + grade + category breakdown |
| `check-drug-interactions` | Medication safety check |
| `generate-protocol` | 30-day health protocol |
| `compare-health-reports` | Multi-report comparison |
| `send-push-notification` | Expo Push API trigger |
| `circle-invite-create` | Generate invite token |
| `circle-invite-redeem` | Validate token + create request |
| `emergency-public-page` | Public emergency info (no auth) |
| `whatsapp-webhook` | Twilio WhatsApp handler |

---

## Environment Variables
See `docs/setup/Setup-Guide.md` for how to get each value.
```
# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=
SENTRY_DSN=

# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
