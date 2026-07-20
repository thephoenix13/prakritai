import React, { useState } from 'react';
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
import { Avatar } from '../../components/ui/Avatar';
import { useFamilyMembers } from '../../lib/queries/family';
import { useTimeline } from '../../lib/queries/timeline';

type EntryType =
  | 'lab_test'
  | 'prescription'
  | 'doctor_visit'
  | 'hospital_visit'
  | 'manual_note'
  | 'medication_started'
  | 'medication_stopped'
  | 'alert_triggered';

const TYPE_META: Record<EntryType, { icon: string; color: string }> = {
  lab_test: { icon: '🧪', color: '#00B894' },
  prescription: { icon: '💊', color: '#F472B6' },
  doctor_visit: { icon: '🩺', color: '#60A5FA' },
  hospital_visit: { icon: '🏥', color: '#EF4444' },
  manual_note: { icon: '📝', color: '#A1A1AA' },
  medication_started: { icon: '✅', color: '#00B894' },
  medication_stopped: { icon: '⛔', color: '#F97316' },
  alert_triggered: { icon: '⚠️', color: '#D4A017' },
};

function parseDateInfo(iso: string): { dateKey: string; displayDate: string; timeStr: string } {
  const d = new Date(iso);
  const now = new Date();

  const todayKey = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = yesterday.toDateString();
  const dateKey = d.toDateString();

  let displayDate: string;
  if (dateKey === todayKey) {
    displayDate = 'Today';
  } else if (dateKey === yesterdayKey) {
    displayDate = 'Yesterday';
  } else {
    displayDate = d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return { dateKey, displayDate, timeStr };
}

interface TimelineEntry {
  id: string;
  entry_type: string;
  title: string;
  description: string | null;
  occurred_at: string;
  family_members: { name: string } | null;
}

interface GroupedDay {
  dateKey: string;
  displayDate: string;
  items: TimelineEntry[];
}

function groupByDate(entries: TimelineEntry[]): GroupedDay[] {
  const groups: GroupedDay[] = [];
  const indexMap = new Map<string, number>();

  for (const entry of entries) {
    const { dateKey, displayDate } = parseDateInfo(entry.occurred_at);
    if (indexMap.has(dateKey)) {
      groups[indexMap.get(dateKey)!].items.push(entry);
    } else {
      indexMap.set(dateKey, groups.length);
      groups.push({ dateKey, displayDate, items: [entry] });
    }
  }

  return groups;
}

export default function Timeline() {
  const router = useRouter();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const membersQuery = useFamilyMembers();
  const timelineQuery = useTimeline(selectedMemberId ?? undefined);

  const members = (membersQuery.data ?? []) as Array<{ id: string; name: string }>;
  const entries = (timelineQuery.data ?? []) as TimelineEntry[];
  const grouped = groupByDate(entries);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Health Timeline</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Member filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        <TouchableOpacity
          style={[styles.chip, selectedMemberId === null && styles.chipActive]}
          onPress={() => setSelectedMemberId(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, selectedMemberId === null && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {members.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.chip, selectedMemberId === m.id && styles.chipActive]}
            onPress={() => setSelectedMemberId(m.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selectedMemberId === m.id && styles.chipTextActive]}>
              {m.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content area */}
      {timelineQuery.isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00B894" />
        </View>
      ) : timelineQuery.isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Unable to load timeline. Please try again.</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No health events yet</Text>
          <Text style={styles.emptyBody}>
            Documents and medications you add will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {grouped.map(({ dateKey, displayDate, items }) => (
            <View key={dateKey}>
              <Text style={styles.dateLabel}>{displayDate}</Text>
              {items.map((entry, idx) => {
                const meta =
                  TYPE_META[entry.entry_type as EntryType] ?? { icon: '📄', color: '#A1A1AA' };
                const { timeStr } = parseDateInfo(entry.occurred_at);
                const memberName = entry.family_members?.name ?? '';
                const firstName = memberName ? memberName.split(' ')[0] : '';
                const isLast = idx === items.length - 1;

                return (
                  <View key={entry.id} style={styles.eventRow}>
                    {/* Timeline spine */}
                    <View style={styles.timelineLeft}>
                      <View style={[styles.dot, { backgroundColor: meta.color }]} />
                      {!isLast && <View style={styles.line} />}
                    </View>

                    {/* Event card */}
                    <View style={[styles.eventCard, isLast && styles.eventCardLast]}>
                      <View style={styles.eventTop}>
                        <Text style={styles.eventIcon}>{meta.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.eventTitle} numberOfLines={1}>
                            {entry.title}
                          </Text>
                          {entry.description ? (
                            <Text style={styles.eventDetail} numberOfLines={1}>
                              {entry.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View style={styles.eventMeta}>
                        {memberName ? <Avatar name={memberName} size={16} /> : null}
                        <Text style={styles.eventMetaText}>
                          {firstName ? `${firstName} · ` : ''}
                          {timeStr}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

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

  chipsScroll: { flexGrow: 0 },
  chipsRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  chipActive: { backgroundColor: '#09090B', borderColor: '#09090B' },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  chipTextActive: { color: '#FFFFFF' },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 18,
    color: '#09090B',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 20,
  },

  content: { paddingHorizontal: 20 },

  dateLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },

  eventRow: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { width: 24, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 14 },
  line: { flex: 1, width: 2, backgroundColor: '#E4E4E7', marginTop: 2 },

  eventCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
    marginLeft: 10,
    marginBottom: 6,
  },
  eventCardLast: { marginBottom: 0 },
  eventTop: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  eventIcon: { fontSize: 20 },
  eventTitle: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  eventDetail: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventMetaText: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' },
});
