import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

// ─── Static data ──────────────────────────────────────────────────────────────
const SYSTEMS = [
  { name: 'Heart',     grade: 'A' },
  { name: 'Thyroid',   grade: 'A' },
  { name: 'Liver',     grade: 'A' },
  { name: 'Metabolic', grade: 'B' },
  { name: 'Hormones',  grade: 'B' },
  { name: 'Kidney',    grade: 'A' },
  { name: 'Gut',       grade: 'B' },
];

const GRADE_CFG: Record<string, { bg: string; border: string; color: string }> = {
  A: { bg: '#CCFBF1', border: '#00B894', color: '#00725E' },
  B: { bg: '#FEF3C7', border: '#D4A017', color: '#8a5e0a' },
  C: { bg: '#FCE7F3', border: '#F472B6', color: '#be185d' },
  D: { bg: '#FEE2E2', border: '#EF4444', color: '#b91c1c' },
};

function GradeBadge({ grade, size = 30 }: { grade: string; size?: number }) {
  const c = GRADE_CFG[grade] ?? GRADE_CFG.B;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.bg, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: size * 0.43, color: c.color }}>{grade}</Text>
    </View>
  );
}

// ─── Chevron right ────────────────────────────────────────────────────────────
function ChevronRight() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Ghost body silhouette (decorative) ──────────────────────────────────────
function GhostBody() {
  return (
    <Svg viewBox="0 0 100 200" fill="#09090B" opacity={0.055}
      style={{ position: 'absolute', right: -8, top: 0, width: 110, height: 200 }}>
      <Circle cx="50" cy="20" r="17" />
      <Path d="M26 47 C22 74 24 104 28 122 L72 122 C76 104 78 74 74 47 C67 43 33 43 26 47Z" />
      <Path d="M26 52 C15 68 11 92 13 114 L23 112 C23 94 27 72 35 58Z" />
      <Path d="M74 52 C85 68 89 92 87 114 L77 112 C77 94 73 72 65 58Z" />
      <Path d="M28 122 C25 150 26 176 28 194 L42 194 C43 174 47 152 50 138 C53 152 57 174 58 194 L72 194 C74 176 75 150 72 122Z" />
    </Svg>
  );
}

export default function HealthScoreScreen() {
  const router = useRouter();

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
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.5 }}>Health Score</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        {/* Score number */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 4 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 56, color: '#09090B', letterSpacing: -2, lineHeight: 60 }}>88</Text>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 22, color: '#71717A', marginBottom: 10 }}>/100</Text>
        </View>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#A1A1AA', marginBottom: 16 }}>Priya Sharma · Jul 2026</Text>

        {/* Biological Age card */}
        <View style={{ backgroundColor: '#E8FDF8', borderWidth: 1, borderColor: '#CCFBF1', borderRadius: 12, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#007A64' }}>Biological Age</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#007A64', marginTop: 2 }}>28 yrs</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#007A64' }}>12 yrs younger</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#007A64' }}>than average</Text>
          </View>
        </View>

        {/* Info banner */}
        <View style={{ backgroundColor: '#F4F4F5', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
            <Circle cx="12" cy="12" r="10" stroke="#A1A1AA" strokeWidth={2} />
            <Path d="M12 8v4M12 16h.01" stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', flex: 1, lineHeight: 18 }}>
            Biomarkers are read automatically from the lab reports you upload — no manual entry needed. The more reports you upload, the richer your score gets.
          </Text>
        </View>

        {/* By system list */}
        <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 12 }}>By system</Text>

        <View style={{ position: 'relative' }}>
          <GhostBody />
          <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden' }}>
            {SYSTEMS.map((sys, i) => (
              <TouchableOpacity key={sys.name} activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/score/priya/${encodeURIComponent(sys.name)}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#E4E4E7' }}>
                <GradeBadge grade={sys.grade} size={24} />
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14, color: '#09090B', flex: 1 }}>{sys.name}</Text>
                <ChevronRight />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 14 }}>
          Last updated 15 Jul 2026 · Apollo Diagnostics
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
