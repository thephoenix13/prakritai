import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Avatar } from '../../../components/ui/Avatar';

const DOCTORS: Record<string, any> = {
  d1: {
    id: 'd1', name: 'Dr. Anjali Mehta', specialty: 'General Physician',
    hospital: 'Apollo Hospital', city: 'Mumbai', address: 'Juhu, Mumbai 400049',
    phone: '+91 22 2626 7700', email: 'anjali.mehta@apollo.com',
    rating: 4.8, consultations: 12,
    lastVisit: 'Jun 25, 2026', nextVisit: 'Sep 25, 2026',
    patients: ['Priya Sharma', 'Ramesh Sharma', 'Meera Devi'],
    notes: 'Primary care physician for the entire family. Dr. Mehta has been managing Ramesh\'s diabetes since 2024. Preferred for all routine checkups.',
    prescriptions: [
      { id: 'p1', date: 'Jun 25, 2026', for: 'Ramesh', drugs: 'Metformin 500mg, Telmisartan 40mg' },
    ],
  },
  d2: {
    id: 'd2', name: 'Dr. Suresh Patel', specialty: 'Endocrinologist',
    hospital: 'Fortis Hospital', city: 'Mumbai', address: 'Mulund, Mumbai 400080',
    phone: '+91 22 6799 9999', email: null,
    rating: 4.7, consultations: 3,
    lastVisit: 'Apr 10, 2026', nextVisit: null,
    patients: ['Ramesh Sharma'],
    notes: 'Specialist for Ramesh\'s Type 2 Diabetes management. Referred by Dr. Anjali Mehta.',
    prescriptions: [],
  },
};

export default function DoctorDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const doctor = DOCTORS[id] ?? DOCTORS['d1'];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Doctor Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile card */}
        <View style={styles.heroCard}>
          <Avatar name={doctor.name} size={64} bg="#E0E7FF" textColor="#3730a3" />
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={styles.docName}>{doctor.name}</Text>
            <Text style={styles.docSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.docHospital}>{doctor.hospital} · {doctor.city}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>⭐ {doctor.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{doctor.consultations}</Text>
                <Text style={styles.statLabel}>Visits</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL(`tel:${doctor.phone}`)}
          >
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactValue}>{doctor.phone}</Text>
          </TouchableOpacity>
          {doctor.email && (
            <TouchableOpacity
              style={[styles.contactRow, { marginTop: 6 }]}
              onPress={() => Linking.openURL(`mailto:${doctor.email}`)}
            >
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactValue}>{doctor.email}</Text>
            </TouchableOpacity>
          )}
          <View style={[styles.contactRow, { marginTop: 6 }]}>
            <Text style={styles.contactIcon}>📍</Text>
            <Text style={styles.contactValue}>{doctor.address}</Text>
          </View>
        </View>

        {/* Visits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointments</Text>
          <View style={styles.visitRow}>
            <Text style={styles.visitLabel}>Last Visit</Text>
            <Text style={styles.visitValue}>{doctor.lastVisit}</Text>
          </View>
          <View style={[styles.visitRow, { marginTop: 6 }]}>
            <Text style={styles.visitLabel}>Next Visit</Text>
            <Text style={[styles.visitValue, { color: doctor.nextVisit ? '#00B894' : '#A1A1AA' }]}>
              {doctor.nextVisit ?? 'Not scheduled'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.scheduleBtn}
            onPress={() => Alert.alert('Schedule Appointment', 'Appointment scheduling coming soon.')}
          >
            <Text style={styles.scheduleBtnText}>Schedule Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* Patients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treating Family Members</Text>
          {doctor.patients.map((p: string) => (
            <View key={p} style={styles.patientRow}>
              <Avatar name={p} size={32} />
              <Text style={styles.patientName}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {doctor.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{doctor.notes}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 22, color: '#09090B' },
  navTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B' },
  content: { paddingHorizontal: 20 },

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  docName: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B', marginTop: 4 },
  docSpecialty: { fontFamily: 'Inter-Medium', fontSize: 14, color: '#00B894', marginTop: 2 },
  docHospital: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 32, marginTop: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#09090B' },
  statLabel: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#71717A', marginTop: 2 },

  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B', marginBottom: 12 },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
  },
  contactIcon: { fontSize: 18 },
  contactValue: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', flex: 1 },

  visitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
  },
  visitLabel: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#71717A' },
  visitValue: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  scheduleBtn: {
    marginTop: 10,
    backgroundColor: '#09090B',
    borderRadius: 13,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 12,
    marginBottom: 6,
  },
  patientName: { fontFamily: 'Inter-Medium', fontSize: 14, color: '#09090B' },

  notesCard: {
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  notesText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', lineHeight: 20 },
});
