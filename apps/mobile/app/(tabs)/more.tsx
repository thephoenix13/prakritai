import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { Avatar } from '../../components/ui/Avatar';

type MenuRoute =
  | '/(tabs)/documents'
  | '/(more)/timeline'
  | '/(more)/insights'
  | '/(more)/emergency'
  | '/(more)/doctors'
  | '/(more)/protocol'
  | '/(more)/settings'
  | '/(tabs)/family/circle';

const MENU_SECTIONS: Array<{
  title: string;
  items: Array<{ label: string; sublabel: string; route: MenuRoute; iconColor: string }>;
}> = [
  {
    title: 'Health',
    items: [
      { label: 'Documents', sublabel: '5 records uploaded', route: '/(tabs)/documents', iconColor: '#00B894' },
      { label: 'Health Timeline', sublabel: 'All events, chronologically', route: '/(more)/timeline', iconColor: '#D4A017' },
      { label: 'Health Insights', sublabel: 'Trends & analysis', route: '/(more)/insights', iconColor: '#F472B6' },
      { label: 'Personalized Protocol', sublabel: '30-day action plan', route: '/(more)/protocol', iconColor: '#00B894' },
    ],
  },
  {
    title: 'Safety',
    items: [
      { label: 'Emergency Card', sublabel: 'Offline-accessible critical info', route: '/(more)/emergency', iconColor: '#EF4444' },
      { label: 'Doctor Network', sublabel: 'Find & connect doctors', route: '/(more)/doctors', iconColor: '#00B894' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Family Circle', sublabel: 'Share access with caregivers', route: '/(tabs)/family/circle', iconColor: '#A1A1AA' },
      { label: 'Settings', sublabel: 'Profile, notifications, privacy', route: '/(more)/settings', iconColor: '#A1A1AA' },
    ],
  },
];

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke="#A1A1AA" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DotIcon({ color }: { color: string }) {
  return (
    <View style={[styles.menuDot, { backgroundColor: color + '22' }]}>
      <View style={[styles.menuDotInner, { backgroundColor: color }]} />
    </View>
  );
}

export default function More() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>More</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(more)/settings' as any)}
          style={styles.settingsBtn}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              stroke="#09090B"
              strokeWidth={1.8}
            />
            <Path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              stroke="#09090B"
              strokeWidth={1.8}
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <Avatar name="Priya Sharma" size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.profileName}>Priya Sharma</Text>
          <Text style={styles.profilePlan}>Free Plan · 4 members</Text>
        </View>
        <TouchableOpacity
          style={styles.upgradeChip}
          onPress={() => {}}
        >
          <Text style={styles.upgradeChipText}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <View style={styles.menuGroup}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <DotIcon color={item.iconColor} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuSublabel}>{item.sublabel}</Text>
                  </View>
                  <ChevronRight />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>PrakritAI v1.0.0 · prakrit.ai</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 12,
  },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.4 },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F4F4F5',
    alignItems: 'center', justifyContent: 'center',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  profileName: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15, color: '#09090B' },
  profilePlan: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 1 },
  upgradeChip: {
    backgroundColor: '#09090B',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  upgradeChipText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#FFFFFF' },

  content: { paddingHorizontal: 24 },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#A1A1AA',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#E4E4E7' },
  menuDot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDotInner: { width: 10, height: 10, borderRadius: 5 },
  menuLabel: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  menuSublabel: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 1 },

  version: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 12,
  },
});
