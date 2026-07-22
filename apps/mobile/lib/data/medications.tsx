import { createContext, useContext, useState, ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Dose {
  id: string;          // unique: `${medId}-${time}` e.g. "metformin-morning"
  medId: string;
  time: 'morning' | 'evening';
  label: string;       // "Morning dose · 8:00 AM"
  note: string;        // "Taken with breakfast" / "Due in 5 hours"
  taken: boolean;
}

export interface Medication {
  id: string;
  name: string;
  member: string;
  sub: string;          // "Ramesh · twice daily · with food"
  dose: string;
  frequency: string;
  takeWith: string;
  started: string;
  adherence: number;    // 0–100
  missedDoses: number;
  aiNote: string;
  doses: Dose[];
}

// ─── Static data ───────────────────────────────────────────────────────────────
export const MEDICATIONS: Medication[] = [
  {
    id: 'metformin',
    name: 'Metformin 500mg',
    member: 'Ramesh Sharma',
    sub: 'Ramesh · twice daily · with food',
    dose: '500 mg',
    frequency: 'Twice daily',
    takeWith: 'Food',
    started: 'Jan 2025',
    adherence: 86,
    missedDoses: 4,
    aiNote: 'Metformin adherence at 86% is good. HbA1c has improved 0.6% since starting consistently. Missing evening doses tends to spike next-morning glucose — try setting a reminder.',
    doses: [
      { id: 'metformin-morning', medId: 'metformin', time: 'morning', label: 'Morning dose · 8:00 AM', note: 'Taken with breakfast', taken: true },
      { id: 'metformin-evening', medId: 'metformin', time: 'evening', label: 'Evening dose · 8:00 PM', note: 'Due in 5 hours',       taken: false },
    ],
  },
  {
    id: 'telmisartan-meera',
    name: 'Telmisartan 40mg',
    member: 'Meera Devi',
    sub: 'Meera · once daily · morning',
    dose: '40 mg',
    frequency: 'Once daily',
    takeWith: 'Water',
    started: 'Mar 2024',
    adherence: 91,
    missedDoses: 2,
    aiNote: 'Excellent adherence at 91%. BP readings have stabilised. Continue as prescribed.',
    doses: [
      { id: 'telmisartan-meera-morning', medId: 'telmisartan-meera', time: 'morning', label: 'Morning dose · 8:00 AM', note: 'Taken', taken: true },
    ],
  },
  {
    id: 'thyronorm',
    name: 'Thyronorm 50mcg',
    member: 'Priya Sharma',
    sub: 'Priya · once daily · empty stomach',
    dose: '50 mcg',
    frequency: 'Once daily',
    takeWith: 'Empty stomach',
    started: 'Jun 2023',
    adherence: 78,
    missedDoses: 6,
    aiNote: 'Thyronorm must be taken on an empty stomach, at least 30 minutes before breakfast, for full absorption. Adherence at 78% — consider taking it immediately after waking.',
    doses: [
      { id: 'thyronorm-morning', medId: 'thyronorm', time: 'morning', label: 'Morning dose · 8:00 AM', note: 'Empty stomach · 30 min before food', taken: false },
    ],
  },
  {
    id: 'telmisartan-ramesh',
    name: 'Telmisartan 40mg',
    member: 'Ramesh Sharma',
    sub: 'Meera · once daily · evening',
    dose: '40 mg',
    frequency: 'Once daily',
    takeWith: 'Water',
    started: 'Feb 2024',
    adherence: 88,
    missedDoses: 3,
    aiNote: 'Good adherence at 88%. Evening dose timing is consistent.',
    doses: [
      { id: 'telmisartan-ramesh-evening', medId: 'telmisartan-ramesh', time: 'evening', label: 'Evening dose · 8:00 PM', note: 'Due tonight', taken: false },
    ],
  },
];

export const MEDICATIONS_BY_ID: Record<string, Medication> = Object.fromEntries(
  MEDICATIONS.map(m => [m.id, m])
);

// ─── Context ───────────────────────────────────────────────────────────────────
type TakenMap = Record<string, boolean>; // doseId → taken

interface MedContextValue {
  takenMap: TakenMap;
  toggle: (doseId: string) => void;
  isTaken: (doseId: string) => boolean;
}

const MedContext = createContext<MedContextValue | null>(null);

// Seed initial state from static data
const initialTaken: TakenMap = {};
MEDICATIONS.forEach(m => m.doses.forEach(d => { initialTaken[d.id] = d.taken; }));

export function MedicationProvider({ children }: { children: ReactNode }) {
  const [takenMap, setTakenMap] = useState<TakenMap>(initialTaken);

  const toggle = (doseId: string) =>
    setTakenMap(prev => ({ ...prev, [doseId]: !prev[doseId] }));

  const isTaken = (doseId: string) => !!takenMap[doseId];

  return (
    <MedContext.Provider value={{ takenMap, toggle, isTaken }}>
      {children}
    </MedContext.Provider>
  );
}

export function useMedications() {
  const ctx = useContext(MedContext);
  if (!ctx) throw new Error('useMedications must be used inside MedicationProvider');
  return ctx;
}
