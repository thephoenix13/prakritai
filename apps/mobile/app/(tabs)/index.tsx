import React, { useCallback, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { gradeFromScore } from '../../components/ui/GradeBadge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../lib/auth-context';
import { useFamilyMembers } from '../../lib/queries/family';
import { useMedications } from '../../lib/queries/medications';
import { useCachedHealthScore } from '../../lib/queries/health-score';
import { calculateBmi, getBmiCategory } from '@prakritai/shared';

const TIME_LABEL_MAP: Record<string, string> = {
  Morning: '8:00 AM',
  Afternoon: '1:00 PM',
  Evening: '6:00 PM',
  Bedtime: '10:00 PM',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function RingScoreSmall({ score, size = 52 }: { score: number; size?: number }) {
  const grade = gradeFromScore(score);
  const ringColor = grade === 'A' ? '#00B894' : grade === 'B' ? '#D4A017' : grade === 'C' ? '#F472B6' : '#EF4444';
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${cx},${cy}`}>
        <Circle cx={cx} cy={cy} r={r} stroke="#EBEBEB" strokeWidth={5} fill="none" />
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={ringColor} strokeWidth={5} fill="none"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

function CheckCircle({ done }: { done: boolean }) {
  if (done) {
    return (
      <View style={styles.checkDone}>
        <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <Path d="M2.5 6L5 8.5L9.5 4" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }
  return <View style={styles.checkEmpty} />;
}

export default function Dashboard() {
  const router = useRouter();
  const { displayName } = useAuth();
  const { data: members, isLoading: membersLoading } = useFamilyMembers();
  const { data: medications } = useMedications();

  const firstName = displayName?.split(' ')[0] ?? 'there';
  const avatarName = displayName ?? 'U';

  // Derive "self" member for the main score ring
  const selfMember = useMemo(
    () => members?.find((m) => m.relationship === 'Self') ?? members?.[0] ?? null,
    [members],
  );

  const selfBmi = selfMember?.height_cm && selfMember?.weight_kg
    ? calculateBmi(Number(selfMember.height_cm), Number(selfMember.weight_kg))
    : null;
  const selfBmiCategory = selfBmi ? getBmiCategory(selfBmi) : null;
  const { data: selfScore } = useCachedHealthScore(selfMember?.id);
  const SCORE = selfScore?.score ?? 75;

  // Today's schedule (first 3 entries, sorted by time)
  const todaySchedule = useMemo(() => {
    if (!medications) return [];
    return medications.flatMap((med) => {
      const memberName = (med as any).family_members?.name ?? '';
      return (med.times_of_day ?? []).map((slot) => ({
        medId: med.id,
        medName: med.name,
        memberName,
        slot,
        displayTime: TIME_LABEL_MAP[slot] ?? slot,
      }));
    }).slice(0, 4);
  }, [medications]);

  const onMemberPress = useCallback(
    (id: string) => router.push(`/(tabs)/family/${id}` as any),
    [router],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting row */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()} 👋</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/family' as any)}>
            <Avatar name={avatarName} size={40} />
          </TouchableOpacity>
        </View>

        {/* Score ring + stat grid */}
        {selfMember ? (
          <TouchableOpacity
            style={styles.scoreRow}
            onPress={() => router.push(`/(tabs)/score/${selfMember.id}` as any)}
            activeOpacity={0.85}
          >
            <ScoreRing score={SCORE} size={110} strokeWidth={8} showScore showGrade />
            <View style={styles.statGrid}>
              <View style={styles.statsTop}>
                <View style={[styles.statTile, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.statLabel}>MEMBER</Text>
                  <Text style={styles.statMemberName} numberOfLines={1}>
                    {selfMember.name.split(' ')[0]}
                  </Text>
                  {selfMember.date_of_birth && (
                    <Text style={styles.statUnit}>
                      Age {new Date().getFullYear() - new Date(selfMember.date_of_birth).getFullYear()}
                    </Text>
                  )}
                </View>
                {selfBmi ? (
                  <View style={[styles.statTile, styles.statTileTeal, { flex: 1 }]}>
                    <Text style={[styles.statLabel, { color: '#007A64' }]}>BMI</Text>
                    <View style={styles.statValueRow}>
                      <Text style={[styles.statNum, { color: '#09090B' }]}>{selfBmi.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.statNormal}>{selfBmiCategory}</Text>
                  </View>
                ) : (
                  <View style={[styles.statTile, { flex: 1 }]}>
                    <Text style={styles.statLabel}>FAMILY</Text>
                    <Text style={styles.statNum}>{members?.length ?? 0}</Text>
                    <Text style={styles.statUnit}>members</Text>
                  </View>
                )}
              </View>
              <View style={styles.trendBanner}>
                <Text style={styles.trendText}>
                  {members?.length ?? 0} member{(members?.length ?? 0) !== 1 ? 's' : ''} ·{' '}
                  {medications?.length ?? 0} medication{(medications?.length ?? 0) !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : membersLoading ? (
          <View style={styles.scoreRow}>
            <ActivityIndicator color="#00B894" />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyScoreCard}
            onPress={() => router.push('/(tabs)/family/add' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyScoreText}>Add a family member to see your health score →</Text>
          </TouchableOpacity>
        )}

        {/* Family strip */}
        {members && members.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Family</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/family' as any)}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.familyScroll}>
              {members.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.familyChip}
                  onPress={() => onMemberPress(m.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.ringWrap}>
                    <RingScoreSmall score={SCORE} size={52} />
                    <View style={styles.ringScore}>
                      <Text style={styles.ringScoreText}>{SCORE}</Text>
                    </View>
                  </View>
                  <Text style={styles.familyName} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.familyChip, { opacity: 0.6 }]}
                onPress={() => router.push('/(tabs)/family/add' as any)}
              >
                <View style={[styles.ringWrap, styles.addMemberRing]}>
                  <Text style={styles.addMemberPlus}>+</Text>
                </View>
                <Text style={styles.familyName}>Add</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Today's reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Reminders</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/medications' as any)}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {todaySchedule.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyReminders}
              onPress={() => router.push('/(tabs)/medications/add' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyRemindersText}>No medications scheduled · Add one →</Text>
            </TouchableOpacity>
          ) : (
            todaySchedule.map((r, idx) => (
              <View key={`${r.medId}-${r.slot}-${idx}`} style={styles.reminderRow}>
                <CheckCircle done={false} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reminderMed}>{r.medName}</Text>
                  <Text style={styles.reminderMeta}>{r.memberName} · {r.displayTime}</Text>
                </View>
                <Text style={[styles.reminderStatus, { color: '#A1A1AA' }]}>Due</Text>
              </View>
            ))
          )}
        </View>

        {/* AI Prompt Bar */}
        <TouchableOpacity
          style={styles.aiBar}
          onPress={() => router.push('/(tabs)/ai' as any)}
          activeOpacity={0.9}
        >
          <View style={styles.aiLogo}>
            <Text style={styles.aiLogoText}>P</Text>
          </View>
          <Text style={styles.aiPlaceholder}>
            {selfMember
              ? `Ask about ${selfMember.name.split(' ')[0]}'s health…`
              : 'Ask Prakrit AI anything…'}
          </Text>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
        </Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 44 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  greeting: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#A1A1AA' },
  name: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.4, marginTop: 2 },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  emptyScoreCard: {
    backgroundColor: '#F4F4F5',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  emptyScoreText: { fontFamily: 'Inter-Medium', fontSize: 14, color: '#71717A', textAlign: 'center' },
  statGrid: { flex: 1 },
  statsTop: { flexDirection: 'row', marginBottom: 8 },
  statTile: {
    backgroundColor: '#F4F4F5',
    borderRadius: 10,
    padding: 10,
  },
  statTileTeal: {
    backgroundColor: '#E8FDF8',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statMemberName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#09090B', marginTop: 2 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 2 },
  statNum: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#09090B' },
  statUnit: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A', marginTop: 1 },
  statNormal: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#007A64', marginTop: 1 },
  trendBanner: {
    backgroundColor: '#E8FDF8',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  trendText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: '#007A64' },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15, color: '#09090B' },
  seeAll: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#00B894' },

  familyScroll: { overflow: 'visible' },
  familyChip: { alignItems: 'center', marginRight: 18 },
  ringWrap: { position: 'relative', width: 52, height: 52 },
  ringScore: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScoreText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' },
  familyName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#71717A',
    marginTop: 5,
    textAlign: 'center',
  },
  addMemberRing: {
    backgroundColor: '#F4F4F5',
    borderRadius: 26,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E4E4E7',
    borderStyle: 'dashed',
  },
  addMemberPlus: { fontSize: 22, color: '#A1A1AA' },

  emptyReminders: {
    backgroundColor: '#F4F4F5',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  emptyRemindersText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },

  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 8,
  },
  checkDone: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#00B894',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkEmpty: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#E4E4E7',
    flexShrink: 0,
  },
  reminderMed: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  reminderMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  reminderStatus: { fontFamily: 'Inter-Medium', fontSize: 12 },

  aiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090B',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  aiLogo: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  aiLogoText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#FFFFFF' },
  aiPlaceholder: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },

  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
});
