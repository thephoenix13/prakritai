import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { ScoreRing } from '../../../components/ui/ScoreRing';
import { GradeBadge, gradeFromScore } from '../../../components/ui/GradeBadge';
import { Avatar } from '../../../components/ui/Avatar';
import { useFamilyMembers } from '../../../lib/queries/family';
import { useCachedHealthScore } from '../../../lib/queries/health-score';
import { calculateBmi, getBmiCategory } from '@prakritai/shared';

// Separate component so each card can call its own hook (hooks can't be in .map())
const MemberCard = React.memo(({ m, onPress }: { m: any; onPress: (id: string) => void }) => {
  const { data: healthScore } = useCachedHealthScore(m.id);
  const score = healthScore?.score ?? null;
  const grade = healthScore?.grade ?? null;
  const bmiVal = m.height_cm && m.weight_kg
    ? calculateBmi(Number(m.height_cm), Number(m.weight_kg))
    : null;
  const bmiCategory = bmiVal ? getBmiCategory(bmiVal) : null;
  const hasAlert = bmiCategory === 'Obese' || bmiCategory === 'Overweight';

  return (
    <TouchableOpacity
      style={[styles.memberCard, hasAlert && styles.memberCardAlert]}
      onPress={() => onPress(m.id)}
      activeOpacity={0.85}
    >
      <View style={styles.memberLeft}>
        <Avatar name={m.name} size={48} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.memberName}>{m.name.split(' ')[0]}</Text>
            {m.relationship === 'Self' && (
              <View style={styles.meTag}><Text style={styles.meTagText}>Me</Text></View>
            )}
          </View>
          <Text style={styles.memberMeta}>
            {m.relationship}
            {m.date_of_birth ? ` · ${new Date().getFullYear() - new Date(m.date_of_birth).getFullYear()} yrs` : ''}
          </Text>
          {bmiVal && (
            <Text style={styles.memberBmi}>BMI {bmiVal.toFixed(1)} · {bmiCategory}</Text>
          )}
        </View>
      </View>
      <View style={styles.memberRight}>
        {score !== null ? (
          <>
            <ScoreRing score={score} size={60} strokeWidth={5} showScore />
            <GradeBadge grade={grade ?? gradeFromScore(score)} size={24} fontSize={11} />
          </>
        ) : (
          <View style={styles.noScore}>
            <Text style={styles.noScoreText}>—</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function FamilyHub() {
  const router = useRouter();
  const { data: members, isLoading, error } = useFamilyMembers();

  const onMemberPress = useCallback(
    (id: string) => router.push(`/(tabs)/family/${id}` as any),
    [router],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Family</Text>
          <Text style={styles.subtitle}>
            {members ? `${members.length} member${members.length !== 1 ? 's' : ''}` : 'Loading…'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(tabs)/family/add' as any)}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00B894" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load family members.</Text>
          <Text style={styles.errorSub}>Check your connection and try again.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {members && members.length > 0 ? (
            members.map((m) => (
              <MemberCard key={m.id} m={m} onPress={onMemberPress} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No family members yet</Text>
              <Text style={styles.emptyText}>
                Add your first family member to start tracking their health.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/(tabs)/family/add' as any)}
              >
                <Text style={styles.emptyBtnText}>Add Family Member</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add member card */}
          {members && members.length > 0 && (
            <TouchableOpacity
              style={styles.addCard}
              onPress={() => router.push('/(tabs)/family/add' as any)}
              activeOpacity={0.75}
            >
              <Text style={styles.addIcon}>+</Text>
              <Text style={styles.addText}>Add Family Member</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.4 },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginTop: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#09090B',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  errorText: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15, color: '#09090B' },
  errorSub: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' },

  memberCardAlert: { borderWidth: 1.5, borderColor: '#FBCFE8' },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B' },
  meTag: { backgroundColor: '#E8FDF8', borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2 },
  meTagText: { fontFamily: 'Inter-Medium', fontSize: 11, color: '#00725E' },
  memberMeta: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', marginTop: 2 },
  memberBmi: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 },
  memberRight: { alignItems: 'center', gap: 4, marginLeft: 8 },
  noScore: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' },
  noScoreText: { fontFamily: 'Inter-Medium', fontSize: 18, color: '#A1A1AA' },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#09090B' },
  emptyText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#71717A', textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: '#09090B',
    borderRadius: 13,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  addCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderStyle: 'dashed',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  addIcon: { fontSize: 20, color: '#A1A1AA' },
  addText: { fontFamily: 'Inter-Medium', fontSize: 14, color: '#71717A' },
});
