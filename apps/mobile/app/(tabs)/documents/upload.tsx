import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Circle, Polyline } from 'react-native-svg';
import { DOCUMENTS_BY_ID, RECENT_UPLOAD_IDS } from '../../../lib/data/documents';

const MEMBERS = ['Priya · You', 'Ramesh', 'Meera', 'Riya'];

const GRADE_CFG: Record<string, { bg: string; color: string }> = {
  A: { bg: '#CCFBF1', color: '#00725E' },
  B: { bg: '#FEF3C7', color: '#8a5e0a' },
  C: { bg: '#FCE7F3', color: '#be185d' },
  D: { bg: '#FEE2E2', color: '#b91c1c' },
};

// ─── Sub-components ────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const c = GRADE_CFG[grade] ?? GRADE_CFG.A;
  return (
    <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: c.color }}>{grade}</Text>
    </View>
  );
}

function DocIcon() {
  return (
    <View style={{ width: 44, height: 52, backgroundColor: '#E8FDF8', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14 2v6h6" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function UploadScreen() {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState('Ramesh');

  const memberName = selectedMember.split(' · ')[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B', letterSpacing: -0.4 }}>Upload</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>

        {/* For member */}
        <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#71717A', marginBottom: 10 }}>For member</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {MEMBERS.map(m => {
            const label = m.split(' · ')[0];
            const active = selectedMember === label || selectedMember === m;
            return (
              <TouchableOpacity key={m} onPress={() => setSelectedMember(label)} activeOpacity={0.7}
                style={{
                  height: 34, paddingHorizontal: 14, borderRadius: 50,
                  backgroundColor: active ? '#09090B' : '#F4F4F5',
                  borderWidth: 1, borderColor: active ? '#09090B' : '#E4E4E7',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: active ? '#FFFFFF' : '#09090B' }}>{m}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Upload zone */}
        <TouchableOpacity activeOpacity={0.75} style={{
          borderWidth: 2, borderColor: '#E4E4E7', borderStyle: 'dashed', borderRadius: 16,
          alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 24,
          backgroundColor: '#FFFFFF', marginBottom: 16,
        }}>
          {/* Camera icon */}
          <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#71717A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <Circle cx="12" cy="13" r="4" stroke="#71717A" strokeWidth={1.8} />
            </Svg>
          </View>

          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14, color: '#09090B', marginBottom: 4, textAlign: 'center' }}>
            Tap to photograph a report
          </Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginBottom: 16, textAlign: 'center' }}>
            or drag a PDF / image file here
          </Text>

          {/* File type chips */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['PDF', 'JPG', 'PNG'].map(ft => (
              <View key={ft} style={{ paddingHorizontal: 12, height: 28, borderRadius: 50, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A' }}>{ft}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Processing card */}
        <View style={{
          backgroundColor: '#E8FDF8', borderWidth: 1.5, borderColor: '#00B894', borderRadius: 14,
          flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 28,
        }}>
          {/* Spinner */}
          <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, borderColor: '#00B894', borderTopColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#00B894', opacity: 0.3 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#00725E' }}>
              Analyzing {memberName}&apos;s HbA1c report…
            </Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#00B894', marginTop: 2 }}>
              Extracting values · Reading ranges
            </Text>
          </View>
        </View>

        {/* Recent uploads */}
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 10 }}>Recent uploads</Text>
        <View style={{ gap: 8 }}>
          {RECENT_UPLOAD_IDS.map(rid => {
            const doc = DOCUMENTS_BY_ID[rid];
            if (!doc) return null;
            return (
              <TouchableOpacity key={doc.id} activeOpacity={0.7} onPress={() => router.push(`/(tabs)/documents/${doc.id}`)} style={{
                backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14,
                flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 16,
              }}>
                <DocIcon />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{doc.name} · {doc.date}</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>Ramesh · {doc.markers.length} values extracted</Text>
                </View>
                <GradeBadge grade={doc.grade} />
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
