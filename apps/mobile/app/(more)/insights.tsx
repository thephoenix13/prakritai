import React, { useState, useCallback } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { useFamilyMembers } from '../../lib/queries/family';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarkerItem {
  marker: string;
  value: string;
  trend?: string;
}

interface InsightResult {
  summary: string;
  improving: MarkerItem[];
  declining: MarkerItem[];
  stable: MarkerItem[];
  recommendations: string[];
}

interface PastInsight {
  id: string;
  created_at: string;
  summary: string;
  family_member_id: string;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Insights() {
  const router = useRouter();
  const { userId } = useAuth();

  const { data: members = [] } = useFamilyMembers();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resolve effective member id (default to first member)
  const effectiveMemberId = selectedMemberId ?? members[0]?.id ?? null;

  // Past insights
  const { data: pastInsights = [], refetch: refetchPast } = useQuery({
    queryKey: ['ai_health_insights', effectiveMemberId],
    queryFn: async () => {
      if (!effectiveMemberId) return [];
      const { data, error } = await supabase
        .from('ai_health_insights')
        .select('*')
        .eq('family_member_id', effectiveMemberId)
        .eq('status', 'complete')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as PastInsight[];
    },
    enabled: !!effectiveMemberId,
  });

  const handleGenerate = useCallback(async () => {
    if (!effectiveMemberId) return;
    setGenerating(true);
    setResult(null);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'generate-health-insights',
        { body: { family_member_id: effectiveMemberId } },
      );
      if (fnError) throw fnError;
      setResult(data as InsightResult);
      refetchPast();
    } catch {
      setError('Could not generate insights. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [effectiveMemberId, refetchPast]);

  const selectedMember = members.find((m) => m.id === effectiveMemberId);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Health Insights</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Member picker */}
      {members.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {members.map((m) => {
            const active = m.id === effectiveMemberId;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  setSelectedMemberId(m.id);
                  setResult(null);
                  setError(null);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {m.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={generating || !effectiveMemberId}
          activeOpacity={0.85}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.generateBtnText}>Generate Insights</Text>
          )}
        </TouchableOpacity>

        {/* Error */}
        {!!error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Generated result ──────────────────────────────────────────────── */}
        {result && (
          <>
            {/* Summary */}
            <View style={styles.card}>
              <Text style={styles.cardSectionLabel}>Summary</Text>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>

            {/* Improving */}
            {result.improving.length > 0 && (
              <View style={styles.card}>
                <Text style={[styles.cardSectionLabel, styles.tealLabel]}>↑ Improving</Text>
                {result.improving.map((item, i) => (
                  <View key={i} style={[styles.markerRow, i > 0 && styles.markerRowBorder]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.markerName}>{item.marker}</Text>
                      <Text style={styles.markerValue}>{item.value}</Text>
                    </View>
                    {!!item.trend && (
                      <View style={styles.tealBadge}>
                        <Text style={styles.tealBadgeText}>{item.trend}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Declining */}
            {result.declining.length > 0 && (
              <View style={styles.card}>
                <Text style={[styles.cardSectionLabel, styles.redLabel]}>↓ Needs Attention</Text>
                {result.declining.map((item, i) => (
                  <View key={i} style={[styles.markerRow, i > 0 && styles.markerRowBorder]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.markerName}>{item.marker}</Text>
                      <Text style={styles.markerValue}>{item.value}</Text>
                    </View>
                    {!!item.trend && (
                      <View style={styles.redBadge}>
                        <Text style={styles.redBadgeText}>{item.trend}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Stable */}
            {result.stable.length > 0 && (
              <View style={styles.card}>
                <Text style={[styles.cardSectionLabel, styles.grayLabel]}>→ Stable</Text>
                {result.stable.map((item, i) => (
                  <View key={i} style={[styles.stableRow, i > 0 && styles.markerRowBorder]}>
                    <Text style={styles.stableMarker}>{item.marker}</Text>
                    <Text style={styles.stableValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardSectionLabel}>Recommendations</Text>
                {result.recommendations.map((rec, i) => (
                  <View key={i} style={styles.recRow}>
                    <View style={styles.recNum}>
                      <Text style={styles.recNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── Empty state (no result yet) ───────────────────────────────────── */}
        {!result && !generating && !error && (
          <>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyTitle}>Generate AI insights</Text>
              <Text style={styles.emptySubtitle}>
                {selectedMember
                  ? `Analyse ${selectedMember.name}'s health documents to surface trends, gaps, and recommendations.`
                  : 'Select a family member above and tap Generate Insights.'}
              </Text>
            </View>

            {/* Past insights */}
            {pastInsights.length > 0 && (
              <>
                <Text style={styles.pastHeader}>Previous Insights</Text>
                {pastInsights.map((pi) => (
                  <View key={pi.id} style={styles.pastCard}>
                    <Text style={styles.pastDate}>
                      {new Date(pi.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.pastSummary} numberOfLines={3}>
                      {pi.summary}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* Medical disclaimer */}
        <Text style={styles.disclaimer}>
          Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
        </Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: '#09090B' },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B' },

  chipRow: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  chipActive: {
    backgroundColor: '#09090B',
    borderColor: '#09090B',
  },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  chipTextActive: { color: '#FFFFFF' },

  content: { paddingHorizontal: 20 },

  generateBtn: {
    backgroundColor: '#00B894',
    borderRadius: 13,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { fontFamily: 'Inter-Medium', fontSize: 14, color: '#b91c1c', textAlign: 'center' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 12,
  },
  cardSectionLabel: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 13,
    color: '#71717A',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tealLabel: { color: '#00725E' },
  redLabel: { color: '#b91c1c' },
  grayLabel: { color: '#71717A' },

  summaryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#09090B',
    lineHeight: 22,
  },

  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  markerRowBorder: { borderTopWidth: 1, borderTopColor: '#E4E4E7' },
  markerName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  markerValue: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },

  tealBadge: {
    backgroundColor: '#CCFBF1',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  tealBadgeText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: '#00725E' },

  redBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  redBadgeText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: '#b91c1c' },

  stableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  stableMarker: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B' },
  stableValue: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },

  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  recNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  recNumText: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: '#71717A' },
  recText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', lineHeight: 20, flex: 1 },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 17,
    color: '#09090B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 19,
  },

  pastHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  pastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 10,
  },
  pastDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#A1A1AA',
    marginBottom: 6,
  },
  pastSummary: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#71717A',
    lineHeight: 19,
  },

  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
});
