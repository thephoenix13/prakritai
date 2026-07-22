import { ScrollView, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const GRADE_CFG: Record<string, { bg: string; border: string; color: string; label: string }> = {
  A: { bg: '#CCFBF1', border: '#00B894', color: '#00725E', label: 'Optimal'       },
  B: { bg: '#FEF3C7', border: '#D4A017', color: '#8a5e0a', label: 'Good'          },
  C: { bg: '#FCE7F3', border: '#F472B6', color: '#be185d', label: 'Diabetic range' },
  D: { bg: '#FEE2E2', border: '#EF4444', color: '#b91c1c', label: 'Critical'      },
};

// Static marker details keyed by marker name
const MARKER_DETAILS: Record<string, {
  value: string; unit: string; status: string; grade: string;
  refRange: string;
  trend: { month: string; y: number }[];
  trendLabel: string; trendColor: string;
  prevReadings: { date: string; value: string; grade: string }[];
  aiNote: string;
  sourceDoc: string; sourceDate: string;
}> = {
  'HbA1c': {
    value: '7.2', unit: '%', status: 'Diabetic range', grade: 'C',
    refRange: 'Normal < 5.7% · Pre-diabetic 5.7–6.4% · Diabetic ≥ 6.5%',
    trend: [{ month: 'Feb', y: 64 }, { month: 'Mar', y: 56 }, { month: 'Apr', y: 48 }, { month: 'May', y: 38 }, { month: 'Jun', y: 28 }, { month: 'Jul', y: 14 }],
    trendLabel: '0.6% improvement since Feb 2026', trendColor: '#F472B6',
    prevReadings: [{ date: 'Apr 2026', value: '7.8%', grade: 'C' }, { date: 'Jan 2026', value: '8.1%', grade: 'D' }, { date: 'Oct 2025', value: '8.4%', grade: 'D' }],
    aiNote: 'HbA1c measures average blood sugar over 3 months. At 7.2%, this is in the diabetic range — but down from 7.8% in April. Continue Metformin 500mg twice daily and limit refined carbs. Next test: October 2026.',
    sourceDoc: 'HbA1c Report — Apollo Diagnostics', sourceDate: 'Jul 2026 · Original PDF',
  },
  'Fasting Glucose': {
    value: '124', unit: 'mg/dL', status: 'Elevated', grade: 'C',
    refRange: 'Normal < 100 mg/dL · Pre-diabetic 100–125 · Diabetic ≥ 126',
    trend: [{ month: 'Feb', y: 60 }, { month: 'Mar', y: 52 }, { month: 'Apr', y: 45 }, { month: 'May', y: 40 }, { month: 'Jun', y: 34 }, { month: 'Jul', y: 20 }],
    trendLabel: 'Improving trend since Feb 2026', trendColor: '#F472B6',
    prevReadings: [{ date: 'Apr 2026', value: '138 mg/dL', grade: 'C' }, { date: 'Jan 2026', value: '145 mg/dL', grade: 'D' }],
    aiNote: 'Fasting glucose of 124 mg/dL is in the pre-diabetic range. Combined with HbA1c, this indicates impaired glucose regulation. Post-meal walks and carb reduction can help bring this down.',
    sourceDoc: 'HbA1c Report — Apollo Diagnostics', sourceDate: 'Jul 2026 · Original PDF',
  },
  'LDL Cholesterol': {
    value: '98', unit: 'mg/dL', status: 'Optimal', grade: 'A',
    refRange: 'Optimal < 100 mg/dL · Near-optimal 100–129 · Borderline 130–159',
    trend: [{ month: 'Feb', y: 40 }, { month: 'Mar', y: 36 }, { month: 'Apr', y: 32 }, { month: 'May', y: 28 }, { month: 'Jun', y: 22 }, { month: 'Jul', y: 18 }],
    trendLabel: 'Trending down — great progress', trendColor: '#00B894',
    prevReadings: [{ date: 'Apr 2026', value: '108 mg/dL', grade: 'B' }, { date: 'Jan 2026', value: '118 mg/dL', grade: 'B' }],
    aiNote: 'LDL at 98 mg/dL is in the optimal range. Consistent with a heart-healthy diet. Keep up current habits.',
    sourceDoc: 'Lipid Panel — Apollo Diagnostics', sourceDate: 'Apr 2026 · Original PDF',
  },
};

function GradeBadge({ grade, size = 30 }: { grade: string; size?: number }) {
  const c = GRADE_CFG[grade] ?? GRADE_CFG.B;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.bg, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: size * 0.43, color: c.color }}>{grade}</Text>
    </View>
  );
}

