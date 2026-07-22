import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

// ─── Static data ──────────────────────────────────────────────────────────────
const INITIAL_PENDING = [
  { initials: 'Su', name: 'Sunita Patil', email: 'sunita@example.com', ago: '2 hours ago',  isNew: true,  bg: '#FEF3C7', color: '#8a5e0a' },
  { initials: 'AK', name: 'Arun Kumar',   email: 'arun.k@example.com', ago: 'Yesterday',    isNew: false, bg: '#E0E7FF', color: '#3730a3' },
];

const ACTIVE_CONNECTIONS = [
  { initials: 'Ra', name: 'Rajeev Sharma', sub: 'Connected since Jun 10 · Full access', bg: '#F4F4F5', color: '#71717A' },
];

const ACCESS_HISTORY = [
  { initials: 'MK', name: 'Mahesh Kulkarni', sub: 'Access revoked · May 20', bg: '#F4F4F5', color: '#A1A1AA' },
];

function Avatar({ initials, bg, color, size = 38 }: { initials: string; bg: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: size * 0.36, color }}>{initials}</Text>
    </View>
  );
}

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' }}>{title}</Text>
      {badge ? (
        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50, backgroundColor: '#FEF3C7' }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: '#8a5e0a' }}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ManageAccessScreen() {
  const router = useRouter();
  const [pending, setPending] = useState(INITIAL_PENDING);
  const [active, setActive] = useState(ACTIVE_CONNECTIONS);

  const handleAccept  = (name: string) => setPending(p => p.filter(r => r.name !== name));
  const handleDecline = (name: string) => setPending(p => p.filter(r => r.name !== name));
  const handleRevoke  = (name: string) => setActive(a => a.filter(r => r.name !== name));

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
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B', letterSpacing: -0.4 }}>Manage Access</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>

        {/* Pending Requests */}
        {pending.length > 0 && (
          <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FEF3C7', borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Pending Requests" badge={`${pending.length}`} />
            <View style={{ gap: 14 }}>
              {pending.map(r => (
                <View key={r.name}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <Avatar initials={r.initials} bg={r.bg} color={r.color} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{r.name}</Text>
                        {r.isNew && (
                          <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 50, backgroundColor: '#FEE2E2' }}>
                            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: '#b91c1c' }}>New</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' }}>{r.email} · {r.ago}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => handleAccept(r.name)} activeOpacity={0.7}
                      style={{ flex: 1, height: 34, borderRadius: 9, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#FFFFFF' }}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDecline(r.name)} activeOpacity={0.7}
                      style={{ flex: 1, height: 34, borderRadius: 9, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E4E7' }}>
                      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#71717A' }}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Active Connections */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <SectionHeader title={`Active Connections · ${active.length}`} />
          {active.length === 0 ? (
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA' }}>No active connections</Text>
          ) : active.map(c => (
            <View key={c.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar initials={c.initials} bg={c.bg} color={c.color} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{c.name}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{c.sub}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRevoke(c.name)} activeOpacity={0.7}
                style={{ paddingHorizontal: 10, height: 28, borderRadius: 7, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#b91c1c' }}>Revoke</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Access History */}
          <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E4E4E7' }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#71717A', marginBottom: 10 }}>Access History</Text>
            {ACCESS_HISTORY.map(h => (
              <View key={h.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar initials={h.initials} bg={h.bg} color={h.color} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#A1A1AA' }}>{h.name}</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{h.sub}</Text>
                </View>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, backgroundColor: '#F4F4F5' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 10, color: '#A1A1AA' }}>Revoked</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
