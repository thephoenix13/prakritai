import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { DOCUMENTS_BY_ID } from '../../../lib/data/documents';

const GRADE_CFG: Record<string, { bg: string; color: string }> = {
  A: { bg: '#CCFBF1', color: '#00725E' },
  B: { bg: '#FEF3C7', color: '#8a5e0a' },
  C: { bg: '#FCE7F3', color: '#be185d' },
  D: { bg: '#FEE2E2', color: '#b91c1c' },
};

function GradeBadge({ grade }: { grade: string }) {
  const c = GRADE_CFG[grade] ?? GRADE_CFG.A;
  return (
    <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: c.color }}>{grade}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DocumentViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const doc = DOCUMENTS_BY_ID[id ?? '3'] ?? DOCUMENTS_BY_ID['3'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 14 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', letterSpacing: -0.2 }} numberOfLines={1}>{doc.title}</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{doc.lab}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
            <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="#09090B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 6l-4-4-4 4" stroke="#09090B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 2v13" stroke="#09090B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>

        {/* AI analysis banner */}
        <View style={{ backgroundColor: '#E8FDF8', borderWidth: 1.5, borderColor: '#00B894', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 20 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#00725E', flex: 1 }}>{doc.aiLabel}</Text>
        </View>

        {/* Extracted values */}
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 10 }}>Extracted values</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {doc.markers.map((m, i) => (
            <View key={m.name} style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingVertical: 14,
              borderBottomWidth: i < doc.markers.length - 1 ? 1 : 0,
              borderBottomColor: '#E4E4E7',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{m.name}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>{m.ref}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' }}>{m.value}</Text>
                <GradeBadge grade={m.grade} />
              </View>
            </View>
          ))}
        </View>

        {/* AI note */}
        <View style={{ backgroundColor: '#F4F4F5', borderRadius: 14, padding: 14, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: '#FFFFFF' }}>P</Text>
            </View>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#09090B' }}>Prakrit AI</Text>
          </View>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B', lineHeight: 20 }}>{doc.aiSummary}</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 8 }}>
            Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/ai')}
            style={{ flex: 1, height: 48, borderRadius: 13, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E4E7' }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>Ask AI</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8}
            style={{ flex: 1, height: 48, borderRadius: 13, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' }}>Share</Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