// Simple line trend chart using SVG
function TrendChart({ points, color }: { points: { month: string; y: number }[]; color: string }) {
  const w = width - 80;
  const h = 72;
  const pts = points.map((p, i) => `${(i / (points.length - 1)) * w},${p.y}`).join(' ');
  const areaPath = `M0,${points[0].y} ` + points.slice(1).map((p, i) => `L${((i + 1) / (points.length - 1)) * w},${p.y}`).join(' ') + ` L${w},${h} L0,${h}Z`;
  const linePath = `M0,${points[0].y} ` + points.slice(1).map((p, i) => `L${((i + 1) / (points.length - 1)) * w},${p.y}`).join(' ');

  return (
    <View>
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.16} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#grad)" />
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const x = (i / (points.length - 1)) * w;
          const isLast = i === points.length - 1;
          return isLast
            ? <Circle key={i} cx={x} cy={p.y} r={5} fill="#09090B" stroke={color} strokeWidth={2} />
            : <Circle key={i} cx={x} cy={p.y} r={3} fill={color} />;
        })}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        {points.map(p => (
          <Text key={p.month} style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' }}>{p.month}</Text>
        ))}
      </View>
    </View>
  );
}

export default function MarkerDetailScreen() {
  const router = useRouter();
  const { marker } = useLocalSearchParams<{ marker: string }>();
  const name = typeof marker === 'string' ? decodeURIComponent(marker) : 'Marker';
  const d = MARKER_DETAILS[name] ?? {
    value: '—', unit: '', status: 'No data', grade: 'B',
    refRange: 'No reference range available',
    trend: [{ month: 'Feb', y: 40 }, { month: 'Mar', y: 36 }, { month: 'Apr', y: 32 }, { month: 'May', y: 28 }, { month: 'Jun', y: 22 }, { month: 'Jul', y: 18 }],
    trendLabel: 'No trend data', trendColor: '#00B894',
    prevReadings: [],
    aiNote: 'No AI analysis available yet. Upload more reports to get personalized insights.',
    sourceDoc: 'No source document', sourceDate: '',
  };
  const gc = GRADE_CFG[d.grade] ?? GRADE_CFG.B;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 2, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.5 }}>{name}</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>Priya Sharma · Jul 2026</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        {/* Value + Grade */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 56, color: '#09090B', letterSpacing: -2, lineHeight: 60 }}>{d.value}</Text>
              {d.unit ? <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 20, color: '#71717A', marginBottom: 10 }}>{d.unit}</Text> : null}
            </View>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: gc.color, marginTop: 5 }}>{d.status}</Text>
          </View>
          <GradeBadge grade={d.grade} size={54} />
        </View>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginBottom: 22 }}>{d.refRange}</Text>

        {/* Trend chart card */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 14 }}>6-month trend</Text>
          <TrendChart points={d.trend} color={d.trendColor} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E4E4E7' }}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Polyline points="18,15 12,9 6,15" stroke="#00725E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#00725E' }}>{d.trendLabel}</Text>
          </View>
        </View>

        {/* Previous readings */}
        {d.prevReadings.length > 0 && (
          <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
            <View style={{ padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E4E4E7' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase' }}>Previous readings</Text>
            </View>
            {d.prevReadings.map((r, i) => (
              <View key={r.date} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#E4E4E7' }}>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' }}>{r.date}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>{r.value}</Text>
                  <GradeBadge grade={r.grade} size={22} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* AI note */}
        <View style={{ backgroundColor: '#F4F4F5', borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: '#09090B', marginBottom: 14 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>Prakrit AI</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', lineHeight: 22 }}>{d.aiNote}</Text>
        </View>

        {/* Source document */}
        <TouchableOpacity activeOpacity={0.7}
          style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <View style={{ width: 36, height: 42, backgroundColor: '#F4F4F5', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <Polyline points="14,2 14,8 20,8" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{d.sourceDoc}</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>{d.sourceDate}</Text>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
