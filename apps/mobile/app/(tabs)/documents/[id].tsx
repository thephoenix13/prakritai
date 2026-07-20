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
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDocument } from '../../../lib/queries/documents';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  normal:     { bg: '#CCFBF1', text: '#00725E' },
  borderline: { bg: '#FEF3C7', text: '#8a5e0a' },
  high:       { bg: '#FEE2E2', text: '#b91c1c' },
  low:        { bg: '#E0E7FF', text: '#3730a3' },
  abnormal:   { bg: '#FEE2E2', text: '#b91c1c' },
};

const DOC_ICON: Record<string, string> = {
  'Lab Report': '🧪',
  'Prescription': '💊',
  'Scan': '🔬',
  'Hospital Discharge': '🏥',
  'Other': '📄',
};

export default function DocumentDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: doc, isLoading, error } = useDocument(id);

  const handleShare = async () => {
    if (!doc) return;
    try {
      await Share.share({
        title: doc.title,
        message: `${doc.title}\n${doc.document_type ?? 'Document'}\nvia PrakritAI`,
      });
    } catch {
      // user cancelled
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <ActivityIndicator size="large" color="#00B894" />
      </View>
    );
  }

  if (error || !doc) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <Text style={styles.errorText}>Document not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const analysis = doc.ai_analysis as any;
  const memberName = (doc as any).family_members?.name as string | undefined;
  const dateStr = new Date(doc.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const labValues: any[] = analysis?.lab_values ?? analysis?.findings ?? [];
  const recommendations: string[] = Array.isArray(analysis?.recommendations)
    ? analysis.recommendations
    : [];
  const docIcon = DOC_ICON[doc.document_type ?? 'Other'] ?? '📄';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{doc.document_type ?? 'Document'}</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.navCta}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.docIconBox}>
            <Text style={{ fontSize: 28 }}>{docIcon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.docTitle}>{doc.title}</Text>
            <Text style={styles.docMeta}>{doc.document_type ?? 'Document'} · {dateStr}</Text>
            {memberName && <Text style={styles.docMeta}>{memberName}</Text>}
            {doc.facility && <Text style={styles.docMeta}>{doc.facility}</Text>}
          </View>
        </View>

        {/* ── AI not yet processed ── */}
        {!analysis && (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingTitle}>Analysis pending</Text>
            <Text style={styles.pendingText}>
              Prakrit AI is processing this document. Results usually appear within a minute.
            </Text>
          </View>
        )}

        {/* ── AI Summary ── */}
        {analysis?.summary && (
          <View style={styles.insightCard}>
            <View style={styles.insightBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.insightLabel}>AI Analysis</Text>
              <Text style={styles.insightText}>{analysis.summary}</Text>
            </View>
          </View>
        )}

        {/* ── Lab values / Findings ── */}
        {labValues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Findings</Text>
            {labValues.map((f: any, i: number) => {
              const statusKey = (f.status ?? 'normal').toLowerCase();
              const colors = STATUS_COLORS[statusKey] ?? STATUS_COLORS.normal;
              return (
                <View key={`${f.label ?? f.name ?? i}`} style={styles.findingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.findingLabel}>{f.label ?? f.name ?? `Finding ${i + 1}`}</Text>
                    {f.reference && (
                      <Text style={styles.findingRef}>Ref: {f.reference}</Text>
                    )}
                  </View>
                  <View style={styles.findingRight}>
                    <Text style={styles.findingValue}>{f.value}</Text>
                    {f.unit && <Text style={styles.findingUnit}>{f.unit}</Text>}
                  </View>
                  {f.status && (
                    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                      <Text style={[styles.statusText, { color: colors.text }]}>
                        {f.status}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── Recommendations ── */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendCard}>
              {recommendations.map((r: string, i: number) => (
                <View key={i} style={[styles.recommendRow, i > 0 && styles.recommendRowBorder]}>
                  <Text style={styles.recommendBullet}>·</Text>
                  <Text style={styles.recommendText}>{r}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── CTA ── */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(tabs)/ai' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Ask Prakrit AI About This Report</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  errorText: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B', marginBottom: 12 },
  backLink: { marginTop: 8 },
  backLinkText: { fontFamily: 'Inter-Medium', fontSize: 14, color: '#00B894' },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: '#09090B' },
  navTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  navCta: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#00B894' },
  content: { paddingHorizontal: 20 },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 16,
  },
  docIconBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center',
  },
  docTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#09090B' },
  docMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },

  pendingCard: {
    backgroundColor: '#FEF3C7', borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A',
    padding: 14, marginBottom: 16,
  },
  pendingTitle: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#8a5e0a', marginBottom: 4 },
  pendingText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#8a5e0a', lineHeight: 18 },

  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  insightBar: { width: 3, borderRadius: 2, backgroundColor: '#00B894' },
  insightLabel: {
    fontFamily: 'Inter-SemiBold', fontSize: 11, color: '#00B894',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  insightText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', lineHeight: 20 },

  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B', marginBottom: 12 },

  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  findingLabel: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  findingRef: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 },
  findingRight: { alignItems: 'flex-end' },
  findingValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#09090B' },
  findingUnit: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A' },
  statusBadge: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: 'Inter-Medium', fontSize: 11, textTransform: 'capitalize' },

  recommendCard: {
    backgroundColor: '#E8FDF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    overflow: 'hidden',
  },
  recommendRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 8 },
  recommendRowBorder: { borderTopWidth: 1, borderTopColor: '#CCFBF1' },
  recommendBullet: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#00B894', lineHeight: 20, marginTop: -1 },
  recommendText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#00725E', lineHeight: 20, flex: 1 },

  primaryBtn: {
    backgroundColor: '#09090B',
    borderRadius: 13,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  disclaimer: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', textAlign: 'center' },
});
