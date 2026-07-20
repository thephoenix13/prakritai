import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { calculateBmi, getBmiCategory } from '@prakritai/shared';
import { useAddFamilyMember } from '../../../lib/queries/family';

const RELATIONS = ['Self', 'Spouse', 'Parent', 'Child', 'Sibling', 'Other'];
const GENDERS = ['Female', 'Male', 'Prefer not to say'];
const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'];

const BMI_CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Underweight: { bg: '#E0E7FF', text: '#3730a3' },
  Normal: { bg: '#CCFBF1', text: '#00725E' },
  Overweight: { bg: '#FEF3C7', text: '#8a5e0a' },
  Obese: { bg: '#FEE2E2', text: '#b91c1c' },
};

function parseDob(raw: string): string | undefined {
  // Accepts DD/MM/YYYY
  const parts = raw.trim().split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    if (!isNaN(Date.parse(iso))) return iso;
  }
  return undefined;
}

export default function AddFamilyMember() {
  const router = useRouter();
  const addMember = useAddFamilyMember();

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const bmi = (() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (h > 0 && w > 0) return calculateBmi(h, w);
    return null;
  })();
  const bmiCategory = bmi ? getBmiCategory(bmi) : null;
  const bmiColors = bmiCategory ? BMI_CATEGORY_COLORS[bmiCategory] ?? BMI_CATEGORY_COLORS.Normal : null;

  const canSave = name.trim().length > 0 && relation && dob.trim().length > 0;

  const handleSave = useCallback(async () => {
    if (!canSave || addMember.isPending) return;
    const isoDob = parseDob(dob);
    if (!isoDob) {
      Alert.alert('Invalid Date', 'Please enter date in DD/MM/YYYY format.');
      return;
    }
    try {
      await addMember.mutateAsync({
        name: name.trim(),
        relationship: relation,
        date_of_birth: isoDob,
        gender: gender || undefined,
        blood_type: bloodType || undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not add family member. Please try again.');
    }
  }, [canSave, addMember, name, relation, dob, gender, bloodType, heightCm, weightKg, router]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Add Family Member</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ramesh Sharma"
            placeholderTextColor="#A1A1AA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Relationship */}
        <View style={styles.field}>
          <Text style={styles.label}>Relationship <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {RELATIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, relation === r && styles.chipSelected]}
                onPress={() => setRelation(r)}
              >
                <Text style={[styles.chipText, relation === r && styles.chipTextSelected]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#A1A1AA"
            value={dob}
            onChangeText={setDob}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
          />
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, gender === g && styles.chipSelected]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.chipText, gender === g && styles.chipTextSelected]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Blood Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Blood Type</Text>
          <View style={styles.chipRow}>
            {BLOOD_TYPES.map((bt) => (
              <TouchableOpacity
                key={bt}
                style={[styles.chip, styles.chipSmall, bloodType === bt && styles.chipSelected]}
                onPress={() => setBloodType(bloodType === bt ? '' : bt)}
              >
                <Text style={[styles.chipText, bloodType === bt && styles.chipTextSelected]}>{bt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Height + Weight */}
        <View style={styles.field}>
          <Text style={styles.label}>Height & Weight</Text>
          <View style={styles.hwRow}>
            <View style={styles.hwField}>
              <TextInput
                style={styles.input}
                placeholder="Height (cm)"
                placeholderTextColor="#A1A1AA"
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
            <View style={styles.hwField}>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                placeholderTextColor="#A1A1AA"
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>

          {bmi !== null && bmiColors && (
            <View style={[styles.bmiCard, { backgroundColor: bmiColors.bg }]}>
              <Text style={[styles.bmiValue, { color: bmiColors.text }]}>
                BMI {bmi.toFixed(1)}
              </Text>
              <Text style={[styles.bmiCategory, { color: bmiColors.text }]}>
                {bmiCategory}
              </Text>
            </View>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, (!canSave || addMember.isPending) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || addMember.isPending}
          activeOpacity={0.85}
        >
          {addMember.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Add Family Member</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>* Required fields</Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F4F4F5',
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 17, color: '#09090B' },

  content: { paddingHorizontal: 24, paddingTop: 8 },

  field: { marginBottom: 22 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B', marginBottom: 10 },
  required: { color: '#EF4444' },

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#09090B',
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipSmall: { paddingHorizontal: 12, paddingVertical: 7 },
  chipSelected: { backgroundColor: '#09090B', borderColor: '#09090B' },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  chipTextSelected: { color: '#FFFFFF' },

  hwRow: { flexDirection: 'row', gap: 10 },
  hwField: { flex: 1 },

  bmiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  bmiValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20 },
  bmiCategory: { fontFamily: 'Inter-SemiBold', fontSize: 14 },

  saveBtn: {
    backgroundColor: '#09090B',
    borderRadius: 13,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  saveBtnDisabled: { opacity: 0.35 },
  saveBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#FFFFFF' },

  hint: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', textAlign: 'center' },
});
