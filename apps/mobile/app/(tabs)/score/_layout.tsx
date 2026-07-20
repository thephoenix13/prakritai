import { Stack } from 'expo-router';

export default function ScoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
