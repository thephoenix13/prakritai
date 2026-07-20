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
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { ScoreRing } from '../../../components/ui/ScoreRing';
import { GradeBadge, gradeFromScore } from '../../../components/ui/GradeBadge';
import { Avatar } from '../../../components/ui/Avatar';
import { useFamilyMember, useDeleteFamilyMember } from '../../../lib/queries/family';
import { useMedications } from '../../../lib/queries/medications';
import { useDocuments } from '../../../lib/queries/documents';
import { useCachedHealthScore } from '../../../lib/queries/health-score';
import { calculateBmi, getBmiCategory } from '@prakritai/shared';

const BMI_STATUS: Record<string, { bg: string; text: string }> = {
  Underweight: { bg: '#E0E7FF', text: '#3730a3' },
  Normal:      { bg: '#CCFBF1', text: '#00725E' },
  Overweight:  { bg: '#FEF3C7', text: '#8a5e0a' },
  Obese:       { bg: '#FEE2E2', text: '#b91c1c' },
};

const DOC_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'Lab Report':         { bg: '#CCFBF1', text: '#00725E' },
  'Prescription':       { bg: '#FEF3C7', text: '#8a5e0a' },
  'Scan':               { bg: '#E0E7FF', text: '#3730a3' },
  'Hospital Discharge': { bg: '#FCE7F3', text: '#be185d' },
  'Other':              { bg: '#F4F4F5', text: '#71717A' },
};

