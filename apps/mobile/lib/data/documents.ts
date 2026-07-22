// ─── Single source of truth for static document data ─────────────────────────
// All document screens (list, upload, viewer) import from here to keep IDs in sync.

export interface DocMarker {
  name: string;
  ref: string;
  value: string;
  grade: string;
}

export interface DocRecord {
  id: string;
  name: string;
  lab: string;
  date: string;
  grade: string;
  type: 'Lab Reports' | 'Prescriptions' | 'Scans';
  title: string;          // used in viewer header
  aiLabel: string;
  aiSummary: string;
  markers: DocMarker[];
}

export const DOCUMENTS: DocRecord[] = [
  {
    id: '1',
    name: 'HbA1c Report',
    lab: 'Apollo Diagnostics · Ramesh · Jul 15',
    date: 'Jul 15',
    grade: 'C',
    type: 'Lab Reports',
    title: 'HbA1c Report — Jul 2026',
    aiLabel: 'AI Analysis complete · 3 values extracted · Diabetic range',
    aiSummary:
      'HbA1c 7.2% is in the diabetic range (normal < 5.7%), but shows improvement from 7.8% in April — a 0.6% drop in 3 months. Continue Metformin and reduce refined carbs.',
    markers: [
      { name: 'HbA1c',           ref: 'Normal: < 5.7%',       value: '7.2%',      grade: 'C' },
      { name: 'Fasting Glucose', ref: 'Normal: 70–99 mg/dL',  value: '118 mg/dL', grade: 'B' },
      { name: 'Avg Blood Sugar', ref: 'Estimated from HbA1c', value: '160 mg/dL', grade: 'C' },
    ],
  },
  {
    id: '2',
    name: 'Metformin Prescription',
    lab: 'Dr. Anjali Mehta · Ramesh · Jun 18',
    date: 'Jun 18',
    grade: 'Rx',
    type: 'Prescriptions',
    title: 'Metformin Prescription — Jun 2026',
    aiLabel: 'AI Analysis complete · Prescription reviewed',
    aiSummary:
      'Metformin 500mg twice daily. Take with meals to reduce GI side effects. Next follow-up scheduled in 3 months.',
    markers: [
      { name: 'Metformin', ref: '500mg, twice daily', value: '500mg', grade: 'A' },
      { name: 'Duration',  ref: '3 months',           value: '90 d',  grade: 'A' },
    ],
  },
  {
    id: '3',
    name: 'CBC Report',
    lab: 'Apollo Diagnostics · Ramesh · Jun 22',
    date: 'Jun 22',
    grade: 'A',
    type: 'Lab Reports',
    title: 'CBC Report — Jun 2026',
    aiLabel: 'AI Analysis complete · 6 values extracted · All normal',
    aiSummary:
      'CBC looks healthy — all 6 markers within normal range. Haemoglobin at 13.8 g/dL is good for a male with T2DM. No signs of anaemia or infection. Next CBC recommended in 6 months.',
    markers: [
      { name: 'Haemoglobin', ref: 'Normal M: 13–17 g/dL',     value: '13.8 g/dL', grade: 'A' },
      { name: 'WBC',         ref: 'Normal: 4,000–11,000 /μL', value: '7,200 /μL', grade: 'A' },
      { name: 'Platelets',   ref: 'Normal: 150k–400k /μL',    value: '185k /μL',  grade: 'A' },
      { name: 'MCV',         ref: 'Normal: 80–100 fL',        value: '82 fL',     grade: 'A' },
      { name: 'ESR',         ref: 'Normal M: 0–15 mm/hr',     value: '12 mm/hr',  grade: 'A' },
    ],
  },
];

// Lookup map for O(1) access by id
export const DOCUMENTS_BY_ID: Record<string, DocRecord> = Object.fromEntries(
  DOCUMENTS.map(d => [d.id, d])
);

// IDs of documents to show in "Recent uploads" on the upload screen
export const RECENT_UPLOAD_IDS = ['1', '3'];

// IDs of documents to show in the horizontal Lab Reports row on the list screen
export const LAB_CARD_IDS = ['1', '3'];
