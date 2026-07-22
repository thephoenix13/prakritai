import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { MEDICATIONS, useMedications } from '../../../lib/data/medications';

const FILTERS = ['All (6)', 'Ramesh', 'Meera', 'Priya'];

const MEMBER_FILTER: Record<string, string> = {
  'Ramesh': 'Ramesh',
  'Meera':  'Meera',
  'Priya':  'Priya',
};

// Group doses by time slot
const MORNING_IDS = MEDICATIONS.flatMap(m => m.doses.filter(d => d.time === 'morning').map(d => ({ med: m, dose: d })));
const EVENING_IDS = MEDICATIONS.flatMap(m => m.doses.filter(d => d.time === 'evening').map(d => ({ med: m, dose: d })));

function Checkbox({ taken, onToggle }: { taken: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <View style={{
        width: 26, height: 26, borderRadius: 13,
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
  );
}

export default function MedicationsScreen() {
  const router = useRouter();
  const { isTaken, toggle } = useMedications();
  const [activeFilter, setActiveFilter] = useState('All (6)');

  const filterMember = MEMBER_FILTER[activeFilter];

  const filterDoses = (items: typeof MORNING_IDS) =>
    filterMember ? items.filter(({ med }) => med.member.startsWith(filterMember)) : items;

  const morningItems = filterDoses(MORNING_IDS);
  const eveningItems = filterDoses(EVENING_IDS);

  const handleToggle = useCallback((doseId: string) => toggle(doseId), [toggle]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 2, paddingBottom: 12 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.5 }}>Medications</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Bell — opens notification test screen */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(more)/notifications')}
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', borderWidth: 1, borderColor: '#E4E4E7', alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#09090B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          {/* Plus — add medication */}
          <TouchableOpacity activeOpacity={0.85}
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: '#E4E4E7', marginBottom: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, flexDirection: 'row' }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} activeOpacity={0.7}
              style={{ paddingHorizontal: 14, paddingVertical: 10, marginRight: 2, position: 'relative' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: activeFilter === f ? '#09090B' : '#A1A1AA' }}>{f}</Text>
              {activeFilter === f && (
                <View style={{ position: 'absolute', bottom: -1, left: 14, right: 14, height: 2, backgroundColor: '#09090B', borderRadius: 2 }} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>

        {/* Morning */}
        {morningItems.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#A1A1AA', letterSpacing: 0.5, marginBottom: 10 }}>MORNING · 8:00 AM</Text>
            <View style={{ gap: 8 }}>
              {morningItems.map(({ med, dose }) => (
                <TouchableOpacity key={dose.id} activeOpacity={0.7}
                  onPress={() => router.push(`/(tabs)/medications/${med.id}`)}
                  style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isTaken(dose.id) ? '#E8FDF8' : '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18 }}>💊</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: isTaken(dose.id) ? '#A1A1AA' : '#09090B',
                      textDecorationLine: isTaken(dose.id) ? 'line-through' : 'none' }}>
                      {med.name}
                    </Text>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>{med.sub}</Text>
                  </View>
                  <Checkbox taken={isTaken(dose.id)} onToggle={() => handleToggle(dose.id)} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Evening */}
        {eveningItems.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#A1A1AA', letterSpacing: 0.5, marginBottom: 10 }}>EVENING · 8:00 PM</Text>
            <View style={{ gap: 8 }}>
              {eveningItems.map(({ med, dose }) => (
                <TouchableOpacity key={dose.id} activeOpacity={0.7}
                  onPress={() => router.push(`/(tabs)/medications/${med.id}`)}
                  style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isTaken(dose.id) ? '#E8FDF8' : '#FCE7F3', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18 }}>💊</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: isTaken(dose.id) ? '#A1A1AA' : '#09090B',
                      textDecorationLine: isTaken(dose.id) ? 'line-through' : 'none' }}>
                      {med.name}
                    </Text>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>{med.sub}</Text>
                  </View>
                  <Checkbox taken={isTaken(dose.id)} onToggle={() => handleToggle(dose.id)} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
