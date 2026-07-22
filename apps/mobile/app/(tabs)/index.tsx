import { ScrollView, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Line, Polyline } from 'react-native-svg';

// ─── Static data (Priya's family) ────────────────────────────────────────────
const USER = { name: 'Priya', initial: 'P' };

const SCORE = { value: 88, grade: 'A' };
const BIO_AGE = 28;
const BMI = 23.3;

const FAMILY = [
  { name: 'You',    score: 88, color: '#00B894', bg: '#CCFBF1', track: 127 },
  { name: 'Ramesh', score: 62, color: '#F472B6', bg: '#FCE7F3', track: 90  },
  { name: 'Meera',  score: 70, color: '#D4A017', bg: '#FEF3C7', track: 101 },
  { name: 'Riya',   score: 94, color: '#00B894', bg: '#CCFBF1', track: 136 },
];

const REMINDERS = [
  { name: 'Metformin 500mg · Ramesh', time: '8:00 AM · With breakfast', done: true,  docId: '2' },
  { name: 'Telmisartan 40mg · Ramesh', time: '8:00 PM · Pending',        done: false, docId: null },
];

// ─── Score ring SVG ───────────────────────────────────────────────────────────
function ScoreRing({ size = 110, score = 88 }: { size?: number; score?: number }) {
  const r = (size - 14) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference * 0.75;
  const rotation = -225;
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke="#EBEBEB" strokeWidth={9}
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round" strokeDashoffset={0}
          transform={`rotate(${rotation} ${cx} ${cx})`} />
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke="#00B894" strokeWidth={9}
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cx})`} />
      </Svg>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 28, color: '#09090B', letterSpacing: -1 }}>{score}</Text>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A' }}>health score</Text>
      </View>
    </View>
  );
}

// ─── Family mini ring ─────────────────────────────────────────────────────────
function FamilyRing({ name, score, color, track }: typeof FAMILY[0]) {
  const r = 23;
  const circumference = 2 * Math.PI * r;
  return (
    <View style={{ alignItems: 'center', gap: 5 }}>
      <View style={{ position: 'relative', width: 58, height: 58 }}>
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <Circle cx={29} cy={29} r={r} fill="none" stroke="#EBEBEB" strokeWidth={5.5} />
          <Circle cx={29} cy={29} r={r} fill="none" stroke={color} strokeWidth={5.5}
            strokeDasharray={`${track} 144`} strokeDashoffset={36} strokeLinecap="round"
            transform="rotate(-90 29 29)" />
        </Svg>
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>{score}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A' }}>{name}</Text>
    </View>
  );
}

// ─── Bottom nav tab ───────────────────────────────────────────────────────────
function NavTab({ label, icon, active }: { label: string; icon: JSX.Element; active?: boolean }) {
  const c = active ? '#09090B' : '#A1A1AA';
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      {icon}
      <Text style={{ fontFamily: active ? 'SpaceGrotesk-SemiBold' : 'SpaceGrotesk-Regular', fontSize: 10, color: c }}>{label}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 24 }}>

          {/* Greeting */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 8, marginBottom: 20 }}>
            <View>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#A1A1AA', marginBottom: 3 }}>{greet} 👋</Text>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.5 }}>{USER.name}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(more)/settings')} activeOpacity={0.8}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 16, color: '#FFFFFF' }}>{USER.initial}</Text>
            </TouchableOpacity>
          </View>

          {/* Score + stats row */}
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/score/priya')} activeOpacity={0.85}>
              <ScoreRing size={110} score={SCORE.value} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              {/* Bio Age + BMI tiles */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1, backgroundColor: '#F4F4F5', borderRadius: 12, padding: 11 }}>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginBottom: 3 }}>BIO AGE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B' }}>{BIO_AGE}</Text>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A' }}>yrs</Text>
                  </View>
                </View>
                <View style={{ flex: 1, backgroundColor: '#E8FDF8', borderRadius: 12, padding: 11 }}>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#00725E', marginBottom: 3 }}>BMI</Text>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B' }}>{BMI}</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#00725E' }}>Normal</Text>
                </View>
              </View>
              {/* Trend card */}
              <View style={{ backgroundColor: '#E8FDF8', borderRadius: 10, padding: 10 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#007A64' }}>↑ 6 pts since April</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#00B894', marginTop: 2 }}>Score improving</Text>
              </View>
            </View>
          </View>

          {/* Family strip */}
          <View style={{ marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B' }}>Family</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#00B894' }}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {FAMILY.map(m => <FamilyRing key={m.name} {...m} />)}
            </View>
          </View>

          {/* Today's reminders */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 10 }}>Today's reminders</Text>
            <View style={{ gap: 8 }}>
              {REMINDERS.map((r, i) => (
                <TouchableOpacity key={i} activeOpacity={r.docId ? 0.7 : 1}
                  onPress={() => r.docId && router.push(`/(tabs)/documents/${r.docId}`)}
                  style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 22 }}>💊</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{r.name}</Text>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 }}>{r.time}</Text>
                  </View>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: r.done ? '#00B894' : '#F4F4F5', borderWidth: r.done ? 0 : 1.5, borderColor: '#E4E4E7', alignItems: 'center', justifyContent: 'center' }}>
                    {r.done && (
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path d="M20 6L9 17 4 12" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI prompt bar */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/ai')}
            activeOpacity={0.85}
            style={{ backgroundColor: '#09090B', borderRadius: 14, padding: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={13} height={13} viewBox="0 0 52 52" fill="white">
                <Path d="M14 40V12h14c6 0 11 5 11 11s-5 11-11 11H20v6H14z" />
              </Svg>
            </View>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)', flex: 1 }}>Ask Prakrit AI anything…</Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
