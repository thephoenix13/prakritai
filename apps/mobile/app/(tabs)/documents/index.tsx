import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function DocumentsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#09090B' }}>Documents</Text>
      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#A1A1AA', marginTop: 6 }}>Coming soon</Text>
    </SafeAreaView>
  );
}
