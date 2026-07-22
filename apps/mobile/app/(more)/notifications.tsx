import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

// ─── Fire a local notification immediately (1-second delay) ───────────────────
async function fireNotification(title: string, body: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const N = require('expo-notifications');
    if (!N || typeof N.scheduleNotificationAsync !== 'function') return false;

    const { status } = await N.getPermissionsAsync();
    const finalStatus =
      status === 'granted'
        ? status
        : (await N.requestPermissionsAsync()).status;
    if (finalStatus !== 'granted') return false;

    await N.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: { seconds: 1, type: N.SchedulableTriggerInputTypes?.TIME_INTERVAL ?? 'timeInterval' },
    });
    return true;
  } catch {
    return false;
  }
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'critical',
    badge: 'Critical Alert',
    badgeBg: '#FEE2E2',
    badgeColor: '#b91c1c',
    appLine: 'prakrit.ai · Critical Alert',
    time: 'now',
    body: "Ramesh's post-meal glucose is 248 mg/dL — significantly above target. Tap to view recommendations.",
    actions: ['Dismiss', 'View Alert'],
    notifTitle: '⚠️ Critical Health Alert',
    notifBody: "Ramesh's post-meal glucose is 248 mg/dL — significantly above target.",
  },
  {
    id: 'medication',
    badge: 'Medication Reminder',
    badgeBg: '#E8FDF8',
    badgeColor: '#007A64',
    appLine: 'prakrit.ai · Medication reminder',
    time: '2 min ago',
    body: "Meera's Telmisartan 40mg is due. Tap to mark as taken.",
    actions: ['Dismiss', 'Mark taken'],
    notifTitle: '💊 Medication Reminder',
    notifBody: "Meera's Telmisartan 40mg is due. Tap to mark as taken.",
  },
];

// ─── Lock screen notification card ────────────────────────────────────────────
function LockCard({ t }: { t: typeof TEMPLATES[0] }) {
  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: '#FFFFFF' }}>P</Text>
          </View>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#FFFFFF' }}>{t.appLine}</Text>
        </View>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{t.time}</Text>
      </View>
      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#FFFFFF', lineHeight: 18, marginBottom: 10 }}>{t.body}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {t.actions.map(a => (
          <TouchableOpacity key={a} activeOpacity={0.7}
            style={{ flex: 1, height: 30, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#FFFFFF' }}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const [state, setState] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});

  const handleSend = async (t: typeof TEMPLATES[0]) => {
    setState(s => ({ ...s, [t.id]: 'sending' }));
    const ok = await fireNotification(t.notifTitle, t.notifBody);
    if (ok) {
      setState(s => ({ ...s, [t.id]: 'sent' }));
      setTimeout(() => setState(s => ({ ...s, [t.id]: 'idle' })), 3000);
    } else {
      setState(s => ({ ...s, [t.id]: 'idle' }));
      Alert.alert(
        'Notifications unavailable',
        'Local notifications require a dev build on a physical device. Not supported in Expo Go.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 14 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B', letterSpacing: -0.4 }}>Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>

        {/* Lock screen mockup */}
        <View style={{ backgroundColor: '#1c1c2e', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 44, color: '#FFFFFF', letterSpacing: -2 }}>9:41</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Wednesday, Jul 16, 2026</Text>
          </View>
          {TEMPLATES.map(t => <LockCard key={t.id} t={t} />)}
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 6 }}>Swipe up to unlock</Text>
        </View>

        {/* Send test section */}
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 4 }}>Send test notification</Text>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginBottom: 14 }}>
          Background the app first — notification fires in 1 second.
        </Text>

        <View style={{ gap: 10 }}>
          {TEMPLATES.map(t => {
            const st = state[t.id] ?? 'idle';
            return (
              <View key={t.id} style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 14 }}>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, backgroundColor: t.badgeBg, alignSelf: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: t.badgeColor }}>{t.badge}</Text>
                </View>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B', marginBottom: 3 }}>{t.notifTitle}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', lineHeight: 17, marginBottom: 12 }}>{t.notifBody}</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleSend(t)}
                  style={{ height: 38, borderRadius: 10, backgroundColor: st === 'sent' ? '#00B894' : '#09090B', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#FFFFFF' }}>
                    {st === 'sending' ? 'Sending…' : st === 'sent' ? '✓ Notification sent!' : 'Send notification'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
