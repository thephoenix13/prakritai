import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRef, useState } from 'react';
import { FlatList } from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'S01',
    title: 'Your family\'s health,\nintelligently understood.',
  },
  {
    id: 'S02',
    title: 'AI reads every report\nso you don\'t have to.',
  },
  {
    id: 'S03',
    title: 'Reminders, records,\nand answers — together.',
  },
];

function Dot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const isActive = index === activeIndex;
  return (
    <View
      style={{
        width: isActive ? 24 : 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: isActive ? '#09090B' : '#D4D4D8',
        marginHorizontal: 3,
        transition: 'width 0.3s',
      }}
    />
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Logo */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 22,
            backgroundColor: '#00B894',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            shadowColor: '#00B894',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 38, fontWeight: '800', color: '#FFFFFF', fontFamily: 'SpaceGrotesk-Bold' }}>
            P
          </Text>
        </View>

        {/* Wordmark */}
        <Text style={{ fontSize: 36, fontFamily: 'SpaceGrotesk-Bold', marginBottom: 20, letterSpacing: -1 }}>
          <Text style={{ color: '#09090B' }}>prakrit</Text>
          <Text style={{ color: '#09090B' }}>.</Text>
          <Text style={{ color: '#00B894' }}>ai</Text>
        </Text>

        {/* Animated subtitle */}
        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={{ width: width - 64, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 17,
                  color: '#71717A',
                  textAlign: 'center',
                  lineHeight: 26,
                  fontFamily: 'Inter-Regular',
                }}
              >
                {item.title}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        />

        {/* Pagination dots */}
        <View style={{ flexDirection: 'row', marginTop: 24 }}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} activeIndex={activeIndex} />
          ))}
        </View>
      </View>

      {/* CTAs */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 36, gap: 14 }}>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in?mode=signup')}
          style={{
            height: 52,
            backgroundColor: '#09090B',
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SpaceGrotesk-Bold' }}>
            Get started — it's free
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          style={{ alignItems: 'center', justifyContent: 'center', height: 40 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: '#00B894', fontSize: 15, fontFamily: 'Inter-Medium' }}>
            I already have an account →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
