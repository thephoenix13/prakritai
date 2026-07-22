import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AIIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}


function FamilyIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7} r={3} stroke={color} strokeWidth={1.8} />
      <Path d="M3 21C3 17.69 5.69 15 9 15C12.31 15 15 17.69 15 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={18} cy={8} r={2} stroke={color} strokeWidth={1.8} />
      <Path d="M15.5 21C15.5 18.51 16.57 16.28 18 15.18C19.43 16.28 20.5 18.51 20.5 21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function MedsIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function DocsIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M14 2v6h6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function InsightsIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TabIcon({
  icon: Icon,
  focused,
  label,
}: {
  icon: React.FC<{ color: string }>;
  focused: boolean;
  label: string;
}) {
  const color = focused ? '#09090B' : '#A1A1AA';
  return (
    <View style={styles.tabItem}>
      <Icon color={color} />
      <Text style={[styles.tabLabel, { color, fontFamily: focused ? 'SpaceGrotesk-SemiBold' : 'SpaceGrotesk-Regular' }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={HomeIcon} focused={focused} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={AIIcon} focused={focused} label="AI" />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={DocsIcon} focused={focused} label="Docs" />,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={FamilyIcon} focused={focused} label="Family" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={InsightsIcon} focused={focused} label="Insights" />,
        }}
      />
      {/* Sub-routes — hidden from tab bar */}
      <Tabs.Screen name="medications" options={{ href: null }} />
      <Tabs.Screen name="score" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
    paddingBottom: 0,
  },
  tabItem: {
    alignItems: 'center',
    paddingTop: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 1,
  },
});
