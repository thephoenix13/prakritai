import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { MEDICATIONS_BY_ID, useMedications } from '../../../lib/data/medications';

// ─── 30-day adherence calendar ─────────────────────────────────────────────────
function AdherenceGrid({ adherence }: { adherence: number }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    // Simulate taken/missed based on adherence %
    return Math.random() * 100 < adherence;
  });
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
      {days.map((taken, i) => (
        <View key={i} style={{
          width: 18, height: 18, borderRadius: 4,
          backgroundColor: taken ? '#00B894' : '#FEE2E2',
        }} />
      ))}
    </View>
  );
}

export default function MedicationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const med = MEDICATIONS_BY_ID[id ?? 'metformin'] ?? MEDICATIONS_BY_ID['metformin'];
  const { isTaken, toggle } = useMedications();

  const handleToggle = useCallback((doseId: string) => toggle(doseId), [toggle]);

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
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#09090B', letterSpacing: -0.2 }}>{med.name}</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 1 }}>{med.member}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
            <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="#09090B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 6l-4-4-4 4" stroke="#09090B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 2v13" stroke="#09090B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>

        {/* Info grid — 2×2 cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {/* Dose */}
          <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#F4F4F5', borderRadius: 12, padding: 13 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginBottom: 4 }}>Dose</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#09090B' }}>
              {med.dose.replace(/[^\d.]+/, '')}<Text style={{ fontSize: 12, fontFamily: 'Inter-Regular' }}> {med.dose.replace(/[\d.]+\s*/, '')}</Text>
            </Text>
          </View>
          {/* Frequency */}
          <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#F4F4F5', borderRadius: 12, padding: 13 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginBottom: 4 }}>Frequency</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>{med.frequency}</Text>
          </View>
          {/* Take with */}
          <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#F4F4F5', borderRadius: 12, padding: 13 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginBottom: 4 }}>Take with</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>{med.takeWith}</Text>
          </View>
          {/* Started */}
          <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#F4F4F5', borderRadius: 12, padding: 13 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginBottom: 4 }}>Started</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>{med.started}</Text>
          </View>
        </View>

        {/* Today's log */}
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 10 }}>Today's log</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {med.doses.map((dose, i) => {
            const taken = isTaken(dose.id);
            return (
              <View key={dose.id} style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: i < med.doses.length - 1 ? 1 : 0, borderBottomColor: '#E4E4E7',
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13,
                    color: taken ? '#A1A1AA' : '#09090B',
                    textDecorationLine: taken ? 'line-through' : 'none' }}>
                    {dose.label}
                  </Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: taken ? '#00B894' : '#71717A', marginTop: 2 }}>{dose.note}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggle(dose.id)} activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: taken ? '#00B894' : 'transparent',
                    borderWidth: taken ? 0 : 1.5, borderColor: '#E4E4E7',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {taken && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path d="M20 6L9 17l-5-5" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Adherence */}
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 10 }}>Adherence — last 30 days</Text>
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 16, marginBottom: 8 }}>
          <AdherenceGrid adherence={med.adherence} />
        </View>
        <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#71717A', marginBottom: 16 }}>
          {med.adherence}% adherence · {med.missedDoses} doses missed
        </Text>

        {/* AI note */}
        <View style={{ backgroundColor: '#F4F4F5', borderRadius: 14, padding: 14, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 9, color: '#FFFFFF' }}>P</Text>
            </View>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#09090B' }}>Prakrit AI</Text>
          </View>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B', lineHeight: 20 }}>{med.aiNote}</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 8 }}>
            Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
          </Text>
        </View>

      </ScrollView>

      {/* Bottom actions */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingBottom: 28, paddingTop: 12, backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#E4E4E7' }}>
        <TouchableOpacity activeOpacity={0.8}
          style={{ flex: 1, height: 48, borderRadius: 13, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E4E7' }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8}
          onPress={() => { const dose = med.doses[0]; if (dose) handleToggle(dose.id); }}
          style={{ flex: 2, height: 48, borderRadius: 13, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' }}>
            {med.doses[0] && isTaken(med.doses[0].id) ? 'Mark as pending' : 'Mark taken'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
