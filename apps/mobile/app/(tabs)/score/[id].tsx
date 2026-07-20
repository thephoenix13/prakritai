import React from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { GradeBadge, gradeFromScore } from '../../../components/ui/GradeBadge';
import { useFamilyMember } from '../../../lib/queries/family';
import { useCachedHealthScore, useGenerateHealthScore } from '../../../lib/queries/health-score';

const BREAKDOWN_KEYS = [
  'metabolic',
  'cardiovascular',
  'weight',
  'adherence',
  'preventive',
] as const;

const BREAKDOWN_LABELS: Record<typeof BREAKDOWN_KEYS[number], string> = {
  metabolic: 'Metabolic',
  cardiovascular: 'Cardiovascular',
  weight: 'Weight',
  adherence: 'Adherence',
  preventive: 'Preventive',
};

function formatComputedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function BackChevron() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke="#09090B"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TopNav({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <BackChevron />
      </TouchableOpacity>
      <Text style={styles.navTitle}>Health Score</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

export default function HealthScore() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const memberQuery = useFamilyMember(id);
  const scoreQuery = useCachedHealthScore(id);
  const generateScore = useGenerateHealthScore();

  const member = memberQuery.data;
  const score = scoreQuery.data;
  const isLoading = memberQuery.isLoading || scoreQuery.isLoading;

  const handleGenerate = () => {
    if (id) generateScore.mutate(id);
  };

  // Full-screen loading
  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <ActivityIndicator size="large" color="#00B894" />
      </View>
    );
  }

  // No cached score yet
  if (!score) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <TopNav onBack={() => router.back()} />
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No Health Score Yet</Text>
          <Text style={styles.emptyBody}>
            Generate {member?.name ?? 'this member'}'s AI health score from their uploaded
            documents.
          </Text>
          {generateScore.isPending ? (
            <View style={styles.generatingBox}>
              <ActivityIndicator color="#00B894" />
              <Text style={styles.generatingText}>Computing your health score with AI…</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerate}
              activeOpacity={0.8}
            >
              <Text style={styles.generateBtnText}>Generate Health Score</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <TopNav onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Score hero */}
        <View style={styles.hero}>
          <Text style={styles.scoreNum}>
            {score.score}
            <Text style={styles.scoreDenom}>/100</Text>
          </Text>
          <Text style={styles.heroSub}>
            {member?.name ?? '—'}
            {score.computed_at ? ` · ${formatComputedAt(score.computed_at)}` : ''}
          </Text>
        </View>

        {/* Breakdown section */}
        <Text style={styles.sectionLabel}>BREAKDOWN</Text>
        <View style={styles.card}>
          <View style={styles.systemList}>
            {BREAKDOWN_KEYS.map((key, i) => {
              const val = score.breakdown?.[key] ?? 0;
              const g = gradeFromScore(val);
              return (
                <View
                  key={key}
                  style={[styles.sysRow, i < BREAKDOWN_KEYS.length - 1 && styles.sysRowBorder]}
                >
                  <GradeBadge grade={g} size={24} fontSize={10} />
                  <Text style={styles.sysName}>{BREAKDOWN_LABELS[key]}</Text>
                  <Text style={styles.sysScore}>{val}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top concern */}
        {score.top_concern ? (
          <View style={styles.concernCard}>
            <Text style={styles.concernLabel}>TOP CONCERN</Text>
            <Text style={styles.concernText}>{score.top_concern}</Text>
          </View>
        ) : null}

        {/* Positive */}
        {score.positive ? (
          <View style={styles.positiveCard}>
            <Text style={styles.positiveLabel}>POSITIVE</Text>
            <Text style={styles.positiveText}>{score.positive}</Text>
          </View>
        ) : null}

        {/* AI summary note */}
        <View style={styles.aiNote}>
          <Text style={styles.aiNoteLabel}>PRAKRIT AI</Text>
          <Text style={styles.aiNoteText}>{score.summary}</Text>
          <Text style={styles.aiDisclaimer}>
            Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
          </Text>
        </View>

        {/* Refresh button */}
        {generateScore.isPending ? (
          <View style={styles.generatingBox}>
            <ActivityIndicator color="#00B894" />
            <Text style={styles.generatingText}>Computing your health score with AI…</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.refreshBtn} onPress={handleGenerate} activeOpacity={0.8}>
            <Text style={styles.refreshBtnText}>Refresh Score</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: '#09090B' },

  content: { paddingHorizontal: 24 },

  hero: { alignItems: 'center', paddingVertical: 20 },
  scoreNum: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 56,
    color: '#09090B',
    letterSpacing: -1,
  },
  scoreDenom: { fontFamily: 'SpaceGrotesk-Regular', fontSize: 22, color: '#71717A' },
  heroSub: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#A1A1AA', marginTop: 4 },

  sectionLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 20,
    overflow: 'hidden',
  },
  systemList: { paddingHorizontal: 16 },
  sysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  sysRowBorder: { borderBottomWidth: 1, borderBottomColor: '#E4E4E7' },
  sysName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B', flex: 1 },
  sysScore: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14, color: '#71717A' },

  concernCard: {
    backgroundColor: '#FCE7F3',
    borderLeftWidth: 3,
    borderLeftColor: '#F472B6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  concernLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#be185d',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  concernText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B', lineHeight: 19 },

  positiveCard: {
    backgroundColor: '#E8FDF8',
    borderLeftWidth: 3,
    borderLeftColor: '#00B894',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  positiveLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#007A64',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  positiveText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B', lineHeight: 19 },

  aiNote: {
    backgroundColor: '#F4F4F5',
    borderLeftWidth: 3,
    borderLeftColor: '#09090B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  aiNoteLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  aiNoteText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B', lineHeight: 19 },
  aiDisclaimer: { fontFamily: 'Inter-Regular', fontSize: 10, color: '#A1A1AA', marginTop: 8 },

  refreshBtn: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  refreshBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' },

  generateBtn: {
    height: 50,
    borderRadius: 13,
    backgroundColor: '#00B894',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  generateBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  emptyTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: '#09090B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 20,
  },

  generatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  generatingText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#71717A' },
});
