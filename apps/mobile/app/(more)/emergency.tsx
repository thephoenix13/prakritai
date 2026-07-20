import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Linking,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useFamilyMembers } from '../../lib/queries/family';
import { useEmergencyInfo } from '../../lib/queries/emergency';
import { useMedications } from '../../lib/queries/medications';

// ─── Severity badge colours ───────────────────────────────────────────────────
const SEVERITY: Record<string, { bg: string; text: string; label: string }> = {
  severe:   { bg: '#FEE2E2', text: '#b91c1c', label: 'Severe' },
  moderate: { bg: '#FEF3C7', text: '#8a5e0a', label: 'Moderate' },
  mild:     { bg: '#CCFBF1', text: '#00725E', label: 'Mild' },
};

function severityStyle(raw: string) {
  return SEVERITY[raw?.toLowerCase()] ?? SEVERITY.mild;
}

// ─── Small reusable sub-components ───────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{title}</Text>
      {children}
    </View>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <Text style={styles.emptyNote}>{text}</Text>;
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function EmergencyCard() {
  const router = useRouter();
  const { data: members, isLoading: membersLoading } = useFamilyMembers();

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // After members load, default to first member
  const resolvedId = selectedId ?? members?.[0]?.id;
  const selectedMember = members?.find((m) => m.id === resolvedId);

  const { data: emergencyInfo, isLoading: emergencyLoading } = useEmergencyInfo(resolvedId);
  const { data: medications, isLoading: medsLoading } = useMedications(resolvedId);

  const isLoading = membersLoading || emergencyLoading || medsLoading;

  async function handleShare() {
    if (!emergencyInfo?.public_token) return;
    await Share.share({
      url: `https://prakrit.ai/emergency/${emergencyInfo.public_token}`,
      message: `Emergency health info for ${selectedMember?.name ?? 'family member'}: https://prakrit.ai/emergency/${emergencyInfo.public_token}`,
    });
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke="#09090B"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Card</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── Member picker chips ── */}
      {!membersLoading && members && members.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {members.map((m) => {
            const active = m.id === resolvedId;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedId(m.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {m.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00B894" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Blood Type */}
          <SectionCard title="Blood Type">
            <Text style={styles.bloodType}>
              {selectedMember?.blood_type ?? '?'}
            </Text>
          </SectionCard>

          {/* Allergies */}
          <SectionCard title="Allergies">
            {emergencyInfo?.allergies && emergencyInfo.allergies.length > 0 ? (
              emergencyInfo.allergies.map((a: { name: string; severity: string }, idx: number) => {
                const sev = severityStyle(a.severity);
                return (
                  <View key={idx} style={styles.allergyRow}>
                    <Text style={styles.allergyName}>{a.name}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
                      <Text style={[styles.severityText, { color: sev.text }]}>{sev.label}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <EmptyNote text="No known allergies" />
            )}
          </SectionCard>

          {/* Conditions */}
          <SectionCard title="Medical Conditions">
            {emergencyInfo?.conditions && emergencyInfo.conditions.length > 0 ? (
              emergencyInfo.conditions.map((c: string, idx: number) => (
                <View key={idx} style={styles.conditionRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.conditionText}>{c}</Text>
                </View>
              ))
            ) : (
              <EmptyNote text="No known conditions" />
            )}
          </SectionCard>

          {/* Current Medications */}
          <SectionCard title="Current Medications">
            {medsLoading ? (
              <ActivityIndicator size="small" color="#00B894" />
            ) : medications && medications.length > 0 ? (
              medications.map((med: { id: string; name: string; dosage?: string }) => (
                <View key={med.id} style={styles.medRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.medName}>{med.name}</Text>
                  {med.dosage ? (
                    <Text style={styles.medDosage}>{med.dosage}</Text>
                  ) : null}
                </View>
              ))
            ) : (
              <EmptyNote text="No active medications" />
            )}
          </SectionCard>

          {/* Emergency Contacts */}
          <SectionCard title="Emergency Contacts">
            {emergencyInfo?.emergency_contacts && emergencyInfo.emergency_contacts.length > 0 ? (
              emergencyInfo.emergency_contacts.map(
                (ec: { name: string; relationship: string; phone: string; priority: number }, idx: number) => (
                  <View key={idx} style={styles.contactCard}>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{ec.name}</Text>
                      <Text style={styles.contactRelation}>{ec.relationship}</Text>
                      <Text style={styles.contactPhone}>{ec.phone}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => Linking.openURL(`tel:${ec.phone}`)}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.07 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <Text style={styles.callBtnText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                )
              )
            ) : (
              <EmptyNote text="No emergency contacts added" />
            )}
          </SectionCard>

          {/* No emergency info empty state */}
          {!emergencyInfo && !emergencyLoading && (
            <View style={styles.setupCard}>
              <Text style={styles.setupTitle}>Set up Emergency Card</Text>
              <Text style={styles.setupText}>
                Emergency information will be populated from health records added to PrakritAI. Add
                medical conditions, allergies, and emergency contacts to enable this card.
              </Text>
            </View>
          )}

          {/* Share button */}
          {emergencyInfo?.public_token ? (
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.shareBtnText}>Share Emergency Card</Text>
            </TouchableOpacity>
          ) : null}

          {/* Notes */}
          {emergencyInfo?.notes ? (
            <SectionCard title="Notes">
              <Text style={styles.notesText}>{emergencyInfo.notes}</Text>
            </SectionCard>
          ) : null}

          {/* Medical disclaimer */}
          <Text style={styles.disclaimer}>
            Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
            Always consult a qualified healthcare professional in an emergency.
          </Text>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B' },

  chipsRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  chipActive: {
    backgroundColor: '#09090B',
    borderColor: '#09090B',
  },
  chipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#71717A',
  },
  chipTextActive: { color: '#FFFFFF' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  content: { paddingHorizontal: 20 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },

  // Blood type
  bloodType: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 60,
    color: '#00B894',
    lineHeight: 68,
  },

  // Allergies
  allergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  allergyName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B', flex: 1 },
  severityBadge: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
  severityText: { fontFamily: 'Inter-SemiBold', fontSize: 11 },

  // Conditions & meds
  conditionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00B894',
    marginRight: 10,
  },
  conditionText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', flex: 1 },
  medRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  medName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B', flex: 1 },
  medDosage: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginLeft: 8 },

  emptyNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#A1A1AA',
    fontStyle: 'italic',
  },

  // Emergency contacts
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  contactInfo: { flex: 1 },
  contactName: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  contactRelation: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 1 },
  contactPhone: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#00B894', marginTop: 2 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00B894',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  callBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#FFFFFF' },

  // Empty / setup state
  setupCard: {
    backgroundColor: '#E8FDF8',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  setupTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 15,
    color: '#00725E',
    marginBottom: 6,
  },
  setupText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#00725E',
    lineHeight: 19,
  },

  // Share button
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B894',
    borderRadius: 13,
    height: 50,
    marginBottom: 16,
  },
  shareBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  // Notes
  notesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#09090B',
    lineHeight: 19,
  },

  // Disclaimer
  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    paddingHorizontal: 8,
  },
});
