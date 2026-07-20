import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth-context';

export function useMedications(familyMemberId?: string) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['medications', userId, familyMemberId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('medications')
        .select('*, family_members(name)')
        .eq('user_id', userId!)
        .eq('is_active', true)
        .order('created_at');
      if (familyMemberId) {
        query = query.eq('family_member_id', familyMemberId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMedication(id: string | undefined) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['medications', userId, 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*, family_members(name)')
        .eq('id', id!)
        .eq('user_id', userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!id,
  });
}

export function useTodayMedicationLogs() {
  const { userId } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['medication_logs', userId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', userId!)
        .gte('scheduled_time', `${today}T00:00:00`)
        .lte('scheduled_time', `${today}T23:59:59`);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

interface AddMedicationInput {
  family_member_id: string;
  name: string;
  dosage?: string;
  form?: string;
  frequency: string;
  times_of_day: string[];
  with_food?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  reminder_enabled?: boolean;
}

export function useAddMedication() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddMedicationInput) => {
      const { data, error } = await supabase
        .from('medications')
        .insert({ ...input, user_id: userId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', userId] });
    },
  });
}

export function useMarkMedicationTaken() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      medicationId,
      familyMemberId,
      scheduledTime,
    }: {
      medicationId: string;
      familyMemberId: string;
      scheduledTime: string;
    }) => {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          user_id: userId!,
          medication_id: medicationId,
          family_member_id: familyMemberId,
          scheduled_time: scheduledTime,
          taken_at: new Date().toISOString(),
          status: 'taken',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['medication_logs', userId, today] });
    },
  });
}
