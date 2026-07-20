import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth-context';

export function useEmergencyInfo(familyMemberId: string | undefined) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['emergency', familyMemberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_info')
        .select('*')
        .eq('family_member_id', familyMemberId!)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ?? null;
    },
    enabled: !!userId && !!familyMemberId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertEmergencyInfo() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      familyMemberId: string;
      allergies: { name: string; severity: string }[];
      conditions: string[];
      emergencyContacts: { name: string; relationship: string; phone: string; priority: number }[];
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('emergency_info')
        .upsert({
          user_id: userId!,
          family_member_id: params.familyMemberId,
          allergies: params.allergies,
          conditions: params.conditions,
          emergency_contacts: params.emergencyContacts,
          notes: params.notes,
        }, { onConflict: 'family_member_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['emergency', vars.familyMemberId] });
    },
  });
}
