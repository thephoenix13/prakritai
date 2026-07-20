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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useMedication } from '../../../lib/queries/medications';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth-context';

function useRecentMedLogs(medicationId: string | undefined) {
  const { userId } = useAuth();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return useQuery({
    queryKey: ['medication_logs', userId, 'recent', medicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_logs')
        .select('id, scheduled_time, status, taken_at')
        .eq('medication_id', medicationId!)
        .eq('user_id', userId!)
        .gte('scheduled_time', thirtyDaysAgo)
        .order('scheduled_time', { ascending: false })
        .limit(14);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId && !!medicationId,
    staleTime: 1000 * 60,
  });
}

export default function MedicationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const medQuery  = useMedication(id);
  const logsQuery = useRecentMedLogs(id);

  const med  = medQuery.data;
  const logs = logsQuery.data ?? [];

  const memberName = (med as any)?.family_members?.name as string | undefined;

  const taken = logs.filter((l: any) => l.status === 'taken').length;
  const adherencePct = logs.length > 0 ? Math.round((taken / logs.length) * 100) : null;

  const startDateStr = med?.start_date
    ? new Date(med.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const endDateStr = med?.end_date
    ? new Date(med.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Ongoing';

  const handleEdit = useCallback(() => {
    router.push(`/(tabs)/medications/edit/${id}` as any);
  }, [router, id]);

  if (medQuery.isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <ActivityIndicator size="large" color="#00B894" />
      </View>
    );
  }

  if (!med) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <Text style={styles.errorText}>Medication not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timesOfDay: string[] = Array.isArray(med.times_of_day) ? med.times_of_day : [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{med.name}</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.navCta}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.medIconBox}>
            <Text style={{ fontSize: 28 }}>💊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.medName}>{med.name}{med.dosage ? ` ${med.dosage}` : ''}</Text>
            {memberName && <Text style={styles.medMeta}>For {memberName}</Text>}
            {med.frequency && <Text style={styles.medFreq}>{med.frequency}</Text>}
          </View>
          {!med.is_active && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inactive</Text>
            </View>
          )}
        </View>

        {/* ── Adherence ring ── */}
        {adherencePct !== null && (
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceLeft}>
              <Text style={styles.adherenceNum}>{adherencePct}%</Text>
              <Text style={styles.adherenceLabel}>30-day adherence</Text>
            </View>
            <View style={styles.adherenceBar}>
              <View style={styles.adherenceBarBg}>
                <View
                  style={[
                    styles.adherenceBarFill,
                    {
                      width: `${adherencePct}%` as any,
                      backgroundColor: adherencePct >= 80 ? '#00B894' : adherencePct >= 50 ? '#D4A017' : '#EF4444',
                    },
                  ]}
                />
              </View>
              <Text style={styles.adherenceCount}>{taken} of {logs.length} doses taken</Text>
            </View>
          </View>
        )}

        {/* ── Schedule ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Frequency</Text>
              <Text style={styles.infoVal}>{med.frequency ?? '—'}</Text>
            </View>
            {timesOfDay.length > 0 && (
              <View style={[styles.infoRow, styles.infoBorder]}>
                <Text style={styles.infoKey}>Times</Text>
                <Text style={styles.infoVal}>{timesOfDay.join(' · ')}</Text>
              </View>
            )}
            {med.with_food && (
              <View style={[styles.infoRow, styles.infoBorder]}>
                <Text style={styles.infoKey}>With food</Text>
                <Text style={styles.infoVal}>{med.with_food}</Text>
              </View>
            )}
            <View style={[styles.infoRow, styles.infoBorder]}>
              <Text style={styles.infoKey}>Started</Text>
              <Text style={styles.infoVal}>{startDateStr}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoBorder]}>
              <Text style={styles.infoKey}>Until</Text>
              <Text style={styles.infoVal}>{endDateStr}</Text>
            </View>
            {med.form && (
              <View style={[styles.infoRow, styles.infoBorder]}>
                <Text style={styles.infoKey}>Form</Text>
                <Text style={styles.infoVal}>{med.form}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Notes / Instructions ── */}
        {med.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{med.notes}</Text>
            </View>
          </View>
        )}

        {/* ── Recent log ── */}
        {logs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Adherence</Text>
            {logs.map((entry: any) => {
              const isTaken = entry.status === 'taken';
              const dateStr = new Date(entry.scheduled_time).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short',
              });
              const timeStr = new Date(entry.scheduled_time).toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit', hour12: true,
              });
              return (
                <View key={entry.id} style={styles.logRow}>
                  <View
                    style={[styles.logDot, { backgroundColor: isTaken ? '#00B894' : '#F4F4F5', borderColor: isTaken ? '#00B894' : '#E4E4E7' }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.logDate}>{dateStr} · {timeStr}</Text>
                  </View>
                  <View style={[styles.logBadge, { backgroundColor: isTaken ? '#CCFBF1' : '#FEE2E2' }]}>
                    <Text style={[styles.logBadgeText, { color: isTaken ? '#00725E' : '#b91c1c' }]}>
                      {isTaken ? 'Taken' : 'Missed'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
  navTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B',
    flex: 1, textAlign: 'center', marginHorizontal: 8,
  },
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
    marginBottom: 12,
  },
  medIconBox: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' },
  medName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: '#09090B' },
  medMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  medFreq: { fontFamily: 'Inter-Medium', fontSize: 12, color: '#00B894', marginTop: 4 },
  inactiveBadge: { backgroundColor: '#F4F4F5', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  inactiveBadgeText: { fontFamily: 'Inter-Medium', fontSize: 11, color: '#71717A' },

  adherenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  adherenceLeft: { alignItems: 'center', minWidth: 60 },
  adherenceNum: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: '#09090B' },
  adherenceLabel: { fontFamily: 'Inter-Regular', fontSize: 10, color: '#71717A', textAlign: 'center', marginTop: 2 },
  adherenceBar: { flex: 1 },
  adherenceBarBg: { height: 8, backgroundColor: '#F4F4F5', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  adherenceBarFill: { height: 8, borderRadius: 4 },
  adherenceCount: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A' },

  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B', marginBottom: 10 },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  infoBorder: { borderTopWidth: 1, borderTopColor: '#E4E4E7' },
  infoKey: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' },
  infoVal: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#09090B', maxWidth: '60%', textAlign: 'right' },

  notesCard: {
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
  },
  notesText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', lineHeight: 20 },

  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 12,
    marginBottom: 6,
    gap: 10,
  },
  logDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  logDate: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' },
  logBadge: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  logBadgeText: { fontFamily: 'Inter-Medium', fontSize: 11 },

  disclaimer: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', textAlign: 'center' },
});
