import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

// Google Sign-In requires a native dev build — not available in Expo Go
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  });
} catch {
  // Running in Expo Go — Google Sign-In unavailable
}

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  async function handleGoogleSignIn() {
    if (!GoogleSignin) {
      Alert.alert('Not available', 'Google Sign-In requires a development build. Use email/phone to sign in.');
      return;
    }
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken;
      if (!idToken) throw new Error('No ID token returned');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Sign in failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneSignIn() {
    if (!phone || !password) {
      Alert.alert('Missing fields', 'Please enter your phone number and password.');
      return;
    }
    try {
      setLoading(true);
      const emailFromPhone = `${phone.replace(/\D/g, '')}@prakrit.ai`;
      if (mode === 'sign-up') {
        const { error } = await supabase.auth.signUp({
          email: emailFromPhone,
          password,
          options: { data: { display_name: name, phone } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailFromPhone,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert('Error', 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSignIn() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      if (mode === 'sign-up') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert('Error', 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-12 pb-8">
            {/* Logo */}
            <View className="mb-10">
              <Text className="font-space-grotesk-bold text-3xl text-text">Prakrit AI</Text>
              <Text className="font-inter text-text-secondary mt-1">
                Your family's health intelligence
              </Text>
            </View>

            {/* Mode toggle */}
            <View className="flex-row bg-surface rounded-button p-1 mb-8">
              {(['sign-in', 'sign-up'] as Mode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-[10px] items-center ${
                    mode === m ? 'bg-white' : ''
                  }`}
                >
                  <Text
                    className={`font-inter-medium text-sm ${
                      mode === m ? 'text-text' : 'text-text-secondary'
                    }`}
                  >
                    {m === 'sign-in' ? 'Sign in' : 'Create account'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Google Sign-In */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={loading}
              className="h-[50px] bg-text rounded-button flex-row items-center justify-center mb-4"
            >
              <Text className="font-space-grotesk-bold text-sm text-white ml-2">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-border" />
              <Text className="font-inter text-text-tertiary text-xs mx-3">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Phone + Password */}
            {mode === 'sign-up' && (
              <TextInput
                className="h-[50px] border border-border rounded-button px-4 font-inter text-text mb-3"
                placeholder="Full name"
                placeholderTextColor="#A1A1AA"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            <TextInput
              className="h-[50px] border border-border rounded-button px-4 font-inter text-text mb-3"
              placeholder="+91 Phone number"
              placeholderTextColor="#A1A1AA"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              className="h-[50px] border border-border rounded-button px-4 font-inter text-text mb-4"
              placeholder="Password"
              placeholderTextColor="#A1A1AA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={handlePhoneSignIn}
              disabled={loading}
              className="h-[50px] bg-teal rounded-button items-center justify-center mb-4"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-space-grotesk-bold text-sm text-white">
                  {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Email (collapsed) */}
            <TouchableOpacity
              onPress={() => setShowEmailForm((v) => !v)}
              className="items-center mb-3"
            >
              <Text className="font-inter text-text-secondary text-sm">
                {showEmailForm ? 'Hide other options' : 'Other options'}
              </Text>
            </TouchableOpacity>

            {showEmailForm && (
              <View>
                <TextInput
                  className="h-[50px] border border-border rounded-button px-4 font-inter text-text mb-3"
                  placeholder="Email address"
                  placeholderTextColor="#A1A1AA"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={handleEmailSignIn}
                  disabled={loading}
                  className="h-[50px] border border-border rounded-button items-center justify-center"
                >
                  <Text className="font-inter-medium text-sm text-text">
                    Continue with email
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Disclaimer */}
            <Text className="font-inter text-text-tertiary text-xs text-center mt-8 leading-5">
              Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
