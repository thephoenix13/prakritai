import { Platform } from 'react-native';
import { supabase } from './supabase';

// expo-notifications push notifications are NOT supported in Expo Go (SDK 53+).
// Use lazy require so the import doesn't crash at module load time.
type Notifications = typeof import('expo-notifications');
function getNotifications(): Notifications | null {
  try {
    return require('expo-notifications') as Notifications;
  } catch {
    return null;
  }
}

const N = getNotifications();

if (N) {
  try {
    N.setNotificationHandler({
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
  if (!N) return null;
  try {
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('medications', {
        name: 'Medication Reminders',
        importance: N.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
      await N.setNotificationChannelAsync('health-alerts', {
        name: 'Health Alerts',
        importance: N.AndroidImportance.MAX,
        sound: 'default',
      });
      await N.setNotificationChannelAsync('default', {
        name: 'General',
        importance: N.AndroidImportance.DEFAULT,
      });
    }

    const { status: existing } = await N.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const token = (await N.getExpoPushTokenAsync()).data;
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
  if (!N) return null;
  const identifier = `med-${params.medicationId}-${params.hour}${params.minute}`;
  await N.cancelScheduledNotificationAsync(identifier).catch(() => {});
  await N.scheduleNotificationAsync({
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
      type: N.SchedulableTriggerInputTypes.DAILY,
    },
  });
  return identifier;
}

export async function cancelMedicationReminder(medicationId: string, hour: number, minute: number) {
  if (!N) return;
  const identifier = `med-${medicationId}-${hour}${minute}`;
  await N.cancelScheduledNotificationAsync(identifier).catch(() => {});
}

export async function cancelAllRemindersForMedication(medicationId: string) {
  if (!N) return;
  const scheduled = await N.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n) => n.identifier.startsWith(`med-${medicationId}-`));
  await Promise.all(toCancel.map((n) => N!.cancelScheduledNotificationAsync(n.identifier)));
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
