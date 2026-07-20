import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medications', {
      name: 'Medication Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
    await Notifications.setNotificationChannelAsync('health-alerts', {
      name: 'Health Alerts',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function savePushTokenToProfile(token: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user.id) return;
  await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', session.user.id);
}

// Schedule a local notification for a medication dose
export async function scheduleMedicationReminder(params: {
  medicationId: string;
  medicationName: string;
  memberName: string;
  hour: number;
  minute: number;
}) {
  const identifier = `med-${params.medicationId}-${params.hour}${params.minute}`;

  // Cancel existing notification with this ID first
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  await Notifications.scheduleNotificationAsync({
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
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });

  return identifier;
}

export async function cancelMedicationReminder(medicationId: string, hour: number, minute: number) {
  const identifier = `med-${medicationId}-${hour}${minute}`;
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
}

export async function cancelAllRemindersForMedication(medicationId: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n) => n.identifier.startsWith(`med-${medicationId}-`));
  await Promise.all(toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
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
