import '../global.css';
import { useEffect, useState, useMemo } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryClient } from '../lib/queryClient';

// Suppress known Expo Go dev-only warnings that block the UI
LogBox.ignoreLogs([
  'expo-notifications',
  'Push notifications',
  'expo-notifications: Android Push notifications',
]);
import { AuthContext } from '../lib/auth-context';
import { registerForPushNotifications, savePushTokenToProfile } from '../lib/notifications';
import type { Session } from '@supabase/supabase-js';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function AuthGate({ session, isLoading }: { session: Session | null; isLoading: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (session) {
      if (inAuth || inOnboarding) router.replace('/(tabs)');
    } else {
      if (!inOnboarding && !inAuth) router.replace('/(onboarding)');
    }
  }, [session, isLoading, segments, navigationState?.key]);

  return null;
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'SpaceGrotesk-Regular': require('../assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('../assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-SemiBold': require('../assets/fonts/SpaceGrotesk-SemiBold.ttf'),
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceGrotesk-Bold.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Register push token when user signs in
      if (newSession?.user) {
        registerForPushNotifications().then((token) => {
          if (token) savePushTokenToProfile(token);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const appReady = (fontsLoaded || !!fontError) && !authLoading;

  useEffect(() => {
    if (appReady && Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  const authValue = useMemo(() => ({
    session,
    userId: session?.user.id ?? null,
    displayName: session?.user.user_metadata?.full_name ?? session?.user.email ?? null,
  }), [session]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthContext.Provider value={authValue}>
        <QueryClientProvider client={queryClient}>
          <AuthGate session={session} isLoading={authLoading} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(more)" />
          </Stack>
        </QueryClientProvider>
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
}
