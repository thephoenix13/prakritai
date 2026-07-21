import { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−', 'Not sure'];
const GENDERS = ['Female', 'Male', 'Other'];
const CONDITIONS = ['Diabetes', 'Hypertension', 'Thyroid', 'PCOS', 'Heart disease', 'Asthma', 'None'];

function calcBMI(heightCm: number, weightKg: number) {
  if (!heightCm || !weightKg) return null;
  return (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);
}

function cmToFtIn(cm: number) {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inc = Math.round(totalInches % 12);
  return `${ft} ft ${inc} in`;
}

function kgToLbs(kg: number) {
  return (kg * 2.20462).toFixed(1);
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal range';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// BMI gradient indicator position (0–100%)
function bmiPosition(bmi: number) {
  // scale: <18.5 = 0-20%, 18.5-25 = 20-50%, 25-30 = 50-75%, >30 = 75-100%
  if (bmi < 18.5) return `${Math.min(20, (bmi / 18.5) * 20)}%`;
  if (bmi < 25)  return `${20 + ((bmi - 18.5) / 6.5) * 30}%`;
  if (bmi < 30)  return `${50 + ((bmi - 25) / 5) * 25}%`;
  return `${Math.min(100, 75 + ((bmi - 30) / 5) * 25)}%`;
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 }}>
      {children}
    </Text>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50,
        backgroundColor: selected ? '#09090B' : '#F4F4F5',
        borderWidth: 1, borderColor: selected ? '#09090B' : '#E4E4E7',
      }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: selected ? '#FFFFFF' : '#71717A' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileSetup() {
  const router = useRouter();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);

  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempYear, setTempYear] = useState('1990');
  const [tempMonth, setTempMonth] = useState('3');
  const [tempDay, setTempDay] = useState('15');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('Female');
  const [heightCm, setHeightCm] = useState(163);
  const [weightKg, setWeightKg] = useState(62);
  const [activeCard, setActiveCard] = useState<'height' | 'weight'>('height');
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');

  const bmi = useMemo(() => calcBMI(heightCm, weightKg), [heightCm, weightKg]);
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  function toggleCondition(c: string) {
    if (c === 'None') {
      setConditions(['None']);
      return;
    }
    setConditions(prev => {
      const without = prev.filter(x => x !== 'None');
      return without.includes(c) ? without.filter(x => x !== c) : [...without, c];
    });
  }

  async function handleSave() {
    if (!userId) return;
    try {
      setLoading(true);
      const { error } = await supabase.from('profiles').update({
        date_of_birth: dob?.toISOString().split('T')[0] ?? null,
        blood_type: bloodGroup || null,
        gender: gender || null,
        height_cm: heightCm,
        weight_kg: weightKg,
        conditions: conditions.filter(c => c !== 'None'),
        allergies: allergies.trim() || null,
      }).eq('id', userId);
      if (error) throw error;
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const bmiVal = bmi ? parseFloat(bmi) : 0;
  const bmiPos = bmiVal ? bmiPosition(bmiVal) : '35%';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Progress bar */}
      <View style={{ paddingHorizontal: 24, paddingTop: 6, paddingBottom: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' }}>Step 2 of 2 — Your profile</Text>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: '#00B894' }}>Almost done</Text>
        </View>
        <View style={{ height: 4, backgroundColor: '#E4E4E7', borderRadius: 2 }}>
          <View style={{ width: '100%', height: 4, backgroundColor: '#00B894', borderRadius: 2 }} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
        >
          {/* Heading */}
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: '#09090B', marginBottom: 4 }}>Your health profile</Text>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#A1A1AA', marginBottom: 22 }}>
            Helps personalise your health score and recommendations
          </Text>

          {/* Date of Birth */}
          <SectionLabel>Date of birth</SectionLabel>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
            style={{ borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 14, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' }}
          >
            <View>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: dob ? '#09090B' : '#A1A1AA' }}>
                {dob
                  ? dob.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Select your date of birth'}
              </Text>
              {age !== null && (
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 }}>Age: {age} years</Text>
              )}
            </View>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#A1A1AA" strokeWidth={1.8} strokeLinecap="round" />
              <Line x1="16" y1="2" x2="16" y2="6" stroke="#A1A1AA" strokeWidth={1.8} strokeLinecap="round" />
              <Line x1="8" y1="2" x2="8" y2="6" stroke="#A1A1AA" strokeWidth={1.8} strokeLinecap="round" />
              <Line x1="3" y1="10" x2="21" y2="10" stroke="#A1A1AA" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          {showDatePicker && (
            <Modal transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
                <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#09090B', marginBottom: 16 }}>Date of birth</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Day</Text>
                      <TextInput
                        style={{ borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 10, height: 44, paddingHorizontal: 12, fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B' }}
                        value={tempDay} onChangeText={setTempDay} keyboardType="number-pad" maxLength={2} placeholder="DD"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Month</Text>
                      <TextInput
                        style={{ borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 10, height: 44, paddingHorizontal: 12, fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B' }}
                        value={tempMonth} onChangeText={setTempMonth} keyboardType="number-pad" maxLength={2} placeholder="MM"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Year</Text>
                      <TextInput
                        style={{ borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 10, height: 44, paddingHorizontal: 12, fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B' }}
                        value={tempYear} onChangeText={setTempYear} keyboardType="number-pad" maxLength={4} placeholder="YYYY"
                      />
                    </View>
                  </View>
                  <TouchableOpacity activeOpacity={0.85} onPress={() => {
                    const d = new Date(parseInt(tempYear), parseInt(tempMonth) - 1, parseInt(tempDay));
                    if (!isNaN(d.getTime()) && d < new Date()) setDob(d);
                    setShowDatePicker(false);
                  }} style={{ height: 48, backgroundColor: '#09090B', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' }}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          )}

          {/* Blood Group */}
          <SectionLabel>Blood group</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {BLOOD_GROUPS.map(g => (
              <Chip key={g} label={g} selected={bloodGroup === g} onPress={() => setBloodGroup(g)} />
            ))}
          </View>

          {/* Gender */}
          <SectionLabel>Gender</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {GENDERS.map(g => (
              <TouchableOpacity key={g} onPress={() => setGender(g)} activeOpacity={0.7}
                style={{ flex: 1, height: 44, borderRadius: 50, backgroundColor: gender === g ? '#09090B' : '#F4F4F5', borderWidth: 1, borderColor: gender === g ? '#09090B' : '#E4E4E7', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: gender === g ? '#FFFFFF' : '#71717A' }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Height + Weight */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
            {/* Height */}
            <TouchableOpacity activeOpacity={0.85} onPress={() => setActiveCard('height')} style={{ flex: 1, borderWidth: 1.5, borderColor: activeCard === 'height' ? '#00B894' : '#E4E4E7', borderRadius: 14, padding: 14, backgroundColor: '#FFFFFF' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: activeCard === 'height' ? '#00B894' : '#71717A', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>Height</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: '#09090B' }}>{heightCm}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' }}>cm</Text>
              </View>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>{cmToFtIn(heightCm)}</Text>
            </TouchableOpacity>
            {/* Weight */}
            <TouchableOpacity activeOpacity={0.85} onPress={() => setActiveCard('weight')} style={{ flex: 1, borderWidth: 1.5, borderColor: activeCard === 'weight' ? '#00B894' : '#E4E4E7', borderRadius: 14, padding: 14, backgroundColor: '#FFFFFF' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: activeCard === 'weight' ? '#00B894' : '#71717A', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>Weight</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: '#09090B' }}>{weightKg}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' }}>kg</Text>
              </View>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>{kgToLbs(weightKg)} lbs</Text>
            </TouchableOpacity>
          </View>

          {/* +/- buttons for active card */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
            <TouchableOpacity onPress={() => activeCard === 'height' ? setHeightCm(v => Math.max(100, v - 1)) : setWeightKg(v => Math.max(20, v - 1))} activeOpacity={0.7}
              style={{ flex: 1, height: 44, backgroundColor: '#F4F4F5', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E4E7' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#09090B' }}>−</Text>
            </TouchableOpacity>
            <View style={{ flex: 2, height: 44, borderRadius: 10, backgroundColor: '#F4F4F5', borderWidth: 1, borderColor: '#E4E4E7', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#71717A' }}>
                {activeCard === 'height' ? `${heightCm} cm` : `${weightKg} kg`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => activeCard === 'height' ? setHeightCm(v => Math.min(250, v + 1)) : setWeightKg(v => Math.min(300, v + 1))} activeOpacity={0.7}
              style={{ flex: 1, height: 44, backgroundColor: '#F4F4F5', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E4E4E7' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#09090B' }}>+</Text>
            </TouchableOpacity>
          </View>

          {/* BMI card */}
          {bmi && (
            <View style={{ backgroundColor: '#E8FDF8', borderWidth: 1.5, borderColor: '#CCFBF1', borderRadius: 18, padding: 16, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#00725E', textTransform: 'uppercase', letterSpacing: 0.5 }}>Your BMI</Text>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#00B894' }}>{bmiLabel(bmiVal)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: '#09090B' }}>{bmi}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' }}>kg/m²</Text>
              </View>
              {/* BMI bar */}
              <View style={{ height: 6, borderRadius: 4, backgroundColor: '#E4E4E7', marginBottom: 4, overflow: 'hidden' }}>
                <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' }}>
                  <View style={{ flex: 1, backgroundColor: '#93C5FD' }} />
                  <View style={{ flex: 1, backgroundColor: '#00B894' }} />
                  <View style={{ flex: 1, backgroundColor: '#D4A017' }} />
                  <View style={{ flex: 1, backgroundColor: '#EF4444' }} />
                </View>
                <View style={{ position: 'absolute', top: -3, left: bmiPos, width: 12, height: 12, borderRadius: 6, backgroundColor: '#09090B', borderWidth: 2, borderColor: '#fff' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#A1A1AA' }}>Under</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#A1A1AA' }}>Normal</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#A1A1AA' }}>Over</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#A1A1AA' }}>Obese</Text>
              </View>
            </View>
          )}

          {/* Known conditions */}
          <SectionLabel>Known conditions <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', textTransform: 'none', letterSpacing: 0 }}>(select all that apply)</Text></SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {CONDITIONS.map(c => (
              <Chip key={c} label={c} selected={conditions.includes(c)} onPress={() => toggleCondition(c)} />
            ))}
          </View>

          {/* Allergies */}
          <SectionLabel>Allergies <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', textTransform: 'none', letterSpacing: 0 }}>(optional)</Text></SectionLabel>
          <TextInput
            style={{ borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 12, height: 48, paddingHorizontal: 14, fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', backgroundColor: '#FFFFFF', marginBottom: 24 }}
            placeholder="e.g. Penicillin, Pollen, Nuts…"
            placeholderTextColor="#A1A1AA"
            value={allergies}
            onChangeText={setAllergies}
          />

          {/* Save button */}
          <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85}
            style={{ height: 52, backgroundColor: '#09090B', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#FFFFFF' }}>Save and continue</Text>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.7} style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA' }}>You can always update this in Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
