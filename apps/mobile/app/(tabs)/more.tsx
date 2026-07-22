import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Polyline, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─── Chart data ──────────────────────────────────────────────────────────────
// SVG viewBox 260×60, Y: high = bad (50), low = good (18)
const TREND_POINTS = '0,50 52,44 104,38 156,46 208,28 260,18';
const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
const DOT_COORDS = [
  { cx: 0,   cy: 50 },
  { cx: 52,  cy: 44 },
  { cx: 104, cy: 38 },
  { cx: 156, cy: 46 },
  { cx: 208, cy: 28 },
  { cx: 260, cy: 18 },
];

const GRADE_CFG: Record<string, { bg: string; color: string }> = {
  A: { bg: '#CCFBF1', color: '#00725E' },
  B: { bg: '#FEF3C7', color: '#8a5e0a' },
  C: { bg: '#FCE7F3', color: '#be185d' },
};

const RISKS = [
  { member: 'Ramesh', risk: 'Hyperglycaemia', grade: 'C' },
  { member: 'Meera',  risk: 'Hypertension',   grade: 'C' },
  { member: 'Priya',  risk: 'Thyroid',         grade: 'B' },
];

export default function InsightsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 2, paddingBottom: 14 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.5 }}>Insights</Text>
        <TouchableOpacity activeOpacity={0.7}
          style={{ paddingHorizontal: 14, height: 32, borderRadius: 50, backgroundColor: '#F4F4F5', borderWidth: 1, borderColor: '#E4E4E7', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#71717A' }}>Last 6 months</Text>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
            <Path d="M6 9l6 6 6-6" stroke="#71717A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>

        {/* HbA1c trend card */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          {/* Top row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#A1A1AA', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>HbA1c trend</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: '#09090B', letterSpacing: -1 }}>7.2%</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#E8FDF8', borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Line x1="12" y1="19" x2="12" y2="5" stroke="#00B894" strokeWidth={3} strokeLinecap="round" />
                    <Path d="M5 12l7-7 7 7" stroke="#00B894" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: '#007A64' }}>Improving</Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' }}>From 7.8% in April · −0.6%</Text>
            </View>
            {/* Round grade badge */}
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: GRADE_CFG.C.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: GRADE_CFG.C.color }}>C</Text>
            </View>
          </View>

          {/* Chart */}
          <View style={{ marginTop: 12, marginBottom: 4 }}>
            <Svg width="100%" height={60} viewBox="0 0 260 60" preserveAspectRatio="none">
              <Polyline points={TREND_POINTS} fill="none" stroke="#F472B6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {DOT_COORDS.map((d, i) => {
                const isLast = i === DOT_COORDS.length - 1;
                return (
                  <Circle key={i} cx={d.cx} cy={d.cy} r={isLast ? 4.5 : 3}
                    fill={isLast ? '#00B894' : '#FFFFFF'}
                    stroke={isLast ? '#00B894' : '#F472B6'} strokeWidth={2} />
                );
              })}
            </Svg>
            {/* Month labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              {MONTHS.map(m => (
                <Text key={m} style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#A1A1AA' }}>{m}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 14 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginBottom: 4 }}>Medication adherence</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#09090B', marginBottom: 2 }}>86%</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#00B894' }}>↑ from 70% in Jan</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 14 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginBottom: 4 }}>Docs uploaded</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#09090B', marginBottom: 2 }}>12</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A' }}>6 reports, 6 Rx</Text>
          </View>
        </View>

        {/* Key insight — white card with teal left border accent */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, flexDirection: 'row', overflow: 'hidden', marginBottom: 12 }}>
          <View style={{ width: 3, backgroundColor: '#00B894' }} />
          <View style={{ flex: 1, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: '#FFFFFF' }}>P</Text>
              </View>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: '#A1A1AA', letterSpacing: 0.5, textTransform: 'uppercase' }}>Key insight · Prakrit AI</Text>
            </View>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B', lineHeight: 20 }}>
              Ramesh's HbA1c has improved every check since January. At this rate, he could reach pre-diabetic range ({'<'}6.5%) by April 2027 if adherence holds above 85%.
            </Text>
          </View>
        </View>

        {/* Top risk factors */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E4E4E7' }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#A1A1AA', letterSpacing: 0.6, textTransform: 'uppercase' }}>Top risk factors — family</Text>
          </View>
          {RISKS.map((r, i) => {
            const gc = GRADE_CFG[r.grade];
            return (
              <TouchableOpacity key={r.member} activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/family/${r.member.toLowerCase()}`)}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingHorizontal: 16, paddingVertical: 14,
                  borderBottomWidth: i < RISKS.length - 1 ? 1 : 0, borderBottomColor: '#E4E4E7',
                }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>
                  {r.member} · {r.risk}
                </Text>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: gc.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: gc.color }}>{r.grade}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
