import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Google Sign-In requires a native dev build — not available in Expo Go
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  });
} catch { /* Expo Go — unavailable */ }

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

export default function SignInScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [email, setEmail] = useState('');

  async function handleGoogleSignIn() {
    if (!GoogleSignin) {
      Alert.alert('Not available', 'Google Sign-In requires a development build.');
      return;
    }
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken;
      if (!idToken) throw new Error('No ID token');
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) throw error;
    } catch {
      Alert.alert('Sign in failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    // TODO: restore auth — navigating to profile setup for testing
    router.push('/(onboarding)/profile-setup');
    return;
    try {
      setLoading(true);
      const emailValue = phone.trim()
        ? `${phone.replace(/\D/g, '')}@prakrit.ai`
        : email.trim();
      const { error } = await supabase.auth.signInWithPassword({ email: emailValue, password });
      if (error) throw error;
    } catch {
      Alert.alert('Sign in failed', 'Incorrect phone number or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 10, paddingBottom: 36 }}>
            {/* Wordmark */}
            <View style={{ marginBottom: 28, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1, marginBottom: 8 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#09090B' }}>prakrit</Text>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 22, color: '#00B894' }}>.ai</Text>
              </View>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: '#09090B', marginBottom: 4 }}>Welcome back</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#A1A1AA' }}>Sign in to your account</Text>
            </View>

            {/* Google */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={{ width: '100%', height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#E4E4E7', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}
              activeOpacity={0.85}
            >
              <GoogleIcon />
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 14, color: '#09090B' }}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', marginBottom: 14 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E4E4E7' }} />
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#A1A1AA' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E4E4E7' }} />
            </View>

            {/* Phone */}
            <View style={{ width: '100%', marginBottom: 10 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 5 }}>Phone number</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 12, height: 48, backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                <View style={{ paddingHorizontal: 14, borderRightWidth: 1, borderRightColor: '#E4E4E7', height: '100%', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#71717A' }}>+91</Text>
                </View>
                <TextInput
                  style={{ flex: 1, paddingHorizontal: 14, fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', height: '100%' }}
                  placeholder="Phone number"
                  placeholderTextColor="#A1A1AA"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View style={{ width: '100%', marginBottom: 14 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 5 }}>Password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 12, height: 48, backgroundColor: '#FFFFFF' }}>
                <TextInput
                  style={{ flex: 1, paddingHorizontal: 14, fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', height: '100%' }}
                  placeholder="Password"
                  placeholderTextColor="#A1A1AA"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={{ paddingHorizontal: 14 }} activeOpacity={0.7}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#00B894' }}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              style={{ width: '100%', height: 52, backgroundColor: '#09090B', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#FFFFFF' }}>Sign in</Text>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12h14M12 5l7 7-7 7" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>

            {/* Forgot password */}
            <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 20 }}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#00B894' }}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Other sign-in options */}
            <TouchableOpacity
              onPress={() => setShowOtherOptions(v => !v)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: showOtherOptions ? 14 : 20 }}
              activeOpacity={0.7}
            >
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#A1A1AA' }}>Other sign-in options</Text>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Path d={showOtherOptions ? "M18 15L12 9 6 15" : "M6 9l6 6 6-6"} stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            {showOtherOptions && (
              <View style={{ width: '100%', marginBottom: 20 }}>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#71717A', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 5 }}>Email address</Text>
                  <TextInput
                    style={{ borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 12, height: 48, paddingHorizontal: 14, fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', backgroundColor: '#FFFFFF' }}
                    placeholder="you@example.com"
                    placeholderTextColor="#A1A1AA"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            {/* Create account link */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA' }}>New here?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 12, color: '#00B894' }}>Create account</Text>
                <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12h14M12 5l7 7-7 7" stroke="#00B894" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
