import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as LocalAuthentication from 'expo-local-authentication';
import { MMKV } from 'react-native-mmkv';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

// ─── MMKV instance ────────────────────────────────────────────────────────────
const storage = new MMKV();

// ─── Types ────────────────────────────────────────────────────────────────────
interface NotificationPrefs {
  medication_reminders: boolean;
  critical_alerts: boolean;
  weekly_insights: boolean;
}

interface Profile {
  id: string;
  display_name: string | null;
  notification_prefs: NotificationPrefs | null;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Settings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId, session } = useAuth();

  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(
    storage.getBoolean('biometric_enabled') ?? false,
  );

  // ── Load profile ────────────────────────────────────────────────────────────
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });

  // ── Update notification pref ────────────────────────────────────────────────
  const updatePrefMutation = useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: keyof NotificationPrefs;
      value: boolean;
    }) => {
      const current = profile?.notification_prefs ?? {
        medication_reminders: true,
        critical_alerts: true,
        weekly_insights: true,
      };
      const updated: NotificationPrefs = { ...current, [key]: value };
      const { error } = await supabase
        .from('profiles')
        .update({ notification_prefs: updated })
        .eq('id', userId!);
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  const handlePrefToggle = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      updatePrefMutation.mutate({ key, value });
    },
    [updatePrefMutation],
  );

  // ── Biometric ───────────────────────────────────────────────────────────────
  const handleBiometricToggle = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric login',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        storage.set('biometric_enabled', true);
        setBiometricEnabled(true);
      }
    } else {
      storage.set('biometric_enabled', false);
      setBiometricEnabled(false);
    }
  }, []);

  // ── Sign out ────────────────────────────────────────────────────────────────
  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }, []);

  // ── Delete account ──────────────────────────────────────────────────────────
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your health data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All family members, documents, and health records will be erased forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Request Deletion',
                  style: 'destructive',
                  onPress: () => {
                    Linking.openURL(
                      'mailto:support@prakrit.ai?subject=Delete Account Request',
                    );
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────
  const prefs: NotificationPrefs = profile?.notification_prefs ?? {
    medication_reminders: true,
    critical_alerts: true,
    weekly_insights: true,
  };
  const displayName = profile?.display_name ?? session?.user?.user_metadata?.full_name ?? '—';
  const email = session?.user?.email ?? '—';

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <ActivityIndicator color="#00B894" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Account ─────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Name</Text>
            <Text style={styles.infoVal}>{displayName}</Text>
          </View>
          <View style={[styles.infoRow, styles.rowBorder]}>
            <Text style={styles.infoKey}>Email</Text>
            <Text style={styles.infoVal} numberOfLines={1}>{email}</Text>
          </View>
          <View style={[styles.infoRow, styles.rowBorder]}>
            <Text style={styles.infoKey}>Language</Text>
            <Text style={styles.infoVal}>English</Text>
          </View>
        </View>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Medication Reminders</Text>
              <Text style={styles.toggleDesc}>Daily dose reminders</Text>
            </View>
            <Switch
              value={prefs.medication_reminders}
              onValueChange={(v) => handlePrefToggle('medication_reminders', v)}
              trackColor={{ false: '#E4E4E7', true: '#00B894' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.toggleRow, styles.rowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Health Alerts</Text>
              <Text style={styles.toggleDesc}>Critical health notifications</Text>
            </View>
            <Switch
              value={prefs.critical_alerts}
              onValueChange={(v) => handlePrefToggle('critical_alerts', v)}
              trackColor={{ false: '#E4E4E7', true: '#00B894' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.toggleRow, styles.rowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Weekly Insights</Text>
              <Text style={styles.toggleDesc}>Summary every Sunday</Text>
            </View>
            <Switch
              value={prefs.weekly_insights}
              onValueChange={(v) => handlePrefToggle('weekly_insights', v)}
              trackColor={{ false: '#E4E4E7', true: '#00B894' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── Security ────────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Biometric Login</Text>
              <Text style={styles.toggleDesc}>Face ID / fingerprint unlock</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: '#E4E4E7', true: '#00B894' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── Danger zone ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Account Actions</Text>
        <View style={styles.card}>
          {/* Sign out */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Delete account */}
          <TouchableOpacity
            style={[styles.deleteRow, styles.rowBorder]}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>PrakritAI v1.0.0</Text>

        {/* Disclaimer */}
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
  centered: { alignItems: 'center', justifyContent: 'center' },

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

  content: { paddingHorizontal: 20 },

  sectionLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
    paddingLeft: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    overflow: 'hidden',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#E4E4E7' },
  infoKey: { fontFamily: 'Inter-Medium', fontSize: 15, color: '#09090B' },
  infoVal: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#71717A',
    maxWidth: '55%',
    textAlign: 'right',
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLabel: { fontFamily: 'Inter-Medium', fontSize: 15, color: '#09090B' },
  toggleDesc: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginTop: 2 },

  signOutBtn: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
  },
  signOutText: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#09090B' },

  deleteRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: '#EF4444' },

  version: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 6,
  },
  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 16,
  },
});
