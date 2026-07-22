import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Svg, { Path, Circle, Rect, Polyline } from 'react-native-svg';

// ─── Row component ─────────────────────────────────────────────────────────────
function SettingsRow({
  icon, label, sub, onPress, last = false, trailing,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onPress?: () => void;
  last?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <>
      <TouchableOpacity activeOpacity={onPress ? 0.7 : 1} onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
        <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14, color: '#09090B' }}>{label}</Text>
          {sub ? <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{sub}</Text> : null}
        </View>
        {trailing ?? (
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Polyline points="9,18 15,12 9,6" stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </TouchableOpacity>
      {!last && <View style={{ height: 1, backgroundColor: '#E4E4E7', marginLeft: 60 }} />}
    </>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#A1A1AA', letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 20, marginBottom: 8 }}>
      {title}
    </Text>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const [medReminders, setMedReminders] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F4F5' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 14, backgroundColor: '#F4F4F5' }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B', letterSpacing: -0.4 }}>Profile & Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>

        {/* Profile card */}
        <TouchableOpacity activeOpacity={0.8}
          style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 20, padding: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#FFFFFF' }}>P</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B' }}>Priya Sharma</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>+91 98765 43210 · Admin</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <View style={{ backgroundColor: '#E8FDF8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: '#007A64' }}>Free plan</Text>
              </View>
              <View style={{ backgroundColor: '#F4F4F5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 10, color: '#71717A' }}>4 members</Text>
              </View>
            </View>
          </View>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Polyline points="9,18 15,12 9,6" stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        {/* Vitals row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
          {[
            { label: 'Height', value: '163', unit: 'cm', teal: false },
            { label: 'Weight', value: '62',  unit: 'kg', teal: false },
            { label: 'BMI',    value: '23.3', unit: 'Normal', teal: true },
          ].map(v => (
            <View key={v.label} style={{
              flex: 1, backgroundColor: v.teal ? '#E8FDF8' : '#FFFFFF',
              borderWidth: 1, borderColor: v.teal ? '#CCFBF1' : '#E4E4E7',
              borderRadius: 14, padding: 12, alignItems: 'center',
            }}>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: v.teal ? '#007A64' : '#A1A1AA', marginBottom: 4 }}>{v.label}</Text>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 17, color: '#09090B' }}>{v.value}</Text>
              <Text style={{ fontFamily: v.teal ? 'SpaceGrotesk-Bold' : 'Inter-Regular', fontSize: 10, color: v.teal ? '#007A64' : '#A1A1AA', marginTop: 1 }}>{v.unit}</Text>
            </View>
          ))}
        </View>

        {/* Upgrade to Pro banner */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(more)/upgrade')}
          style={{ borderRadius: 16, padding: 16, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 14,
            backgroundColor: '#09090B',
            // gradient approximated — left dark black, right dark navy
            shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
          }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,184,148,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#FFFFFF' }}>Upgrade to Pro</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>Unlimited uploads · 6 members · ₹299/mo</Text>
          </View>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        {/* Account */}
        <SectionLabel title="Account" />
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 4 }}>
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#71717A" strokeWidth={2} strokeLinecap="round" /><Circle cx={12} cy={7} r={4} stroke="#71717A" strokeWidth={2} /></Svg>}
            label="Personal details" sub="Name, DOB, gender" />
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.4 1.13 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#71717A" strokeWidth={1.8} /></Svg>}
            label="Phone number" sub="+91 98765 43210" />
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#71717A" strokeWidth={1.8} /><Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="#71717A" strokeWidth={1.8} /></Svg>}
            label="Language & Region" last />
        </View>

        {/* Notifications */}
        <SectionLabel title="Notifications" />
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 4 }}>
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" /></Svg>}
            label="Notification preview"
            sub="Test alerts on your lock screen"
            onPress={() => router.push('/(more)/notifications')} />
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" /></Svg>}
            label="Medication reminders"
            trailing={<Switch value={medReminders} onValueChange={setMedReminders} trackColor={{ true: '#00B894' }} thumbColor="#FFFFFF" />} />
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" /><Path d="M12 9v4M12 17h.01" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" /></Svg>}
            label="Critical alerts"
            trailing={<Switch value={criticalAlerts} onValueChange={setCriticalAlerts} trackColor={{ true: '#00B894' }} thumbColor="#FFFFFF" />} />
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Rect x={2} y={3} width={20} height={14} rx={2} stroke="#71717A" strokeWidth={1.8} /><Path d="M8 21h8M12 17v4" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" /></Svg>}
            label="Weekly summary"
            last
            trailing={<Switch value={weeklySummary} onValueChange={setWeeklySummary} trackColor={{ true: '#00B894' }} thumbColor="#FFFFFF" />} />
        </View>

        {/* Other */}
        <SectionLabel title="More" />
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 4 }}>
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" /></Svg>}
            label="Privacy & data" />
          <SettingsRow
            icon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={12} r={10} stroke="#71717A" strokeWidth={1.8} /><Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" /></Svg>}
            label="Help & FAQ" last />
        </View>

        {/* Sign out */}
        <TouchableOpacity activeOpacity={0.8} style={{ marginTop: 20, height: 48, borderRadius: 13, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#b91c1c' }}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
