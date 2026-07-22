import { Stack } from 'expo-router';
import { MedicationProvider } from '../../../lib/data/medications';

export default function MedicationsLayout() {
  return (
    <MedicationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
        <Stack.Screen name="add" />
      </Stack>
    </MedicationProvider>
  );
}
