import { View, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useRef, useState } from 'react';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: 'S01' },
  { id: 'S35' },
  { id: 'S36' },
  { id: 'S38' },
  { id: 'S39' },
  { id: 'S40' },
];

// ─── Step dots ────────────────────────────────────────────────────────────────
function StepDots({ active, total }: { active: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? 24 : 8,
            height: 4,
            borderRadius: 2,
            backgroundColor: i === active ? '#09090B' : '#E4E4E7',
          }}
        />
      ))}
    </View>
  );
}

// ─── Grade badge ──────────────────────────────────────────────────────────────
function GradeBadge({ grade, small }: { grade: string; small?: boolean }) {
  const cfg: Record<string, { bg: string; border: string; color: string }> = {
    A: { bg: '#CCFBF1', border: '#00B894', color: '#00725E' },
    B: { bg: '#FEF3C7', border: '#D4A017', color: '#8a5e0a' },
    C: { bg: '#FCE7F3', border: '#F472B6', color: '#be185d' },
    D: { bg: '#FEE2E2', border: '#EF4444', color: '#b91c1c' },
  };
  const c = cfg[grade] ?? cfg.B;
  const size = small ? 22 : 28;
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: c.bg, borderWidth: 1.5, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: c.color, fontSize: small ? 10 : 12, fontFamily: 'SpaceGrotesk-Bold' }}>{grade}</Text>
    </View>
  );
}

