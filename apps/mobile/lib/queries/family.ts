import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth-context';

export function useFamilyMembers() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['family_members', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_active', true)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFamilyMember(id: string | undefined) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['family_members', userId, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id!)
        .eq('user_id', userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!id,
  });
}

interface AddMemberInput {
  name: string;
  relationship: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  height_cm?: number;
  weight_kg?: number;
}

export function useAddFamilyMember() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddMemberInput) => {
      const { data, error } = await supabase
        .from('family_members')
        .insert({ ...input, user_id: userId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family_members', userId] });
    },
  });
}

export function useDeleteFamilyMember() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('family_members')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family_members', userId] });
    },
  });
}
