import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Line } from 'react-native-svg';

// ─── Static data ──────────────────────────────────────────────────────────────
const YOUR_FAMILY = [
  { initials: 'P',  name: 'Priya',  label: 'You',  bg: '#CCFBF1', color: '#007A64' },
  { initials: 'R',  name: 'Ramesh', label: '',      bg: '#FCE7F3', color: '#be185d' },
  { initials: 'M',  name: 'Meera',  label: '',      bg: '#FEF3C7', color: '#8a5e0a' },
  { initials: 'Ri', name: 'Riya',   label: '',      bg: '#E0E7FF', color: '#3730a3' },
];

const CONNECTED_FAMILIES = [
  { initials: 'Ra', name: 'Rajeev Sharma', sub: 'Sharma Family · 2 members', status: 'Active' },
];

const DOCTOR_ACCESS = [
  { initials: 'AJ', name: 'Dr. Anjali Mehta', sub: 'Apollo Hospital · Expires Jul 28', bg: '#E8FDF8', color: '#007A64' },
];

const PENDING_REQUESTS = [
  { initials: 'Su', name: 'Sunita Patil', sub: 'Wants to join your circle · 2h ago', bg: '#FEF3C7', color: '#8a5e0a' },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, bg, color, size = 38 }: { initials: string; bg: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: size * 0.36, color }}>{initials}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FamilyCircleScreen() {
  const router = useRouter();
  const [pendingList, setPendingList] = useState(PENDING_REQUESTS);

  const handleAccept = (name: string) => setPendingList(p => p.filter(r => r.name !== name));
  const handleDecline = (name: string) => setPendingList(p => p.filter(r => r.name !== name));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 14 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B', letterSpacing: -0.4 }}>Family Circle</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>Shared health access hub</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>

        {/* Your Family */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B', marginBottom: 12 }}>Your Family · 4 members</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {YOUR_FAMILY.map(m => (
              <View key={m.name} style={{ alignItems: 'center', gap: 4 }}>
                <Avatar initials={m.initials} bg={m.bg} color={m.color} size={40} />
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#71717A' }}>{m.name}</Text>
                {m.label ? <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 9, color: '#00B894' }}>{m.label}</Text> : null}
              </View>
            ))}
          </View>
        </View>

        {/* Connected Families */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' }}>Connected Families</Text>
            <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, backgroundColor: '#CCFBF1' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: '#007A64' }}>1 active</Text>
            </View>
          </View>
          {CONNECTED_FAMILIES.map(f => (
            <View key={f.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar initials={f.initials} bg="#F4F4F5" color="#71717A" size={38} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{f.name}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{f.sub}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, backgroundColor: '#CCFBF1' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: '#007A64' }}>{f.status}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#00B894' }}>View data →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Doctor Access */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B', marginBottom: 12 }}>Doctor Access</Text>
          {DOCTOR_ACCESS.map(d => (
            <View key={d.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar initials={d.initials} bg={d.bg} color={d.color} size={38} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{d.name}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{d.sub}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}
                style={{ paddingHorizontal: 10, height: 28, borderRadius: 7, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#b91c1c' }}>Revoke</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Pending Requests */}
        {pendingList.length > 0 && (
          <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FEF3C7', borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' }}>Pending Requests</Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, backgroundColor: '#FEF3C7' }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: '#8a5e0a' }}>{pendingList.length} new</Text>
              </View>
            </View>
            {pendingList.map(r => (
              <View key={r.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar initials={r.initials} bg={r.bg} color={r.color} size={38} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{r.name}</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{r.sub}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => handleAccept(r.name)} activeOpacity={0.7}
                    style={{ paddingHorizontal: 12, height: 30, borderRadius: 8, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: '#FFFFFF' }}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDecline(r.name)} activeOpacity={0.7}
                    style={{ paddingHorizontal: 12, height: 30, borderRadius: 8, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: '#71717A' }}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 28, paddingTop: 12, backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#E4E4E7' }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/family/add')} activeOpacity={0.85}
          style={{ height: 50, borderRadius: 13, backgroundColor: '#09090B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
          </Svg>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' }}>Invite someone to Circle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