// ─── S01 — Wordmark ───────────────────────────────────────────────────────────
// White bg, teal logo, "prakrit.ai", tagline, "Next →" + "I already have an account →", dots
function SlideS01({ activeIndex, total, onNext, onSignIn }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
      {/* Background decoration circles */}
      <View style={{ position: 'absolute', top: -100, right: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(0,184,148,0.07)' }} />
      <View style={{ position: 'absolute', bottom: -80, left: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(0,184,148,0.05)' }} />
      {/* Center content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Logo */}
        <View style={{
          width: 64, height: 64, borderRadius: 20, backgroundColor: '#00B894',
          alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          shadowColor: '#00B894', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
        }}>
          <Svg width={32} height={32} viewBox="0 0 52 52">
            <Path d="M14 40V12h14c6 0 11 5 11 11s-5 11-11 11H20v6H14z" fill="white" />
          </Svg>
        </View>
        {/* Wordmark */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 12 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 42, color: '#09090B', letterSpacing: -1.5 }}>prakrit</Text>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 42, color: '#00B894', letterSpacing: -1.5 }}>.ai</Text>
        </View>
        {/* Tagline */}
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 15, color: '#71717A', textAlign: 'center', lineHeight: 25, maxWidth: 240 }}>
          Your family's health,{'\n'}intelligently understood.
        </Text>
      </View>
      {/* Bottom CTAs + dots */}
      <View style={{ paddingHorizontal: 28, paddingBottom: 52, gap: 12 }}>
        <TouchableOpacity onPress={onNext} activeOpacity={0.85}
          style={{ height: 54, backgroundColor: '#09090B', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#FFFFFF' }}>Next</Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}
          style={{ alignItems: 'center', justifyContent: 'center', height: 36 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#71717A' }}>
            I already have an account <Text style={{ color: '#00B894' }}>→</Text>
          </Text>
        </TouchableOpacity>
        <StepDots active={activeIndex} total={total} />
      </View>
    </View>
  );
}

// ─── Feature slide wrapper (S35–S40) ─────────────────────────────────────────
// Dots at TOP, content in center, "Next →" / "Get started →" at bottom
function FeatureSlide({ activeIndex, total, onNext, onSignIn, label, sublabel, children }: any) {
  const isLast = activeIndex === total - 1;
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
      {/* Dots at top */}
      <View style={{ paddingTop: 8 }}>
        <StepDots active={activeIndex} total={total} />
      </View>
      {/* Content */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {children}
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: '#09090B', textAlign: 'center', letterSpacing: -0.5, marginBottom: 10, lineHeight: 30 }}>
          {label}
        </Text>
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#71717A', textAlign: 'center', lineHeight: 23, maxWidth: 280 }}>
          {sublabel}
        </Text>
      </View>
      {/* Bottom CTAs */}
      <View style={{ paddingHorizontal: 28, paddingBottom: 44, gap: 12 }}>
        <TouchableOpacity onPress={onNext} activeOpacity={0.85}
          style={{ height: 52, backgroundColor: '#09090B', borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#FFFFFF' }}>
              {isLast ? 'Get started' : 'Next'}
            </Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>
        {isLast ? (
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA', textAlign: 'center' }}>
            Free · No credit card required
          </Text>
        ) : (
          <TouchableOpacity onPress={onSignIn} activeOpacity={0.7} style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA' }}>Swipe to continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Slide content ────────────────────────────────────────────────────────────
function SlideS35({ activeIndex, total, onNext, onSignIn }: any) {
  return (
    <FeatureSlide activeIndex={activeIndex} total={total} onNext={onNext} onSignIn={onSignIn}
      label={'AI reads your\nmedical reports'}
      sublabel="Upload any lab report and Prakrit AI extracts values, grades them A–D, and explains what they mean in plain language.">
      <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 28, borderWidth: 1, borderColor: '#E4E4E7', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' }}>HbA1c Report</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A', marginTop: 2 }}>Apollo Diagnostics · Ramesh · Jul 2026</Text>
          </View>
          <GradeBadge grade="C" />
        </View>
        {[
          { label: 'HbA1c', value: '7.2%', note: 'Diabetic range', grade: 'C' },
          { label: 'Fasting Glucose', value: '124 mg/dL', note: 'Slightly elevated', grade: 'C' },
        ].map(row => (
          <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F4F4F5' }}>
            <View>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#09090B' }}>{row.label}</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 10, color: '#71717A' }}>{row.note}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#09090B' }}>{row.value}</Text>
              <GradeBadge grade={row.grade} small />
            </View>
          </View>
        ))}
        <View style={{ backgroundColor: '#CCFBF1', borderRadius: 10, padding: 10, marginTop: 10, flexDirection: 'row', gap: 7 }}>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#007A64', flex: 1, lineHeight: 18 }}>HbA1c improved 0.6% from April. Keep current medication and diet plan.</Text>
        </View>
      </View>
    </FeatureSlide>
  );
}

function SlideS36({ activeIndex, total, onNext, onSignIn }: any) {
  const members = [
    { initial: 'P', name: 'Priya', score: 88, grade: 'A', you: true },
    { initial: 'R', name: 'Ramesh', score: 62, grade: 'C' },
    { initial: 'M', name: 'Meera', score: 70, grade: 'B' },
    { initial: 'Ri', name: 'Riya', score: 94, grade: 'A' },
  ];
  const ringColor: Record<string, string> = { A: '#00B894', B: '#D4A017', C: '#F472B6' };
  const textColor: Record<string, string> = { A: '#00725E', B: '#8a5e0a', C: '#be185d' };
  return (
    <FeatureSlide activeIndex={activeIndex} total={total} onNext={onNext} onSignIn={onSignIn}
      label={'One app for\nyour whole family'}
      sublabel="Track health scores for everyone — children, parents, grandparents. One family account, complete health picture.">
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
        {members.map(m => (
          <View key={m.name} style={{ alignItems: 'center', gap: 7 }}>
            <View style={{ position: 'relative', width: 58, height: 58 }}>
              <Svg width={58} height={58} viewBox="0 0 58 58">
                <Path d={`M29 6 A23 23 0 1 1 28.99 6`} fill="none" stroke="#EBEBEB" strokeWidth="5.5" />
                <Path d={`M29 6 A23 23 0 1 1 28.99 6`} fill="none" stroke={ringColor[m.grade] ?? '#00B894'} strokeWidth="5.5"
                  strokeDasharray={`${(m.score / 100) * 144} 144`} strokeDashoffset="36" strokeLinecap="round" />
              </Svg>
              <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>{m.score}</Text>
              </View>
            </View>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A', textAlign: 'center' }}>
              {m.name}{m.you ? '\n(you)' : ''}
            </Text>
          </View>
        ))}
      </View>
    </FeatureSlide>
  );
}

function SlideS38({ activeIndex, total, onNext, onSignIn }: any) {
  return (
    <FeatureSlide activeIndex={activeIndex} total={total} onNext={onNext} onSignIn={onSignIn}
      label={'Never miss a dose,\nfor anyone'}
      sublabel="Set smart reminders for every family member. Track doses, adherence streaks, and get notified when someone misses a medication.">
      <View style={{ width: '100%', marginBottom: 28 }}>
        <View style={{ backgroundColor: '#09090B', borderRadius: 16, padding: 12, paddingHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(0,184,148,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" fill="none" stroke="#00B894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#FFFFFF' }}>Medication reminder</Text>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Ramesh · Metformin 500mg · 8:00 PM</Text>
          </View>
          <View style={{ backgroundColor: '#00B894', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: '#FFFFFF' }}>Take</Text>
          </View>
        </View>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E4E4E7' }}>
          {[
            { name: 'Metformin 500mg', who: 'Ramesh · 8:00 AM & 8:00 PM', taken: true, color: '#00B894' },
            { name: 'Telmisartan 40mg', who: 'Meera · 8:00 AM daily', taken: true, color: '#00B894' },
            { name: 'Thyronorm 50mcg', who: 'Priya · Empty stomach · 6:00 AM', taken: false, color: '#E4E4E7' },
          ].map((med, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14, gap: 10, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#F4F4F5' }}>
              <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: med.taken ? 'rgba(0,184,148,0.1)' : '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="none" stroke={med.taken ? '#00B894' : '#D4A017'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{med.name}</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A' }}>{med.who}</Text>
              </View>
              <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: med.taken ? '#00B894' : '#F4F4F5', borderWidth: med.taken ? 0 : 1.5, borderColor: '#E4E4E7', alignItems: 'center', justifyContent: 'center' }}>
                {med.taken && (
                  <Svg width={12} height={12} viewBox="0 0 24 24">
                    <Path d="M20 6L9 17 4 12" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </FeatureSlide>
  );
}

function SlideS39({ activeIndex, total, onNext, onSignIn }: any) {
  return (
    <FeatureSlide activeIndex={activeIndex} total={total} onNext={onNext} onSignIn={onSignIn}
      label={'Emergency info,\nalways on hand'}
      sublabel="A scannable QR card for every family member — allergies, blood group, medications, emergency contacts. Ready in 10 seconds, even without internet.">
      <View style={{ width: '100%', marginBottom: 28, position: 'relative' }}>
        <View style={{ backgroundColor: '#09090B', borderRadius: 20, padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#00B894', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#FFFFFF' }}>R</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' }}>Ramesh Sharma</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' }}>45 yrs · Male · B+ blood group</Text>
            </View>
            <View style={{ backgroundColor: '#EF4444', borderRadius: 50, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: '#FFFFFF' }}>SOS</Text>
            </View>
          </View>
          {[
            { label: 'Conditions', value: 'T2DM · Hypertension' },
            { label: 'Allergies', value: 'Penicillin · Sulfa drugs' },
            { label: 'Emergency', value: 'Priya Sharma · Wife', teal: true },
          ].map(row => (
            <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A' }}>{row.label}</Text>
              <Text style={{ fontFamily: 'Inter-Medium', fontSize: 11, color: row.teal ? '#5EFCD9' : '#FFFFFF', flex: 1, textAlign: 'right', marginLeft: 16 }}>{row.value}</Text>
            </View>
          ))}
        </View>
        <View style={{ position: 'absolute', top: -10, right: 12, backgroundColor: '#EF4444', borderRadius: 50, paddingHorizontal: 14, paddingVertical: 6, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#FFFFFF' }}>10 sec</Text>
        </View>
      </View>
    </FeatureSlide>
  );
}

function SlideS40({ activeIndex, total, onNext, onSignIn }: any) {
  return (
    <FeatureSlide activeIndex={activeIndex} total={total} onNext={onNext} onSignIn={onSignIn}
      label={'Ask in your\nlanguage'}
      sublabel="Talk to Prakrit AI by voice in Hindi, English, Marathi, or Telugu. Get answers about your reports, medications, and health — no typing needed.">
      <View style={{ width: '100%', marginBottom: 28 }}>
        <View style={{ alignSelf: 'flex-end', backgroundColor: '#F4F4F5', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%', marginBottom: 10 }}>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B' }}>"Ramesh ka HbA1c 7.2% hai — iska kya matlab hai?"</Text>
        </View>
        <View style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12, maxWidth: '88%', borderWidth: 1, borderColor: '#E4E4E7', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', lineHeight: 20 }}>
            HbA1c 7.2% aapke last 3 mahine ka blood sugar dikhata hai. <Text style={{ color: '#00B894', fontFamily: 'Inter-Medium' }}>Good news</Text>: April se improve hua hai.
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['हिंदी', 'English', 'मराठी', 'తెలుగు'].map(lang => (
            <View key={lang} style={{ backgroundColor: '#F4F4F5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E4E4E7' }}>
              <Text style={{ fontFamily: 'Inter-Medium', fontSize: 12, color: '#09090B' }}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>
    </FeatureSlide>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SplashScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  function goNext() {
    if (activeIndex === SLIDES.length - 1) {
      router.push('/(auth)/sign-up');
      return;
    }
    const next = activeIndex + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
  }

  function goSignIn() {
    router.push('/(auth)/sign-in');
  }

  const commonProps = { activeIndex, total: SLIDES.length, onNext: goNext, onSignIn: goSignIn };

  const SLIDE_MAP: Record<string, JSX.Element> = {
    S01: <SlideS01 {...commonProps} />,
    S35: <SlideS35 {...commonProps} />,
    S36: <SlideS36 {...commonProps} />,
    S38: <SlideS38 {...commonProps} />,
    S39: <SlideS39 {...commonProps} />,
    S40: <SlideS40 {...commonProps} />,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
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
          <View style={{ width }}>
            {SLIDE_MAP[item.id]}
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}