export default function MemberDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const memberQuery  = useFamilyMember(id);
  const scoreQuery   = useCachedHealthScore(id);
  const medsQuery    = useMedications(id);
  const docsQuery    = useDocuments(id);
  const deleteMember = useDeleteFamilyMember();

  const member = memberQuery.data;
  const score  = scoreQuery.data;
  const meds   = (medsQuery.data ?? []).slice(0, 5);
  const docs   = (docsQuery.data ?? []).slice(0, 3);

  const ageYears = member?.date_of_birth
    ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const bmi = member?.height_cm && member?.weight_kg
    ? calculateBmi(Number(member.height_cm), Number(member.weight_kg))
    : null;
  const bmiCategory = bmi ? getBmiCategory(bmi) : null;
  const bmiColors   = bmiCategory ? BMI_STATUS[bmiCategory] ?? BMI_STATUS.Normal : null;

  const grade = score ? gradeFromScore(score.score) : null;

  const handleDelete = useCallback(() => {
    if (!member) return;
    Alert.alert(
      `Remove ${member.name}?`,
      'This will remove them from your family. Their health records will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteMember.mutateAsync(member.id);
            router.back();
          },
        },
      ],
    );
  }, [member, deleteMember, router]);

  if (memberQuery.isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <ActivityIndicator size="large" color="#00B894" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <Text style={styles.errorText}>Member not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{member.name.split(' ')[0]}'s Profile</Text>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/score/${member.id}` as any)}>
          <Text style={styles.navCta}>Score →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Avatar name={member.name} size={56} />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.heroName}>{member.name}</Text>
                {member.relationship === 'Self' && (
                  <View style={styles.meTag}><Text style={styles.meTagText}>Me</Text></View>
                )}
              </View>
              <Text style={styles.heroMeta}>
                {member.relationship}{ageYears ? ` · ${ageYears} yrs` : ''}{member.gender ? ` · ${member.gender}` : ''}
              </Text>
              {member.blood_type && member.blood_type !== 'Unknown' && (
                <Text style={styles.heroMeta}>
                  {member.blood_type}
                  {member.height_cm ? ` · ${member.height_cm}cm` : ''}
                  {member.weight_kg ? ` · ${member.weight_kg}kg` : ''}
                </Text>
              )}
            </View>
          </View>
          {score ? (
            <View style={styles.heroRight}>
              <ScoreRing score={score.score} size={70} strokeWidth={6} showScore showGrade />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.noScoreBtn}
              onPress={() => router.push(`/(tabs)/score/${member.id}` as any)}
            >
              <Text style={styles.noScoreBtnText}>Get score</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── BMI tile ── */}
        {bmi !== null && bmiColors && (
          <View style={[styles.bmiCard, { backgroundColor: bmiColors.bg }]}>
            <Text style={[styles.bmiLabel, { color: bmiColors.text }]}>BMI</Text>
            <Text style={[styles.bmiValue, { color: bmiColors.text }]}>{bmi.toFixed(1)}</Text>
            <Text style={[styles.bmiCategory, { color: bmiColors.text }]}>{bmiCategory}</Text>
          </View>
        )}

        {/* ── Score breakdown ── */}
        {score && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Score</Text>
            <View style={styles.scoreCard}>
              <View style={styles.scoreHero}>
                <Text style={styles.scoreNum}>{score.score}</Text>
                <Text style={styles.scoreDenom}>/100</Text>
                {grade && <GradeBadge grade={grade} size={32} fontSize={14} />}
              </View>
              {score.summary ? (
                <Text style={styles.scoreSummary}>{score.summary}</Text>
              ) : null}
              {score.top_concern ? (
                <View style={styles.concernRow}>
                  <Text style={styles.concernIcon}>⚠</Text>
                  <Text style={styles.concernText}>{score.top_concern}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* ── Active medications ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Medications</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/medications' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {medsQuery.isLoading ? (
            <ActivityIndicator size="small" color="#00B894" />
          ) : meds.length === 0 ? (
            <View style={styles.emptySmall}>
              <Text style={styles.emptySmallText}>No active medications</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/medications/add' as any)}>
                <Text style={styles.emptySmallCta}>+ Add medication</Text>
              </TouchableOpacity>
            </View>
          ) : (
            meds.map((med: any) => (
              <TouchableOpacity
                key={med.id}
                style={styles.medRow}
                onPress={() => router.push(`/(tabs)/medications/${med.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.medDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{med.name}{med.dosage ? ` ${med.dosage}` : ''}</Text>
                  <Text style={styles.medFreq}>{med.frequency}</Text>
                </View>
                <Text style={styles.medArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Recent documents ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/documents' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {docsQuery.isLoading ? (
            <ActivityIndicator size="small" color="#00B894" />
          ) : docs.length === 0 ? (
            <View style={styles.emptySmall}>
              <Text style={styles.emptySmallText}>No documents yet</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/documents' as any)}>
                <Text style={styles.emptySmallCta}>+ Upload report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            docs.map((doc: any) => {
              const colors = DOC_TYPE_COLORS[doc.document_type ?? 'Other'] ?? DOC_TYPE_COLORS.Other;
              const dateStr = new Date(doc.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.docRow}
                  onPress={() => router.push(`/(tabs)/documents/${doc.id}` as any)}
                  activeOpacity={0.8}
                >
                  <View style={styles.docIcon}>
                    <Text style={{ fontSize: 18 }}>📄</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
                    <Text style={styles.docMeta}>{dateStr}</Text>
                  </View>
                  <View style={[styles.docTypeBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.docTypeText, { color: colors.text }]}>{doc.document_type}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Actions ── */}
        <TouchableOpacity
          style={styles.aiBtn}
          onPress={() => router.push('/(tabs)/ai' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.aiBtnText}>Ask Prakrit AI about {member.name.split(' ')[0]} →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Remove from Family</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B' },
  navCta: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#00B894' },

  content: { paddingHorizontal: 20 },

  heroCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E4E4E7',
    padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: '#09090B' },
  meTag: { backgroundColor: '#E8FDF8', borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2 },
  meTagText: { fontFamily: 'Inter-Medium', fontSize: 11, color: '#00725E' },
  heroMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 3 },
  heroRight: { marginLeft: 12 },
  noScoreBtn: {
    backgroundColor: '#E8FDF8', borderRadius: 10, borderWidth: 1, borderColor: '#CCFBF1',
    paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8,
  },
  noScoreBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#00725E' },

  bmiCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12,
  },
  bmiLabel: { fontFamily: 'Inter-SemiBold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  bmiValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, flex: 1 },
  bmiCategory: { fontFamily: 'Inter-SemiBold', fontSize: 13 },

  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15, color: '#09090B' },
  seeAll: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#00B894' },

  scoreCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E4E4E7', padding: 16,
  },
  scoreHero: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 },
  scoreNum: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 40, color: '#09090B', letterSpacing: -1 },
  scoreDenom: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#71717A' },
  scoreSummary: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', lineHeight: 19, marginBottom: 8 },
  concernRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  concernIcon: { fontSize: 13, color: '#D4A017', marginTop: 1 },
  concernText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#78350f', flex: 1, lineHeight: 18 },

  emptySmall: { backgroundColor: '#F4F4F5', borderRadius: 12, padding: 16, alignItems: 'center', gap: 6 },
  emptySmallText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' },
  emptySmallCta: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#00B894' },

  medRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E4E4E7',
    padding: 14, marginBottom: 8, gap: 10,
  },
  medDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00B894', flexShrink: 0 },
  medName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  medFreq: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  medArrow: { fontSize: 20, color: '#A1A1AA' },

  docRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E4E4E7',
    padding: 14, marginBottom: 8, gap: 12,
  },
  docIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  docMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  docTypeBadge: { borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 4 },
  docTypeText: { fontFamily: 'Inter-Medium', fontSize: 10 },

  aiBtn: {
    backgroundColor: '#09090B', borderRadius: 13, height: 50,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  aiBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  deleteBtn: {
    height: 44, borderRadius: 13, borderWidth: 1, borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  deleteBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#EF4444' },

  disclaimer: {
    fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA',
    textAlign: 'center', lineHeight: 16,
  },
});
