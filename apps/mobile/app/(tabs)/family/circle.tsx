import React from 'react';
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
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Avatar } from '../../../components/ui/Avatar';
import {
  useCircleConnections,
  useCircleRequests,
  useCreateCircleInvite,
  useAcceptCircleRequest,
  useRevokeCircleConnection,
} from '../../../lib/queries/circle';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function abbreviateUUID(uuid: string) {
  if (!uuid) return 'Unknown';
  return uuid.slice(0, 8).toUpperCase();
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function FamilyCircle() {
  const router = useRouter();

  const connections = useCircleConnections();
  const requests    = useCircleRequests();
  const createInvite    = useCreateCircleInvite();
  const acceptRequest   = useAcceptCircleRequest();
  const revokeConnection = useRevokeCircleConnection();

  const activeConnections = connections.data ?? [];
  const pendingRequests   = requests.data ?? [];
  const totalCount = activeConnections.length;

  const isEmpty = !connections.isLoading && !requests.isLoading
    && activeConnections.length === 0
    && pendingRequests.length === 0;

  // ── Create invite ──────────────────────────────────────────────────────────
  async function handleCreateInvite() {
    try {
      const result = await createInvite.mutateAsync();
      await Share.share({
        url: result.invite_url,
        message: `Join my health circle on Prakrit AI: ${result.invite_url}`,
      });
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not create invite link. Please try again.');
    }
  }

  // ── Accept request ─────────────────────────────────────────────────────────
  function handleAccept(requestId: string, requesterUserId: string) {
    acceptRequest.mutate(
      { requestId, requesterUserId },
      {
        onError: (err: any) =>
          Alert.alert('Error', err?.message ?? 'Could not accept request.'),
      }
    );
  }

  // ── Revoke connection ──────────────────────────────────────────────────────
  function handleRevoke(connectionId: string) {
    Alert.alert(
      'Remove Connection',
      'Are you sure you want to remove this person from your Family Circle? They will lose access to your family\'s health records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            revokeConnection.mutate(connectionId, {
              onError: (err: any) =>
                Alert.alert('Error', err?.message ?? 'Could not remove connection.'),
            }),
        },
      ]
    );
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
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Family Circle</Text>
          {totalCount > 0 && (
            <Text style={styles.subtitle}>
              {totalCount} {totalCount === 1 ? 'connection' : 'connections'}
            </Text>
          )}
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── Invite section ── */}
        <View style={styles.inviteSection}>
          <TouchableOpacity
            style={[styles.inviteBtn, createInvite.isPending && styles.btnDisabled]}
            onPress={handleCreateInvite}
            disabled={createInvite.isPending}
          >
            {createInvite.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.inviteBtnText}>Create Invite Link</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.expiryNote}>Link expires in 48 hours · Single use</Text>
        </View>

        {/* ── Loading state ── */}
        {(connections.isLoading || requests.isLoading) && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#00B894" />
            <Text style={styles.loadingText}>Loading circle…</Text>
          </View>
        )}

        {/* ── Empty state ── */}
        {isEmpty && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your circle is empty</Text>
            <Text style={styles.emptyText}>
              Share your invite link with a trusted person — a caregiver, family member, or doctor.
              They'll get read-only access to your family's health records.
            </Text>
          </View>
        )}

        {/* ── Pending requests ── */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Requests{' '}
              <Text style={styles.sectionCount}>({pendingRequests.length})</Text>
            </Text>
            {pendingRequests.map((req: any) => {
              const isAccepting =
                acceptRequest.isPending && acceptRequest.variables?.requestId === req.id;
              return (
                <View key={req.id} style={styles.requestCard}>
                  <Avatar name="User" size={44} />
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestId}>
                      User {abbreviateUUID(req.requester_user_id)}
                    </Text>
                    <Text style={styles.requestMeta}>Wants to join your circle</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.acceptBtn, isAccepting && styles.btnDisabled]}
                      onPress={() => handleAccept(req.id, req.requester_user_id)}
                      disabled={isAccepting}
                    >
                      {isAccepting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() =>
                        Alert.alert(
                          'Decline Request',
                          'Decline this circle join request?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Decline',
                              style: 'destructive',
                              onPress: () => {
                                // Decline is a revoke of the pending request row itself;
                                // re-using revokeConnection works if DB allows it,
                                // otherwise a separate mutation would be needed.
                                // For now we just dismiss — implement decline mutation as needed.
                              },
                            },
                          ]
                        )
                      }
                    >
                      <Text style={styles.declineBtnText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Active connections ── */}
        {activeConnections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Connections</Text>
            {activeConnections.map((conn: any) => {
              const isRevoking =
                revokeConnection.isPending && revokeConnection.variables === conn.id;
              return (
                <View key={conn.id} style={styles.connectionCard}>
                  <Avatar name="User" size={44} />
                  <View style={styles.connectionInfo}>
                    <Text style={styles.connectionId}>
                      User {abbreviateUUID(conn.user_a_id ?? conn.user_b_id)}
                    </Text>
                    <Text style={styles.connectionDate}>
                      Connected {formatDate(conn.connected_at)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRevoke(conn.id)}
                    disabled={isRevoking}
                    style={styles.removeBtn}
                  >
                    {isRevoking ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Text style={styles.removeBtnText}>Remove</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
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
    paddingBottom: 14,
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
  headerCenter: { alignItems: 'center' },
  title: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, color: '#09090B' },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },

  content: { paddingHorizontal: 20 },

  // Invite section
  inviteSection: { marginBottom: 24 },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B894',
    borderRadius: 13,
    height: 50,
    marginBottom: 8,
  },
  btnDisabled: { opacity: 0.6 },
  inviteBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 14, color: '#FFFFFF' },
  expiryNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
  },

  // Loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#71717A' },

  // Empty state
  emptyCard: {
    backgroundColor: '#E8FDF8',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 15,
    color: '#00725E',
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#00725E',
    lineHeight: 19,
  },

  // Section header
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 15,
    color: '#09090B',
    marginBottom: 12,
  },
  sectionCount: { color: '#71717A', fontFamily: 'SpaceGrotesk-Regular' },

  // Pending request card
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  requestInfo: { flex: 1 },
  requestId: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  requestMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  acceptBtn: {
    backgroundColor: '#00B894',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 64,
    alignItems: 'center',
  },
  acceptBtnText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 13, color: '#FFFFFF' },
  declineBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  declineBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#71717A' },

  // Active connection card
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  connectionInfo: { flex: 1 },
  connectionId: { fontFamily: 'Inter-SemiBold', fontSize: 14, color: '#09090B' },
  connectionDate: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A', marginTop: 2 },
  removeBtn: { paddingHorizontal: 4, paddingVertical: 6 },
  removeBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#EF4444' },
});
