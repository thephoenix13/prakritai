import React, { useState, useCallback, useEffect } from 'react';
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProtocolTask {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'monitoring' | 'medication' | 'mindfulness';
  frequency: string;
  week: number;
}

interface MonthlyGoal {
  id: string;
  text: string;
}

interface Protocol {
  id: string;
  title: string;
  goal: string;
  start_date: string;
  tasks: ProtocolTask[];
  monthly_goals: MonthlyGoal[];
  is_active: boolean;
  family_member_id: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  nutrition:   { emoji: '🍎', label: 'Nutrition' },
  exercise:    { emoji: '🏃', label: 'Exercise' },
  sleep:       { emoji: '😴', label: 'Sleep' },
  monitoring:  { emoji: '📊', label: 'Monitoring' },
  medication:  { emoji: '💊', label: 'Medication' },
  mindfulness: { emoji: '🧘', label: 'Mindfulness' },
};

const FREQ_BG: Record<string, string> = {
  Daily:   '#CCFBF1',
  Weekly:  '#FEF3C7',
  Monthly: '#FCE7F3',
};

function dayOfProtocol(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diff + 1, 1), 30);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProtocolScreen() {
  const router = useRouter();
  const { data: members = [] } = useFamilyMembers();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  const effectiveMemberId = selectedMemberId ?? members[0]?.id ?? null;

  // ── Load existing active protocol ──────────────────────────────────────────
  const { data: existingProtocol, isLoading: loadingProtocol } = useQuery({
    queryKey: ['protocol', effectiveMemberId],
    queryFn: async () => {
      if (!effectiveMemberId) return null;
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('family_member_id', effectiveMemberId)
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return (data ?? null) as Protocol | null;
    },
    enabled: !!effectiveMemberId,
  });

  // Sync query result into local state
  useEffect(() => {
    setProtocol(existingProtocol ?? null);
    setCompletedTaskIds(new Set());
  }, [existingProtocol]);

  // ── Load existing completed task logs ──────────────────────────────────────
  useEffect(() => {
    if (!protocol?.id) return;
    supabase
      .from('protocol_logs')
      .select('task_id')
      .eq('protocol_id', protocol.id)
      .then(({ data }) => {
        if (data) {
          setCompletedTaskIds(new Set(data.map((r: { task_id: string }) => r.task_id)));
        }
      });
  }, [protocol?.id]);

  // ── Generate protocol ──────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!effectiveMemberId) return;
    setGenerating(true);
    setGenError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'generate-protocol',
        { body: { family_member_id: effectiveMemberId } },
      );
      if (fnError) throw fnError;

      const generated = data as Protocol;

      // Insert into protocols table
      await supabase.from('protocols').insert({
        ...generated,
        family_member_id: effectiveMemberId,
        is_active: true,
        start_date: new Date().toISOString(),
      });

      setProtocol(generated);
      setActiveWeek(1);
      setCompletedTaskIds(new Set());
    } catch {
      setGenError('Could not generate protocol. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [effectiveMemberId]);

  // ── Toggle task completion ─────────────────────────────────────────────────
  const handleToggleTask = useCallback(async (taskId: string) => {
    if (!protocol?.id) return;

    const alreadyDone = completedTaskIds.has(taskId);

    // Optimistic update
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (alreadyDone) next.delete(taskId);
      else next.add(taskId);
      return next;
    });

    if (!alreadyDone) {
      await supabase.from('protocol_logs').insert({
        protocol_id: protocol.id,
        task_id: taskId,
        logged_at: new Date().toISOString(),
      });
    } else {
      await supabase
        .from('protocol_logs')
        .delete()
        .eq('protocol_id', protocol.id)
        .eq('task_id', taskId);
    }
  }, [protocol?.id, completedTaskIds]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentDay = protocol ? dayOfProtocol(protocol.start_date) : 1;
  const progressPct = Math.round((currentDay / 30) * 100);

  const weekTasks = protocol?.tasks?.filter((t) => t.week === activeWeek) ?? [];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>30-Day Protocol</Text>
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
                  setProtocol(null);
                  setGenError(null);
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

      {/* Loading */}
      {loadingProtocol && (
        <View style={styles.centered}>
          <ActivityIndicator color="#00B894" size="large" />
          <Text style={styles.loadingText}>Checking for existing protocol…</Text>
        </View>
      )}

      {!loadingProtocol && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* ── No protocol yet ─────────────────────────────────────────── */}
          {!protocol && (
            <>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No active protocol</Text>
                <Text style={styles.emptySubtitle}>
                  Generate a personalised 30-day health protocol based on your documents and conditions.
                </Text>
              </View>

              {!!genError && (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{genError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
                onPress={handleGenerate}
                disabled={generating || !effectiveMemberId}
                activeOpacity={0.85}
              >
                {generating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.generateBtnText}>Generate Protocol</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ── Protocol display ─────────────────────────────────────────── */}
          {protocol && (
            <>
              {/* Hero card */}
              <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>{protocol.title}</Text>
                <Text style={styles.heroGoal}>{protocol.goal}</Text>
                <View style={styles.dayRow}>
                  <Text style={styles.dayText}>Day {currentDay} of 30</Text>
                  <Text style={styles.dayPct}>{progressPct}%</Text>
                </View>
                {/* Progress bar */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
              </View>

              {/* Week tabs */}
              <View style={styles.weekTabs}>
                {[1, 2, 3, 4].map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={[styles.weekTab, activeWeek === w && styles.weekTabActive]}
                    onPress={() => setActiveWeek(w)}
                  >
                    <Text style={[styles.weekTabText, activeWeek === w && styles.weekTabTextActive]}>
                      Week {w}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tasks for selected week */}
              {weekTasks.length === 0 && (
                <View style={styles.noTasksCard}>
                  <Text style={styles.noTasksText}>No tasks for Week {activeWeek}</Text>
                </View>
              )}
              {weekTasks.map((task) => {
                const meta = CATEGORY_META[task.category] ?? { emoji: '📌', label: task.category };
                const done = completedTaskIds.has(task.id);
                const freqBg = FREQ_BG[task.frequency] ?? '#F4F4F5';
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[styles.taskCard, done && styles.taskCardDone]}
                    onPress={() => handleToggleTask(task.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.taskLeft}>
                      <View style={[styles.taskCheck, done && styles.taskCheckDone]}>
                        {done && <Text style={styles.checkMark}>✓</Text>}
                      </View>
                      <Text style={styles.taskEmoji}>{meta.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskTitle, done && styles.taskTitleDone]}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskDesc}>{task.description}</Text>
                    </View>
                    <View style={[styles.freqBadge, { backgroundColor: freqBg }]}>
                      <Text style={styles.freqText}>{task.frequency}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Monthly goals */}
              {(protocol.monthly_goals ?? []).length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Monthly Goals</Text>
                  <View style={styles.goalsCard}>
                    {protocol.monthly_goals.map((goal, i) => (
                      <View
                        key={goal.id ?? i}
                        style={[styles.goalRow, i > 0 && styles.goalRowBorder]}
                      >
                        <View style={styles.goalCheckbox} />
                        <Text style={styles.goalText}>{goal.text}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Regenerate option */}
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={handleGenerate}
                disabled={generating}
              >
                <Text style={styles.regenerateBtnText}>
                  {generating ? 'Generating…' : 'Regenerate Protocol'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Medical disclaimer */}
          <Text style={styles.disclaimer}>
            This protocol is AI-generated based on health records. Always consult your physician before making changes to your health routine. Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
          </Text>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
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
  chipActive: { backgroundColor: '#09090B', borderColor: '#09090B' },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  chipTextActive: { color: '#FFFFFF' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', marginTop: 12 },

  content: { paddingHorizontal: 20 },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 17, color: '#09090B', marginBottom: 6 },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 19,
  },

  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  errorText: { fontFamily: 'Inter-Medium', fontSize: 14, color: '#b91c1c', textAlign: 'center' },

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

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 16,
  },
  heroTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B', marginBottom: 4 },
  heroGoal: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', marginBottom: 14, lineHeight: 18 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#09090B' },
  dayPct: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#00B894' },
  progressTrack: {
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#00B894',
    borderRadius: 3,
  },

  weekTabs: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  weekTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  weekTabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  weekTabText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  weekTabTextActive: { color: '#09090B', fontFamily: 'Inter-SemiBold' },

  noTasksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
  },
  noTasksText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#A1A1AA' },

  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  taskCardDone: { opacity: 0.6 },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckDone: { backgroundColor: '#00B894', borderColor: '#00B894' },
  checkMark: { fontSize: 11, color: '#FFFFFF' },
  taskEmoji: { fontSize: 18 },
  taskTitle: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B', marginBottom: 3 },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#A1A1AA' },
  taskDesc: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', lineHeight: 17 },
  freqBadge: {
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
    flexShrink: 0,
  },
  freqText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: '#71717A' },

  sectionLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  goalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 4,
    marginBottom: 16,
  },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  goalRowBorder: { borderTopWidth: 1, borderTopColor: '#E4E4E7' },
  goalCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E4E4E7',
    flexShrink: 0,
  },
  goalText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', flex: 1 },

  regenerateBtn: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 13,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  regenerateBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#71717A' },

  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
