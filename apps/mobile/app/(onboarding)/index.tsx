import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'S01',
    title: 'Prakrit AI',
    subtitle: 'Your family\'s health intelligence — records, reminders, and answers, in one place.',
    emoji: '🏥',
  },
  {
    id: 'S35',
    title: 'AI Report Analysis',
    subtitle: 'Upload any lab report and get a plain-language explanation in seconds.',
    emoji: '🔬',
  },
  {
    id: 'S36',
    title: 'Family Hub',
    subtitle: 'Manage health for every family member — from kids to grandparents.',
    emoji: '👨‍👩‍👧‍👦',
  },
  {
    id: 'S38',
    title: 'Medication Reminders',
    subtitle: 'Never miss a dose. Smart reminders for every family member\'s schedule.',
    emoji: '💊',
  },
  {
    id: 'S39',
    title: 'Emergency Hub',
    subtitle: 'Critical info always available — even without internet.',
    emoji: '🚨',
  },
  {
    id: 'S40',
    title: 'Prakrit Voice',
    subtitle: 'Ask health questions in Hindi, English, or Marathi — get instant answers.',
    emoji: '🎙️',
  },
];

export default function OnboardingCarousel() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlashList<typeof SLIDES[number]>>(null);

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      router.replace('/(onboarding)/profile-setup');
    }
  }

  function handleSkip() {
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1">
        <FlashList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          estimatedItemSize={width}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width }} className="flex-1 px-6 justify-center items-center">
              <Text style={{ fontSize: 72 }} className="mb-8">{item.emoji}</Text>
              <Text className="font-space-grotesk-bold text-3xl text-text text-center mb-4">
                {item.title}
              </Text>
              <Text className="font-inter text-text-secondary text-base text-center leading-7">
                {item.subtitle}
              </Text>
            </View>
          )}
        />

        {/* Dots */}
        <View className="flex-row justify-center mb-8 gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === currentIndex ? 'w-6 bg-teal' : 'w-2 bg-border'
              }`}
            />
          ))}
        </View>

        {/* Actions */}
        <View className="px-6 pb-8 gap-3">
          <TouchableOpacity
            onPress={handleNext}
            className="h-[50px] bg-text rounded-button items-center justify-center"
          >
            <Text className="font-space-grotesk-bold text-sm text-white">
              {currentIndex < SLIDES.length - 1 ? 'Next →' : 'Get started'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} className="items-center py-3">
            <Text className="font-inter text-text-secondary text-sm">Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
