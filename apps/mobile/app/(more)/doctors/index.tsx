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
import { Avatar } from '../../../components/ui/Avatar';

const DOCTORS = [
  {
    id: 'd1', name: 'Dr. Anjali Mehta', specialty: 'General Physician',
    hospital: 'Apollo Hospital', city: 'Mumbai',
    lastVisit: 'Jun 25, 2026', nextVisit: 'Sep 25, 2026',
    rating: 4.8, consultations: 12,
  },
  {
    id: 'd2', name: 'Dr. Suresh Patel', specialty: 'Endocrinologist',
    hospital: 'Fortis Hospital', city: 'Mumbai',
    lastVisit: 'Apr 10, 2026', nextVisit: null,
    rating: 4.7, consultations: 3,
  },
  {
    id: 'd3', name: 'Dr. Nita Rao', specialty: 'Cardiologist',
    hospital: 'Lilavati Hospital', city: 'Mumbai',
    lastVisit: 'Jan 15, 2026', nextVisit: null,
    rating: 4.9, consultations: 1,
  },
];

export default function Doctors() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Doctor Network</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {DOCTORS.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={styles.docCard}
            onPress={() => router.push(`/(more)/doctors/${doc.id}` as any)}
            activeOpacity={0.85}
          >
            <Avatar name={doc.name} size={52} bg="#E0E7FF" textColor="#3730a3" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.docName}>{doc.name}</Text>
              <Text style={styles.docSpecialty}>{doc.specialty}</Text>
              <Text style={styles.docHospital}>{doc.hospital}, {doc.city}</Text>
              <View style={styles.docMeta}>
                <Text style={styles.docMetaText}>⭐ {doc.rating}</Text>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.docMetaText}>{doc.consultations} visits</Text>
                {doc.nextVisit && (
                  <>
                    <Text style={styles.dot}>·</Text>
                    <Text style={[styles.docMetaText, { color: '#00B894' }]}>Next: {doc.nextVisit}</Text>
                  </>
                )}
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Add doctor CTA */}
        <TouchableOpacity style={styles.addCard}>
          <Text style={styles.addCardIcon}>🩺</Text>
          <View>
            <Text style={styles.addCardTitle}>Add a Doctor</Text>
            <Text style={styles.addCardSub}>Keep track of your healthcare providers</Text>
          </View>
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: '#09090B' },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B' },
  addBtn: { backgroundColor: '#09090B', borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFFFFF' },
  content: { paddingHorizontal: 20 },

  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 10,
  },
  docName: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15, color: '#09090B' },
  docSpecialty: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#00B894', marginTop: 2 },
  docHospital: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 1 },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  docMetaText: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A' },
  dot: { color: '#A1A1AA' },
  arrow: { fontSize: 20, color: '#A1A1AA' },

  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 10,
  },
  addCardIcon: { fontSize: 28 },
  addCardTitle: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  addCardSub: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
});
