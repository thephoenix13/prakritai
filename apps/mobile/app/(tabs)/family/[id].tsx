import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { FAMILY_MEMBERS } from './index';

// ─── Design tokens ─────────────────────────────────────────────────────────
const GRADE_CFG: Record<string, { bg: string; color: string }> = {
  A: { bg: '#CCFBF1', color: '#00725E' },
  B: { bg: '#FEF3C7', color: '#8a5e0a' },
  C: { bg: '#FCE7F3', color: '#be185d' },
  D: { bg: '#FEE2E2', color: '#b91c1c' },
};

// ─── Score ring ─────────────────────────────────────────────────────────────
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <View style={{ width: 88, height: 88, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={88} height={88} viewBox="0 0 88 88">
        <Circle cx={44} cy={44} r={r} stroke="#F4F4F5" strokeWidth={6} fill="none" />
        <Circle cx={44} cy={44} r={r} stroke={color} strokeWidth={6} fill="none"
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
          transform="rotate(-90 44 44)" />
      </Svg>
      <Text style={{ position: 'absolute', fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#09090B' }}>{score}</Text>
    </View>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const c = GRADE_CFG[grade] ?? GRADE_CFG.A;
  return (
    <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: c.color }}>{grade}</Text>
    </View>
  );
}

function DocIcon() {
  return (
    <View style={{ width: 38, height: 46, backgroundColor: '#E8FDF8', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14 2v6h6" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function MemberDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const member = FAMILY_MEMBERS.find(m => m.id === id) ?? FAMILY_MEMBERS[0];
  const gradeCfg = GRADE_CFG[member.grade];
  const conditionStr = member.conditions.length > 0 ? ` · ${member.conditions.join(' · ')}` : '';

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
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: '#09090B', letterSpacing: -0.3 }}>{member.name}</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{member.age} yrs · {member.gender}{conditionStr}</Text>
        </View>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: gradeCfg.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: gradeCfg.color }}>{member.grade}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>

        {/* Score card */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <ScoreRing score={member.score} color={member.scoreColor} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <View style={{ backgroundColor: '#F4F4F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A' }}>Biological Age</Text>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#09090B', marginTop: 1 }}>{member.bioAge} yrs</Text>
              </View>
            </View>
            {member.alerts > 0 ? (
              <View style={{ backgroundColor: '#FEE2E2', borderRadius: 8, padding: 8 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#b91c1c' }}>↓ 7 pts · needs focus</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#b91c1c', marginTop: 2 }}>3 markers elevated</Text>
              </View>
            ) : (
              <View style={{ backgroundColor: '#CCFBF1', borderRadius: 8, padding: 8 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#00725E' }}>All looking good</Text>
              </View>
            )}
          </View>
        </View>

        {/* Needs attention markers */}
        {member.markers.length > 0 && (
          <>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 8 }}>Needs attention</Text>
            <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
              {member.markers.map((mk, i) => (
                <TouchableOpacity key={mk.name} activeOpacity={0.7}
                  onPress={() => router.push(`/(tabs)/score/${member.id}`)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 16, paddingVertical: 13,
                    borderBottomWidth: i < member.markers.length - 1 ? 1 : 0,
                    borderBottomColor: '#E4E4E7',
                  }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{mk.name}</Text>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>{mk.sub}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' }}>{mk.value}</Text>
                    <GradeBadge grade={mk.grade} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Recently uploaded */}
        {member.recentDoc && (
          <>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 8 }}>Recently uploaded</Text>
            <TouchableOpacity activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/documents/${member.recentDoc!.id}`)}
              style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 16, marginBottom: 14 }}>
              <DocIcon />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{member.recentDoc.name}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>{member.recentDoc.lab}</Text>
              </View>
              <GradeBadge grade={member.recentDoc.grade} />
            </TouchableOpacity>
          </>
        )}

        {/* Active medications */}
        {member.medications.length > 0 && (
          <>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 8 }}>Active medications</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {member.medications.map(med => (
                <TouchableOpacity key={med} activeOpacity={0.7}
                  style={{ paddingHorizontal: 14, height: 34, borderRadius: 50, backgroundColor: '#E8FDF8', borderWidth: 1, borderColor: '#CCFBF1', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#007A64' }}>{med}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* No data state */}
        {member.markers.length === 0 && !member.recentDoc && member.medications.length === 0 && (
          <View style={{ backgroundColor: '#CCFBF1', borderRadius: 14, padding: 16, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#00725E' }}>All vitals normal</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#00B894', marginTop: 4 }}>Last check Jun 2026 · No issues found</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
