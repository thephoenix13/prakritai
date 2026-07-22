import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="timeline" />
      <Stack.Screen name="insights" />
      <Stack.Screen name="emergency" />
      <Stack.Screen name="protocol" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="upgrade" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="doctors" />
    </Stack>
  );
}
