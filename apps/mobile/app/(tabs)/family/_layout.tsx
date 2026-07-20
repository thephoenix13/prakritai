import { Stack } from 'expo-router';

export default function FamilyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="circle" />
      <Stack.Screen name="add" />
    </Stack>
  );
}
