import { Platform } from 'react-native';
import { supabase } from './supabase';

// expo-notifications push notifications are NOT supported in Expo Go (SDK 53+).
// Use lazy require inside each function — never at module load time.
type Notifications = typeof import('expo-notifications');
function N(): Notifications | null {
  try {
    return require('expo-notifications') as Notifications;
  } catch {
    return null;
  }
}

export function setupNotificationHandler() {
  const n = N();
  if (!n) return;
  try {
    n.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch {
    // Silently ignore in Expo Go
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  const n = N(); if (!n) return null;
  try {
    if (Platform.OS === 'android') {
      await n.setNotificationChannelAsync('medications', {
        name: 'Medication Reminders',
        importance: n.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
      await n.setNotificationChannelAsync('health-alerts', {
        name: 'Health Alerts',
        importance: n.AndroidImportance.MAX,
        sound: 'default',
      });
      await n.setNotificationChannelAsync('default', {
        name: 'General',
        importance: n.AndroidImportance.DEFAULT,
      });
    }

    const { status: existing } = await n.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await n.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const token = (await n.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

export async function savePushTokenToProfile(token: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user.id) return;
  await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', session.user.id);
}

export async function scheduleMedicationReminder(params: {
  medicationId: string;
  medicationName: string;
  memberName: string;
  hour: number;
  minute: number;
}) {
  const n = N(); if (!n) return null;
  const identifier = `med-${params.medicationId}-${params.hour}${params.minute}`;
  await n.cancelScheduledNotificationAsync(identifier).catch(() => {});
  await n.scheduleNotificationAsync({
    identifier,
    content: {
      title: `Time for ${params.medicationName}`,
      body: `${params.memberName}'s ${params.hour < 12 ? 'morning' : params.hour < 17 ? 'afternoon' : params.hour < 22 ? 'evening' : 'bedtime'} dose`,
      data: { medicationId: params.medicationId, type: 'medication_reminder' },
      sound: 'default',
      categoryIdentifier: 'MEDICATION',
    },
    trigger: {
      hour: params.hour,
      minute: params.minute,
      repeats: true,
      type: n.SchedulableTriggerInputTypes.DAILY,
    },
  });
  return identifier;
}

export async function cancelMedicationReminder(medicationId: string, hour: number, minute: number) {
  const n = N(); if (!n) return;
  const identifier = `med-${medicationId}-${hour}${minute}`;
  await n.cancelScheduledNotificationAsync(identifier).catch(() => {});
}

export async function cancelAllRemindersForMedication(medicationId: string) {
  const n = N(); if (!n) return;
  const scheduled = await n.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n) => n.identifier.startsWith(`med-${medicationId}-`));
  await Promise.all(toCancel.map((n) => n!.cancelScheduledNotificationAsync(n.identifier)));
}

const SLOT_HOURS: Record<string, number> = {
  Morning: 8,
  Afternoon: 13,
  Evening: 18,
  Bedtime: 22,
};

export async function scheduleRemindersForMedication(params: {
  medicationId: string;
  medicationName: string;
  memberName: string;
  timesOfDay: string[];
  reminderEnabled: boolean;
}) {
  if (!params.reminderEnabled) return;
  await Promise.all(
    params.timesOfDay.map((slot) =>
      scheduleMedicationReminder({
        medicationId: params.medicationId,
        medicationName: params.medicationName,
        memberName: params.memberName,
        hour: SLOT_HOURS[slot] ?? 8,
        minute: 0,
      }),
    ),
  );
}


// expo-notifications push notifications are not supported in Expo Go (SDK 53+)
// Local notification handlers still work
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // Silently ignore in Expo Go
}

// ─── Send an immediate local notification (fires in 1 second) ─────────────────
export async function sendImmediateNotification(params: {
  title: string;
  body: string;
  channelId?: string; // 'medications' | 'health-alerts' | 'default'
}): Promise<boolean> {
  const n = N();
  if (!n) return false;
  try {
    const { status } = await n.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await n.requestPermissionsAsync();
      if (newStatus !== 'granted') return false;
    }
    await n.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        sound: 'default',
        ...(params.channelId && { categoryIdentifier: params.channelId }),
      },
      trigger: { seconds: 1, type: n.SchedulableTriggerInputTypes.TIME_INTERVAL },
    });
    return true;
  } catch {
    return false;
  }
}
