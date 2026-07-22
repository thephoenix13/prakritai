import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { DOCUMENTS, DOCUMENTS_BY_ID, LAB_CARD_IDS } from '../../../lib/data/documents';

const GRADE_CFG: Record<string, { bg: string; color: string }> = {
  A:  { bg: '#CCFBF1', color: '#00725E' },
  B:  { bg: '#FEF3C7', color: '#8a5e0a' },
  C:  { bg: '#FCE7F3', color: '#be185d' },
  D:  { bg: '#FEE2E2', color: '#b91c1c' },
  Rx: { bg: '#F4F4F5', color: '#71717A' },
};

const TABS = ['All', 'Lab Reports', 'Prescriptions', 'Scans'];

function GradeBadge({ grade }: { grade: string }) {
  const c = GRADE_CFG[grade] ?? GRADE_CFG.A;
  return (
    <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 11, color: c.color }}>{grade}</Text>
    </View>
  );
}

function DocIcon({ type }: { type: string }) {
  if (type === 'Prescriptions') {
    return (
      <View style={{ width: 44, height: 52, backgroundColor: '#FEF3C7', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="#D4A017" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }
  return (
    <View style={{ width: 44, height: 52, backgroundColor: '#E8FDF8', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14 2v6h6" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export default function DocumentsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = DOCUMENTS.filter(d => {
    const matchTab = activeTab === 'All' || d.type === activeTab;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 2, paddingBottom: 12 }}>
        <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 26, color: '#09090B', letterSpacing: -0.5 }}>Documents</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/documents/upload')} activeOpacity={0.85}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F4F4F5', borderWidth: 1.5, borderColor: '#E4E4E7', borderRadius: 12, height: 44, paddingHorizontal: 14 }}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx="11" cy="11" r="8" stroke="#A1A1AA" strokeWidth={2} />
            <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search reports, prescriptions…"
            placeholderTextColor="#A1A1AA"
            style={{ flex: 1, fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B' }}
          />
        </View>
      </View>

      {/* Filter tabs */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: '#E4E4E7', marginBottom: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, flexDirection: 'row' }}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} activeOpacity={0.7}
              style={{ paddingHorizontal: 14, paddingVertical: 10, marginRight: 2, position: 'relative' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: activeTab === tab ? '#09090B' : '#A1A1AA' }}>{tab}</Text>
              {activeTab === tab && (
                <View style={{ position: 'absolute', bottom: -1, left: 14, right: 14, height: 2, backgroundColor: '#09090B', borderRadius: 2 }} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Recent docs */}
        <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
          <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 10 }}>Recent</Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {filtered.map(doc => (
              <TouchableOpacity key={doc.id} activeOpacity={0.7} onPress={() => router.push(`/(tabs)/documents/${doc.id}`)}
                style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 16 }}>
                <DocIcon type={doc.type} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 13, color: '#09090B' }}>{doc.name}</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>{doc.lab}</Text>
                </View>
                <GradeBadge grade={doc.grade} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Lab Reports horizontal scroll */}
          {(activeTab === 'All' || activeTab === 'Lab Reports') && (
            <>
              <Text style={{ fontFamily: 'SpaceGrotesk-Bold', fontSize: 15, color: '#09090B', marginBottom: 10 }}>Lab Reports</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}>
                {LAB_CARD_IDS.map(lid => {
                  const card = DOCUMENTS_BY_ID[lid];
                  if (!card) return null;
                  return (
                    <TouchableOpacity key={card.id} activeOpacity={0.7} onPress={() => router.push(`/(tabs)/documents/${card.id}`)}
                      style={{ width: 120, height: 140, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4E7', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}>
                      <View style={{ width: 44, height: 52, backgroundColor: '#E8FDF8', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                          <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          <Path d="M14 2v6h6" stroke="#00B894" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={{ fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 11, color: '#09090B', textAlign: 'center', lineHeight: 16 }}>
                        {card.name}{'\n'}{card.date}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
