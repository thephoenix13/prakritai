import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Clipboard, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';

const INVITE_LINK = 'prakrit.ai/join/a8f2k9mxpq';
const INVITE_URL  = `https://${INVITE_LINK}`;

// WhatsApp message — matches what recipient sees on screen 25
const WA_MESSAGE =
  'Priya Sharma is inviting you to join her Family Health Circle on Prakrit AI.\n\n' +
  'Tap to join:\n' +
  INVITE_URL;

export default function InviteToCircleScreen() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(INVITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(WA_MESSAGE)}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to web WhatsApp
        Linking.openURL(`https://wa.me/?text=${encodeURIComponent(WA_MESSAGE)}`);
      }
    });
  };

  const handleSMS = () => {
    Linking.openURL(`sms:?body=${encodeURIComponent(WA_MESSAGE)}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B', letterSpacing: -0.4 }}>Invite to Circle</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>

        {/* Explanation */}
        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', lineHeight: 20, marginBottom: 24 }}>
          Share this link with a family member or caregiver. When they open it, they'll request to join your circle. You approve or decline.
        </Text>

        {/* Invite link card */}
        <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 12, color: '#71717A', marginBottom: 10 }}>Your Invite Link</Text>

          {/* Link row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F4F4F5', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: '#09090B', flex: 1 }}>{INVITE_LINK}</Text>
            <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}
              style={{ paddingHorizontal: 12, height: 28, borderRadius: 7, backgroundColor: copied ? '#00B894' : '#09090B', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: '#FFFFFF' }}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>

          {/* Info row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#A1A1AA" strokeWidth="1.8" strokeLinecap="round" />
              <Path d="M12 8v4M12 16h.01" stroke="#A1A1AA" strokeWidth="1.8" strokeLinecap="round" />
            </Svg>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' }}>
              Valid for 48 hours · One use only · You control approval
            </Text>
          </View>
        </View>

        {/* Share via */}
        <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#71717A', marginBottom: 10 }}>Share via</Text>
        <View style={{ gap: 10, marginBottom: 20 }}>

          {/* WhatsApp */}
          <TouchableOpacity onPress={handleWhatsApp} activeOpacity={0.8}
            style={{ backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#25D366', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 }}>
            {/* WhatsApp icon */}
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>Share on WhatsApp</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A', marginTop: 2 }}>Fastest — they can join in one tap</Text>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18l6-6-6-6" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          {/* SMS */}
          <TouchableOpacity onPress={handleSMS} activeOpacity={0.8}
            style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F4F5', alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#09090B' }}>Send via SMS</Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A', marginTop: 2 }}>Send to their phone number</Text>
            </View>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18l6-6-6-6" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Secondary actions */}
        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#00B894' }}>Show QR code instead →</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#A1A1AA' }}>Regenerate link</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
