import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Avatar } from '../../../components/ui/Avatar';
import { useDocuments, useUploadDocument } from '../../../lib/queries/documents';
import { useFamilyMembers } from '../../../lib/queries/family';

const DOC_TYPES = ['Lab Report', 'Prescription', 'Scan', 'Hospital Discharge', 'Other'] as const;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  'Lab Report': { bg: '#CCFBF1', text: '#00725E' },
  'Prescription': { bg: '#FEF3C7', text: '#8a5e0a' },
  'Scan': { bg: '#E0E7FF', text: '#3730a3' },
  'Hospital Discharge': { bg: '#FCE7F3', text: '#be185d' },
  'Monitoring': { bg: '#E0E7FF', text: '#3730a3' },
  'Checkup': { bg: '#FCE7F3', text: '#be185d' },
  'Other': { bg: '#F4F4F5', text: '#71717A' },
};

function UploadModal({
  visible,
  onClose,
  members,
  onUpload,
  isUploading,
}: {
  visible: boolean;
  onClose: () => void;
  members: any[];
  onUpload: (params: {
    uri: string;
    fileName: string;
    mimeType: string;
    familyMemberId: string;
    documentType: string;
    title: string;
    source: 'camera' | 'gallery' | 'files';
  }) => void;
  isUploading: boolean;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [pickedFile, setPickedFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to photograph documents.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPickedFile({
        uri: asset.uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPickedFile({
        uri: asset.uri,
        name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  }, []);

  const pickFromFiles = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPickedFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/pdf',
      });
    }
  }, []);

  const canUpload = selectedMemberId && selectedType && pickedFile;
  const displayName = pickedFile?.name.length > 30
    ? pickedFile.name.slice(0, 27) + '...'
    : pickedFile?.name;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.root}>
        <View style={modal.header}>
          <Text style={modal.title}>Upload Document</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={modal.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={modal.content}>
          {/* Member */}
          <Text style={modal.label}>For Family Member *</Text>
          <View style={modal.chipRow}>
            {members.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[modal.chip, selectedMemberId === m.id && modal.chipSelected]}
                onPress={() => setSelectedMemberId(m.id)}
              >
                <Text style={[modal.chipText, selectedMemberId === m.id && modal.chipTextSelected]}>
                  {m.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Type */}
          <Text style={[modal.label, { marginTop: 20 }]}>Document Type *</Text>
          <View style={modal.chipRow}>
            {DOC_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[modal.chip, selectedType === t && modal.chipSelected]}
                onPress={() => setSelectedType(t)}
              >
                <Text style={[modal.chipText, selectedType === t && modal.chipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Source buttons */}
          <Text style={[modal.label, { marginTop: 20 }]}>Select File *</Text>
          <View style={modal.sourceRow}>
            <TouchableOpacity style={modal.sourceBtn} onPress={pickFromCamera}>
              <Text style={modal.sourceBtnIcon}>📷</Text>
              <Text style={modal.sourceBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.sourceBtn} onPress={pickFromGallery}>
              <Text style={modal.sourceBtnIcon}>🖼️</Text>
              <Text style={modal.sourceBtnText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modal.sourceBtn} onPress={pickFromFiles}>
              <Text style={modal.sourceBtnIcon}>📂</Text>
              <Text style={modal.sourceBtnText}>Files</Text>
            </TouchableOpacity>
          </View>

          {pickedFile && (
            <View style={modal.pickedFile}>
              <Text style={modal.pickedFileText}>✓ {displayName}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[modal.uploadBtn, (!canUpload || isUploading) && modal.uploadBtnDisabled]}
            disabled={!canUpload || isUploading}
            onPress={() => {
              if (!canUpload || !pickedFile) return;
              const source = pickedFile.type === 'application/pdf' ? 'files'
                : pickedFile.name.startsWith('photo_') ? 'camera'
                : 'gallery';
              onUpload({
                uri: pickedFile.uri,
                fileName: pickedFile.name,
                mimeType: pickedFile.type,
                familyMemberId: selectedMemberId,
                documentType: selectedType,
                title: `${selectedType} – ${new Date().toLocaleDateString('en-IN')}`,
                source,
              });
            }}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={modal.uploadBtnText}>Upload Document</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function Documents() {
  const router = useRouter();
  const [filter, setFilter] = useState<string | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  const { data: docs, isLoading, error } = useDocuments();
  const { data: members } = useFamilyMembers();
  const { mutateAsync: uploadDoc, isPending: isUploading } = useUploadDocument();

  const filtered = filter ? (docs ?? []).filter((d) => d.document_type === filter) : (docs ?? []);
  const types = [...new Set((docs ?? []).map((d) => d.document_type).filter(Boolean))];

  const handleUpload = useCallback(async (params: {
    uri: string;
    fileName: string;
    mimeType: string;
    familyMemberId: string;
    documentType: string;
    title: string;
    source: 'camera' | 'gallery' | 'files';
  }) => {
    try {
      await uploadDoc({
        uri: params.uri,
        fileName: params.fileName,
        mimeType: params.mimeType,
        familyMemberId: params.familyMemberId,
        documentType: params.documentType,
        title: params.title,
        uploadSource: params.source,
      });
      setUploadVisible(false);
    } catch {
      Alert.alert('Upload failed', 'Could not upload the document. Please try again.');
    }
  }, [uploadDoc]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Documents</Text>
          <Text style={styles.subtitle}>{docs ? `${docs.length} record${docs.length !== 1 ? 's' : ''}` : '…'}</Text>
        </View>
        <TouchableOpacity style={styles.uploadBtn} onPress={() => setUploadVisible(true)}>
          <Text style={styles.uploadBtnText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      {types.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, !filter && styles.filterChipActive]}
            onPress={() => setFilter(null)}
          >
            <Text style={[styles.filterChipText, !filter && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {types.map((t) => {
            const colors = TYPE_COLORS[t!] ?? TYPE_COLORS.Other;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.filterChip, filter === t && { backgroundColor: colors.bg, borderColor: colors.bg }]}
                onPress={() => setFilter(filter === t ? null : t!)}
              >
                <Text style={[styles.filterChipText, filter === t && { color: colors.text }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00B894" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load documents.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No documents yet</Text>
              <Text style={styles.emptyText}>
                Upload lab reports, prescriptions, or scans to get AI-powered analysis.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setUploadVisible(true)}>
                <Text style={styles.emptyBtnText}>Upload First Document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((doc) => {
              const colors = TYPE_COLORS[doc.document_type ?? 'Other'] ?? TYPE_COLORS.Other;
              const memberName = (doc as any).family_members?.name ?? '';
              const dateStr = new Date(doc.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              });
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.docCard}
                  onPress={() => router.push(`/(tabs)/documents/${doc.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={styles.docIconWrap}>
                    <Text style={{ fontSize: 24 }}>📄</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.docTopRow}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.typeBadgeText, { color: colors.text }]}>{doc.document_type}</Text>
                      </View>
                    </View>
                    {doc.ai_analysis && (
                      <Text style={styles.docSummary} numberOfLines={1}>
                        {(doc.ai_analysis as any).summary ?? 'AI analysis ready'}
                      </Text>
                    )}
                    <View style={styles.docMeta}>
                      {memberName ? <Avatar name={memberName} size={16} /> : null}
                      <Text style={styles.docMetaText}>
                        {memberName ? `${memberName.split(' ')[0]} · ` : ''}{dateStr}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <UploadModal
        visible={uploadVisible}
        onClose={() => setUploadVisible(false)}
        members={members ?? []}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
  },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, color: '#09090B' },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A', marginTop: 2 },
  uploadBtn: {
    backgroundColor: '#09090B',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  uploadBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFFFFF' },

  filterRow: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  filterChip: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterChipActive: { backgroundColor: '#09090B', borderColor: '#09090B' },
  filterChipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  filterChipTextActive: { color: '#FFFFFF' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#71717A' },

  content: { paddingHorizontal: 20 },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#09090B' },
  emptyText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#71717A', textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: '#09090B',
    borderRadius: 13,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },

  docCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
    marginBottom: 10,
    gap: 12,
    alignItems: 'flex-start',
  },
  docIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center', justifyContent: 'center',
  },
  docTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  docTitle: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B', flex: 1, marginRight: 8 },
  typeBadge: { borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeText: { fontFamily: 'Inter-Medium', fontSize: 10 },
  docSummary: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginBottom: 6, lineHeight: 16 },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  docMetaText: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#A1A1AA' },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
  },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#09090B' },
  close: { fontSize: 18, color: '#71717A', padding: 4 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B', marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 50, borderWidth: 1, borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8,
  },
  chipSelected: { backgroundColor: '#09090B', borderColor: '#09090B' },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  chipTextSelected: { color: '#FFFFFF' },
  sourceRow: { flexDirection: 'row', gap: 12 },
  sourceBtn: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E4E4E7',
    paddingVertical: 16, alignItems: 'center', gap: 6,
  },
  sourceBtnIcon: { fontSize: 24 },
  sourceBtnText: { fontFamily: 'Inter-Medium', fontSize: 12, color: '#09090B' },
  pickedFile: {
    backgroundColor: '#E8FDF8', borderRadius: 10, padding: 12,
    marginTop: 12,
  },
  pickedFileText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#00725E' },
  uploadBtn: {
    backgroundColor: '#09090B', borderRadius: 13, height: 50,
    alignItems: 'center', justifyContent: 'center', marginTop: 24,
  },
  uploadBtnDisabled: { opacity: 0.4 },
  uploadBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },
});
