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
import { Avatar } from '../../../components/ui/Avatar';
import { useMedications, useMarkMedicationTaken } from '../../../lib/queries/medications';

const TIME_LABEL_MAP: Record<string, string> = {
  Morning: '8:00 AM',
  Afternoon: '1:00 PM',
  Evening: '6:00 PM',
  Bedtime: '10:00 PM',
};

const MEMBER_COLORS = ['#00B894', '#D4A017', '#F472B6', '#60A5FA', '#A78BFA'];

function memberColor(name: string) {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return MEMBER_COLORS[n % MEMBER_COLORS.length];
}

export default function Medications() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const { data: medications, isLoading, error } = useMedications();
  const markTaken = useMarkMedicationTaken();

  const todaySchedule = (medications ?? []).flatMap((med) => {
    const memberName = (med as any).family_members?.name ?? 'Unknown';
    return (med.times_of_day ?? []).map((slot) => ({
      medId: med.id,
      medName: med.name,
      familyMemberId: med.family_member_id,
      memberName,
      slot,
      displayTime: TIME_LABEL_MAP[slot] ?? slot,
      color: memberColor(memberName),
    }));
  });

  const handleMarkTaken = useCallback(
    async (medId: string, familyMemberId: string, slot: string) => {
      const today = new Date().toISOString().split('T')[0];
      const hour = parseInt(TIME_LABEL_MAP[slot]?.split(':')[0] ?? '8', 10);
      const scheduledTime = `${today}T${String(hour).padStart(2, '0')}:00:00+00:00`;
      try {
        await markTaken.mutateAsync({ medicationId: medId, familyMemberId, scheduledTime });
      } catch {
        // silent — user sees no change
      }
    },
    [markTaken],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <Text style={styles.title}>Medications</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(tabs)/medications/add' as any)}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar (today view only) */}
      {activeTab === 'today' && todaySchedule.length > 0 && (
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>Today's Schedule</Text>
            <Text style={styles.progressValue}>{todaySchedule.length} dose{todaySchedule.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
      )}

      {/* Tab switch */}
      <View style={styles.tabRow}>
        {(['today', 'all'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'today' ? "Today's Schedule" : 'All Medications'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00B894" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load medications.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {activeTab === 'today' ? (
            todaySchedule.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No medications scheduled</Text>
                <Text style={styles.emptyText}>Add a medication to see today's schedule.</Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/(tabs)/medications/add' as any)}
                >
                  <Text style={styles.emptyBtnText}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            ) : (
              todaySchedule.map((item, idx) => (
                <View key={`${item.medId}-${item.slot}-${idx}`} style={styles.scheduleRow}>
                  <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.schedMed}>{item.medName}</Text>
                    <Text style={styles.schedMeta}>{item.memberName} · {item.displayTime}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={() => handleMarkTaken(item.medId, item.familyMemberId, item.slot)}
                  >
                    <Text style={styles.checkBtnText}>Take</Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          ) : (
            (medications ?? []).length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No medications yet</Text>
                <Text style={styles.emptyText}>Add medications for your family members.</Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push('/(tabs)/medications/add' as any)}
                >
                  <Text style={styles.emptyBtnText}>Add Medication</Text>
                </TouchableOpacity>
              </View>
            ) : (
              (medications ?? []).map((med) => {
                const memberName = (med as any).family_members?.name ?? 'Unknown';
                return (
                  <TouchableOpacity
                    key={med.id}
                    style={styles.medCard}
                    onPress={() => router.push(`/(tabs)/medications/${med.id}` as any)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.medTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.medName}>{med.name}</Text>
                        <Text style={styles.medMeta}>
                          {memberName} · {med.frequency}
                        </Text>
                        {med.notes && (
                          <Text style={styles.medCondition} numberOfLines={1}>{med.notes}</Text>
                        )}
                      </View>
                      <Avatar name={memberName} size={36} />
                    </View>
                    <View style={styles.timesRow}>
                      {(med.times_of_day ?? []).map((t) => (
                        <View key={t} style={styles.timePill}>
                          <Text style={styles.timePillText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })
            )
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
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 8,
  },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: '#09090B' },
  addBtn: {
    backgroundColor: '#09090B',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFFFFF' },

  progressCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 12,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  progressValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#00B894' },
  progressBar: { height: 8, backgroundColor: '#F4F4F5', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, width: '30%', backgroundColor: '#00B894', borderRadius: 4 },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#F4F4F5',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  tabTextActive: { color: '#09090B', fontFamily: 'Inter-SemiBold' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#71717A' },

  content: { paddingHorizontal: 24 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#09090B' },
  emptyText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#71717A', textAlign: 'center' },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: '#09090B',
    borderRadius: 13,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    marginBottom: 8,
    overflow: 'hidden',
    gap: 12,
    paddingRight: 14,
    paddingVertical: 14,
  },
  colorBar: { width: 4, alignSelf: 'stretch' },
  schedMed: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  schedMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  checkBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  checkBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#09090B' },

  medCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 12,
  },
  medTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  medName: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15, color: '#09090B' },
  medMeta: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', marginTop: 2 },
  medCondition: { fontFamily: 'Inter-Medium', fontSize: 11, color: '#00B894', marginTop: 4 },
  timesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  timePill: {
    backgroundColor: '#F4F4F5',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timePillText: { fontFamily: 'Inter-Medium', fontSize: 11, color: '#71717A' },
});
