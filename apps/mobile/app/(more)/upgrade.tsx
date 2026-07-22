import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

const FEATURES = [
  'Unlimited document uploads',
  'AI consultations — unlimited',
  'Up to 6 family members',
  'Priority critical alerts',
  'Annual health trend reports',
];

export default function UpgradeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B', letterSpacing: -0.4 }}>Upgrade to Pro</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>

        {/* Hero card */}
        <View style={{ backgroundColor: '#09090B', borderRadius: 16, padding: 22, marginBottom: 20, overflow: 'hidden', position: 'relative' }}>
          {/* Decorative circle top-right */}
          <View style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(0,184,148,0.15)' }} />

          {/* "PRAKRIT PRO" label */}
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#A1A1AA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            Prakrit Pro
          </Text>

          {/* Headline */}
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#FFFFFF', letterSpacing: -0.6, lineHeight: 32, marginBottom: 8 }}>
            Complete health{'\n'}intelligence
          </Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
            For families who take health seriously
          </Text>

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 34, color: '#FFFFFF', letterSpacing: -1 }}>₹299</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/month</Text>
          </View>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            Billed monthly · Cancel anytime
          </Text>
        </View>

        {/* Features list — bare rows with dividers */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
          {FEATURES.map((f, i) => (
            <View key={f} style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              paddingHorizontal: 16, paddingVertical: 15,
              borderBottomWidth: i < FEATURES.length - 1 ? 1 : 0,
              borderBottomColor: '#E4E4E7',
            }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M20 6L9 17l-5-5" stroke="#00B894" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14, color: '#09090B' }}>{f}</Text>
            </View>
          ))}
        </View>

        {/* CTA — black button */}
        <TouchableOpacity activeOpacity={0.85}
          style={{ height: 50, borderRadius: 13, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#FFFFFF' }}>Start 7-day free trial →</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', textAlign: 'center' }}>
          No charge for 7 days · Then ₹299/month
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}
