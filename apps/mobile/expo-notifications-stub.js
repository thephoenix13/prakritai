// Stub for expo-notifications in Expo Go (push notifications removed since SDK 53)
// This prevents the LogBox overlay that blocks UI interaction.
module.exports = {
  setNotificationHandler: () => {},
  getPermissionsAsync: async () => ({ status: 'undetermined' }),
  requestPermissionsAsync: async () => ({ status: 'denied' }),
  getExpoPushTokenAsync: async () => ({ data: null }),
  setNotificationChannelAsync: async () => {},
  scheduleNotificationAsync: async () => '',
  cancelScheduledNotificationAsync: async () => {},
  getAllScheduledNotificationsAsync: async () => [],
  AndroidImportance: { HIGH: 4, MAX: 5, DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
};
