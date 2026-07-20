import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth-context';

export function useCircleConnections() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['circle-connections', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('circle_connections')
        .select('*')
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .is('revoked_at', null)
        .order('connected_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCircleRequests() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['circle-requests', userId],
    queryFn: async () => {
      // Requests pending for MY invites (I am host)
      const { data, error } = await supabase
        .from('circle_requests')
        .select('*, circle_invites!inner(host_user_id)')
        .eq('circle_invites.host_user_id', userId!)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useCreateCircleInvite() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('circle-invite-create', { body: {} });
      if (error) throw error;
      return data as { invite_url: string; token: string; expires_at: string };
    },
  });
}

export function useAcceptCircleRequest() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { requestId: string; requesterUserId: string }) => {
      // Update request status
      const { error: reqErr } = await supabase
        .from('circle_requests')
        .update({ status: 'accepted', resolved_at: new Date().toISOString() })
        .eq('id', params.requestId);
      if (reqErr) throw reqErr;
      // Create the connection
      const { error: connErr } = await supabase
        .from('circle_connections')
        .insert({ user_a_id: userId!, user_b_id: params.requesterUserId });
      if (connErr) throw connErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-connections', userId] });
      queryClient.invalidateQueries({ queryKey: ['circle-requests', userId] });
    },
  });
}

export function useRevokeCircleConnection() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('circle_connections')
        .update({ revoked_at: new Date().toISOString(), revoked_by: userId })
        .eq('id', connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-connections', userId] });
    },
  });
}
