import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line } from 'react-native-svg';

// ─── Static data ──────────────────────────────────────────────────────────────
export const FAMILY_MEMBERS = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    label: 'You',
    age: 34,
    gender: 'Female',
    conditions: [],
    score: 88,
    grade: 'A',
    bioAge: 30,
    scoreColor: '#00B894',
    badges: [
      { label: 'A', bg: '#CCFBF1', color: '#00725E' },
      { label: 'A', bg: '#CCFBF1', color: '#00725E' },
      { label: 'B', bg: '#FEF3C7', color: '#8a5e0a' },
      { label: 'A', bg: '#CCFBF1', color: '#00725E' },
    ],
    badgeMore: 'Thyroid, Heart…',
    alerts: 0,
    sub: '34 yrs · Female',
    docId: null,
    medications: [],
    markers: [],
    recentDoc: null,
  },
  {
    id: 'ramesh',
    name: 'Ramesh Sharma',
    label: '1 alert',
    age: 45,
    gender: 'Male',
    conditions: ['T2DM', 'Hypertension'],
    score: 62,
    grade: 'C',
    bioAge: 52,
    scoreColor: '#F472B6',
    badges: [
      { label: 'C', bg: '#FCE7F3', color: '#be185d' },
      { label: 'C', bg: '#FCE7F3', color: '#be185d' },
      { label: 'B', bg: '#FEF3C7', color: '#8a5e0a' },
    ],
    badgeMore: 'HbA1c, Glucose…',
    alerts: 1,
    sub: '45 yrs · Male · T2DM',
    docId: '1',
    medications: ['Metformin 500mg', 'Telmisartan 40mg'],
    markers: [
      { name: 'HbA1c',          sub: 'Diabetic range · trending better', value: '7.2%',      grade: 'C' },
      { name: 'Fasting Glucose', sub: 'Slightly elevated',               value: '124 mg/dL', grade: 'C' },
    ],
    recentDoc: { id: '1', name: 'HbA1c Report · Jul 2026', lab: 'Apollo Diagnostics · 3 values', grade: 'C' },
  },
  {
    id: 'meera',
    name: 'Meera Devi',
    label: '',
    age: 70,
    gender: 'Female',
    conditions: ['Hypertension'],
    score: 70,
    grade: 'B',
    bioAge: 68,
    scoreColor: '#D4A017',
    badges: [
      { label: 'B', bg: '#FEF3C7', color: '#8a5e0a' },
      { label: 'B', bg: '#FEF3C7', color: '#8a5e0a' },
      { label: 'A', bg: '#CCFBF1', color: '#00725E' },
    ],
    badgeMore: 'BP, Cholesterol…',
    alerts: 0,
    sub: '70 yrs · Female · Hypertension',
    docId: null,
    medications: ['Amlodipine 5mg'],
    markers: [],
    recentDoc: null,
  },
  {
    id: 'riya',
    name: 'Riya Sharma',
    label: '',
    age: 8,
    gender: 'Female',
    conditions: [],
    score: 94,
    grade: 'A',
    bioAge: 8,
    scoreColor: '#00B894',
    badges: [],
    badgeMore: '',
    alerts: 0,
    sub: '8 yrs · Female',
    docId: null,
    medications: [],
    markers: [],
    recentDoc: null,
  },
];

const GRADE_CFG: Record<string, { bg: string; color: string }> = {
  A: { bg: '#CCFBF1', color: '#00725E' },
  B: { bg: '#FEF3C7', color: '#8a5e0a' },
  C: { bg: '#FCE7F3', color: '#be185d' },
  D: { bg: '#FEE2E2', color: '#b91c1c' },
};

// ─── Mini score ring ──────────────────────────────────────────────────────────
function MiniRing({ score, color }: { score: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <View style={{ width: 54, height: 54, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={54} height={54} viewBox="0 0 54 54">
        <Circle cx={27} cy={27} r={r} stroke="#F4F4F5" strokeWidth={4} fill="none" />
        <Circle cx={27} cy={27} r={r} stroke={color} strokeWidth={4} fill="none"
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
          transform="rotate(-90 27 27)" />
      </Svg>
      <Text style={{ position: 'absolute', fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' }}>{score}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FamilyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 2, paddingBottom: 14 }}>
        <View>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.5 }}>Family</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginTop: 1 }}>4 members · all synced</Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(tabs)/family/add')}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}>
        {FAMILY_MEMBERS.map(m => {
          const gradeCfg = GRADE_CFG[m.grade];
          return (
            <TouchableOpacity key={m.id} activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/family/${m.id}`)}
              style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>

              {/* Score ring */}
              <MiniRing score={m.score} color={m.scoreColor} />

              {/* Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>{m.name}</Text>
                  {m.label ? (
                    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 50,
                      backgroundColor: m.alerts > 0 ? '#FEE2E2' : '#F4F4F5' }}>
                      <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 10,
                        color: m.alerts > 0 ? '#b91c1c' : '#71717A' }}>{m.label}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginBottom: 6 }}>{m.sub}</Text>
                {/* Grade badge row */}
                {m.badges.length > 0 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {m.badges.map((b, i) => (
                      <View key={i} style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: b.bg, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: b.color }}>{b.label}</Text>
                      </View>
                    ))}
                    {m.badgeMore ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#A1A1AA', marginLeft: 2 }}>{m.badgeMore}</Text> : null}
                  </View>
                ) : (
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' }}>All vitals normal · Last check Jun 2026</Text>
                )}
              </View>

              {/* Grade + chevron */}
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <View style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: gradeCfg.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: gradeCfg.color }}>{m.grade}</Text>
                </View>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18l6-6-6-6" stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
