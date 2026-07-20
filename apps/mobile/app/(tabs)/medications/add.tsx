import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFamilyMembers } from '../../../lib/queries/family';
import { useAddMedication, useMedications } from '../../../lib/queries/medications';
import { useCheckDrugInteractions } from '../../../lib/queries/health-score';
import { scheduleRemindersForMedication } from '../../../lib/notifications';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'As needed'] as const;
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Bedtime'] as const;
const FORMS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Topical'] as const;

export default function AddMedication() {
  const router = useRouter();
  const { data: members } = useFamilyMembers();
  const { data: existingMedications } = useMedications();
  const addMedication = useAddMedication();
  const checkInteractions = useCheckDrugInteractions();

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [withFood, setWithFood] = useState('');
  const [notes, setNotes] = useState('');
  const [interactionWarning, setInteractionWarning] = useState<string | null>(null);
  const [interactionAcknowledged, setInteractionAcknowledged] = useState(false);

  const toggleSlot = useCallback((slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  }, []);

  // Reset interaction warning when medication name changes
  const handleNameChange = useCallback((val: string) => {
    setName(val);
    setInteractionWarning(null);
    setInteractionAcknowledged(false);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const canSave =
    selectedMemberId.length > 0 &&
    name.trim().length > 0 &&
    frequency.length > 0 &&
    selectedSlots.length > 0 &&
    (!interactionWarning || interactionAcknowledged);

  const handleSave = useCallback(async () => {
    if (!canSave || addMedication.isPending) return;

    // Check drug interactions before saving (if we haven't already)
    if (!interactionWarning && !interactionAcknowledged) {
      const memberMeds = (existingMedications ?? [])
        .filter((m: any) => m.family_member_id === selectedMemberId)
        .map((m: any) => `${m.name}${m.dosage ? ` ${m.dosage}` : ''}`);

      if (memberMeds.length > 0) {
        try {
          const result = await checkInteractions.mutateAsync({
            new_medication: `${name.trim()}${dosage ? ` ${dosage}` : ''}`,
            existing_medications: memberMeds,
          });
          if (result.has_interaction && result.severity !== 'none') {
            const interactionLines = result.interactions.map((i) =>
              `• ${i.drug_a} + ${i.drug_b} (${i.severity}): ${i.clinical_effect}`
            ).join('\n');
            setInteractionWarning(
              `${result.overall_recommendation}\n\n${interactionLines}`
            );
            return; // Don't save yet — user must acknowledge
          }
        } catch {
          // Interaction check failed — proceed without blocking
        }
      }
    }

    try {
      const savedMed = await addMedication.mutateAsync({
        family_member_id: selectedMemberId,
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        form: form || undefined,
        frequency,
        times_of_day: selectedSlots,
        with_food: withFood || undefined,
        start_date: today,
        notes: notes.trim() || undefined,
        reminder_enabled: true,
      });
      // Schedule local push notifications for each time slot
      const memberName = members?.find((m) => m.id === selectedMemberId)?.name ?? '';
      if (savedMed && selectedSlots.length > 0) {
        await scheduleRemindersForMedication({
          medicationId: (savedMed as any).id,
          medicationName: name.trim(),
          memberName,
          timesOfDay: selectedSlots,
          reminderEnabled: true,
        }).catch(() => {}); // Non-blocking
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save medication. Please try again.');
    }
  }, [canSave, addMedication, checkInteractions, existingMedications, interactionWarning, interactionAcknowledged, selectedMemberId, name, dosage, form, frequency, selectedSlots, withFood, today, notes, members, router]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Add Medication</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Family member */}
        <View style={styles.field}>
          <Text style={styles.label}>For Family Member <Text style={styles.required}>*</Text></Text>
          {!members || members.length === 0 ? (
            <Text style={styles.noMembersHint}>
              Add a family member first before adding medications.
            </Text>
          ) : (
            <View style={styles.chipRow}>
              {members.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.chip, selectedMemberId === m.id && styles.chipSelected]}
                  onPress={() => setSelectedMemberId(m.id)}
                >
                  <Text style={[styles.chipText, selectedMemberId === m.id && styles.chipTextSelected]}>
                    {m.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Medication name */}
        <View style={styles.field}>
          <Text style={styles.label}>Medication Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Metformin 500mg"
            placeholderTextColor="#A1A1AA"
            value={name}
            onChangeText={handleNameChange}
          />
        </View>

        {/* Dosage + Form */}
        <View style={styles.field}>
          <Text style={styles.label}>Dosage & Form</Text>
          <View style={styles.rowFields}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="e.g. 500mg"
              placeholderTextColor="#A1A1AA"
              value={dosage}
              onChangeText={setDosage}
            />
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              <View style={styles.miniChipRow}>
                {FORMS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, styles.chipMini, form === f && styles.chipSelected]}
                    onPress={() => setForm(form === f ? '' : f)}
                  >
                    <Text style={[styles.chipText, form === f && styles.chipTextSelected]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.field}>
          <Text style={styles.label}>Frequency <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, frequency === f && styles.chipSelected]}
                onPress={() => setFrequency(f)}
              >
                <Text style={[styles.chipText, frequency === f && styles.chipTextSelected]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Times */}
        <View style={styles.field}>
          <Text style={styles.label}>When to take <Text style={styles.required}>*</Text></Text>
          <View style={styles.chipRow}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.chip, selectedSlots.includes(slot) && styles.chipSelected]}
                onPress={() => toggleSlot(slot)}
              >
                <Text style={[styles.chipText, selectedSlots.includes(slot) && styles.chipTextSelected]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* With food */}
        <View style={styles.field}>
          <Text style={styles.label}>With Food</Text>
          <View style={styles.chipRow}>
            {(['Yes', 'No', "Doesn't matter"] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, withFood === opt && styles.chipSelected]}
                onPress={() => setWithFood(withFood === opt ? '' : opt)}
              >
                <Text style={[styles.chipText, withFood === opt && styles.chipTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes / Instructions</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            placeholder="e.g. Take with meals to reduce stomach upset"
            placeholderTextColor="#A1A1AA"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Drug interaction warning */}
        {checkInteractions.isPending && (
          <View style={styles.checkingCard}>
            <ActivityIndicator size="small" color="#D4A017" />
            <Text style={styles.checkingText}>Checking drug interactions…</Text>
          </View>
        )}
        {interactionWarning && !interactionAcknowledged && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠ Drug Interaction Detected</Text>
            <Text style={styles.warningText}>{interactionWarning}</Text>
            <Text style={styles.warningDisclaimer}>
              Prakrit AI is not a substitute for professional medical advice. Consult your doctor or pharmacist.
            </Text>
            <View style={styles.warningActions}>
              <TouchableOpacity style={styles.warningAckBtn} onPress={() => setInteractionAcknowledged(true)}>
                <Text style={styles.warningAckBtnText}>I understand, proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.warningCancelBtn} onPress={() => router.back()}>
                <Text style={styles.warningCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, (!canSave || addMedication.isPending || checkInteractions.isPending) && styles.saveBtnDisabled]}
          disabled={!canSave || addMedication.isPending || checkInteractions.isPending}
          onPress={handleSave}
        >
          {addMedication.isPending || checkInteractions.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save Medication</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
        </Text>

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

  field: { marginBottom: 20 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B', marginBottom: 8 },
  required: { color: '#EF4444' },
  noMembersHint: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' },

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#09090B',
  },
  inputMulti: { height: 90, textAlignVertical: 'top', paddingTop: 12 },

  rowFields: { flexDirection: 'row', alignItems: 'flex-start' },
  miniChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipMini: { paddingHorizontal: 10, paddingVertical: 6 },
  chipSelected: { backgroundColor: '#09090B', borderColor: '#09090B' },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  chipTextSelected: { color: '#FFFFFF' },

  saveBtn: {
    backgroundColor: '#09090B',
    borderRadius: 13,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  checkingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  checkingText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#8a5e0a' },

  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  warningTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15, color: '#8a5e0a' },
  warningText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#78350f', lineHeight: 19 },
  warningDisclaimer: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#92400e', fontStyle: 'italic' },
  warningActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  warningAckBtn: {
    flex: 1, backgroundColor: '#09090B', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  warningAckBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFFFFF' },
  warningCancelBtn: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E4E4E7',
    paddingVertical: 10, alignItems: 'center',
  },
  warningCancelBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#71717A' },

  disclaimer: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA', textAlign: 'center' },
});
