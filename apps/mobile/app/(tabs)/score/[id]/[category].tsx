import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const GRADE_CFG: Record<string, { bg: string; border: string; color: string; label: string }> = {
  A: { bg: '#CCFBF1', border: '#00B894', color: '#00725E', label: 'Optimal'  },
  B: { bg: '#FEF3C7', border: '#D4A017', color: '#8a5e0a', label: 'Good'     },
  C: { bg: '#FCE7F3', border: '#F472B6', color: '#be185d', label: 'Fair'     },
  D: { bg: '#FEE2E2', border: '#EF4444', color: '#b91c1c', label: 'Needs attention' },
};

// Static markers per category
const CATEGORY_DATA: Record<string, { grade: string; markers: { name: string; value: string; range: string; grade: string }[] }> = {
  Heart:     { grade: 'A', markers: [{ name: 'LDL Cholesterol', value: '98 mg/dL', range: 'Normal < 100', grade: 'A' }, { name: 'HDL Cholesterol', value: '62 mg/dL', range: 'Optimal > 60', grade: 'A' }, { name: 'Blood Pressure', value: '118/76', range: 'Normal', grade: 'A' }] },
  Thyroid:   { grade: 'A', markers: [{ name: 'TSH', value: '2.1 mIU/L', range: '0.4–4.0 mIU/L', grade: 'A' }, { name: 'T4 Free', value: '1.3 ng/dL', range: '0.8–1.8 ng/dL', grade: 'A' }] },
  Liver:     { grade: 'A', markers: [{ name: 'ALT', value: '22 U/L', range: '7–40 U/L', grade: 'A' }, { name: 'AST', value: '18 U/L', range: '10–40 U/L', grade: 'A' }, { name: 'Bilirubin', value: '0.6 mg/dL', range: '0.2–1.2 mg/dL', grade: 'A' }] },
  Metabolic: { grade: 'B', markers: [{ name: 'HbA1c', value: '7.2%', range: 'Diabetic ≥ 6.5%', grade: 'C' }, { name: 'Fasting Glucose', value: '124 mg/dL', range: 'Elevated', grade: 'C' }, { name: 'Insulin', value: '18.2 μIU/mL', range: 'Borderline', grade: 'B' }, { name: 'Triglycerides', value: '142 mg/dL', range: 'Normal-high', grade: 'B' }, { name: 'HDL Cholesterol', value: '52 mg/dL', range: 'Optimal', grade: 'A' }] },
  Hormones:  { grade: 'B', markers: [{ name: 'Estradiol', value: '112 pg/mL', range: 'Normal range', grade: 'A' }, { name: 'Cortisol', value: '18 μg/dL', range: 'Slightly elevated', grade: 'B' }, { name: 'DHEA-S', value: '145 μg/dL', range: 'Normal', grade: 'A' }] },
  Kidney:    { grade: 'A', markers: [{ name: 'Creatinine', value: '0.8 mg/dL', range: 'Normal F: 0.5–1.1', grade: 'A' }, { name: 'eGFR', value: '98 mL/min', range: 'Normal > 90', grade: 'A' }, { name: 'Urea', value: '28 mg/dL', range: 'Normal: 7–40', grade: 'A' }] },
  Gut:       { grade: 'B', markers: [{ name: 'Calprotectin', value: '68 μg/g', range: 'Borderline > 50', grade: 'B' }, { name: 'Vitamin B12', value: '380 pg/mL', range: 'Normal: 200–900', grade: 'A' }] },
};

function GradeBadge({ grade, size = 30 }: { grade: string; size?: number }) {
  const c = GRADE_CFG[grade] ?? GRADE_CFG.B;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.bg, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: size * 0.43, color: c.color }}>{grade}</Text>
    </View>
  );
}

export default function CategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const label = typeof category === 'string' ? decodeURIComponent(category) : 'Category';
  const data = CATEGORY_DATA[label] ?? { grade: 'A', markers: [] };
  const cfg = GRADE_CFG[data.grade] ?? GRADE_CFG.A;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 2, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.5 }}>{label}</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>
            Priya Sharma · {data.markers.length} markers
          </Text>
        </View>
        <GradeBadge grade={data.grade} size={38} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        {/* AI note — appears FIRST per mockup S07 */}
        <View style={{ backgroundColor: '#F4F4F5', borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: '#09090B', marginBottom: 16 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 7 }}>Prakrit AI</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', lineHeight: 20 }}>
            {data.grade === 'A'
              ? `All ${label.toLowerCase()} markers are within optimal range. Keep up your current habits.`
              : data.grade === 'B'
              ? `Most ${label.toLowerCase()} markers look good. A few are in the borderline range — monitor at your next check-up.`
              : `Some ${label.toLowerCase()} markers need attention. Consider consulting your doctor about the out-of-range values.`}
          </Text>
        </View>

        {/* Markers list */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {data.markers.map((m, i) => {
            const mc = GRADE_CFG[m.grade] ?? GRADE_CFG.B;
            return (
              <TouchableOpacity key={m.name} activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/score/priya/${encodeURIComponent(label)}/${encodeURIComponent(m.name)}`)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingHorizontal: 16, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#E4E4E7' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{m.name}</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A', marginTop: 2 }}>{m.range}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>{m.value}</Text>
                  <GradeBadge grade={m.grade} size={22} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* View action protocol button */}
        <TouchableOpacity activeOpacity={0.85}
          style={{ height: 48, backgroundColor: '#09090B', borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' }}>View action protocol</Text>
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
