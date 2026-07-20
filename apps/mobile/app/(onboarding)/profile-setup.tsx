import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { calculateBmi, getBmiCategory } from '@prakritai/shared';
import { colors } from '@prakritai/shared';

const GENDERS = ['Female', 'Male', 'Other'] as const;
type Gender = typeof GENDERS[number];

function getBmiColor(bmi: number): string {
  const cat = getBmiCategory(bmi);
  if (cat === 'Normal') return colors.teal;
  if (cat === 'Overweight') return colors.yellow;
  if (cat === 'Obese') return colors.red;
  return colors.textSecondary;
}

export default function ProfileSetup() {
  const router = useRouter();
  const [gender, setGender] = useState<Gender>('Female');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  const bmi =
    heightNum > 0 && weightNum > 0 ? calculateBmi(heightNum, weightNum) : null;
  const bmiCategory = bmi ? getBmiCategory(bmi) : null;

  async function handleSave() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase.from('family_members').insert({
        user_id: user.id,
        name: user.user_metadata?.display_name ?? 'Me',
        date_of_birth: '1990-01-01',
        gender,
        relationship: 'Self',
        height_cm: heightNum || null,
        weight_kg: weightNum || null,
      });

      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="pt-8 pb-10">
          <Text className="font-space-grotesk-bold text-2xl text-text mb-2">Set up your profile</Text>
          <Text className="font-inter text-text-secondary mb-8">
            This helps us calculate your health score accurately.
          </Text>

          {/* Gender */}
          <Text className="font-inter-medium text-sm text-text mb-3">Gender</Text>
          <View className="flex-row gap-3 mb-6">
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                className={`flex-1 py-3 rounded-button items-center border ${
                  gender === g
                    ? 'bg-teal-lighter border-teal-light'
                    : 'bg-white border-border'
                }`}
              >
                <Text
                  className={`font-inter-medium text-sm ${
                    gender === g ? 'text-teal' : 'text-text-secondary'
                  }`}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Height */}
          <Text className="font-inter-medium text-sm text-text mb-3">Height (cm)</Text>
          <TextInput
            className="h-[50px] border border-border rounded-button px-4 font-inter text-text mb-6"
            placeholder="e.g. 163"
            placeholderTextColor="#A1A1AA"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />

          {/* Weight */}
          <Text className="font-inter-medium text-sm text-text mb-3">Weight (kg)</Text>
          <TextInput
            className="h-[50px] border border-border rounded-button px-4 font-inter text-text mb-6"
            placeholder="e.g. 62"
            placeholderTextColor="#A1A1AA"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          {/* BMI preview */}
          {bmi !== null && (
            <View className="bg-surface rounded-card p-4 mb-8 items-center">
              <Text className="font-inter text-text-secondary text-sm mb-1">Your BMI</Text>
              <Text
                className="font-space-grotesk-bold text-3xl mb-1"
                style={{ color: getBmiColor(bmi) }}
              >
                {bmi}
              </Text>
              <Text className="font-inter-medium text-sm" style={{ color: getBmiColor(bmi) }}>
                {bmiCategory}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="h-[50px] bg-text rounded-button items-center justify-center mb-4"
          >
            <Text className="font-space-grotesk-bold text-sm text-white">
              {loading ? 'Saving...' : 'View my health score →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            className="items-center py-3"
          >
            <Text className="font-inter text-text-secondary text-sm">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
