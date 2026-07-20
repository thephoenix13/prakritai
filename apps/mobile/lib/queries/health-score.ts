import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth-context';

export interface HealthScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  summary: string;
  breakdown: {
    metabolic: number;
    cardiovascular: number;
    weight: number;
    adherence: number;
    preventive: number;
  };
  top_concern: string | null;
  positive: string | null;
}

// Read cached score from health_scores table (cheap, no Claude call)
export function useCachedHealthScore(familyMemberId: string | undefined) {
  return useQuery({
    queryKey: ['health-score-cached', familyMemberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_scores')
        .select('*')
        .eq('family_member_id', familyMemberId!)
        .single();
      if (error) return null;
      return data as HealthScore & { computed_at: string };
    },
    enabled: !!familyMemberId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Trigger a fresh score computation via edge function
export function useGenerateHealthScore() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (familyMemberId: string): Promise<HealthScore> => {
      const { data, error } = await supabase.functions.invoke('generate-health-score', {
        body: { family_member_id: familyMemberId },
      });
      if (error) throw error;
      return data as HealthScore;
    },
    onSuccess: (_, familyMemberId) => {
      queryClient.invalidateQueries({ queryKey: ['health-score-cached', familyMemberId] });
    },
  });
}

// Check drug interactions before adding a medication
export function useCheckDrugInteractions() {
  return useMutation({
    mutationFn: async (params: {
      new_medication: string;
      existing_medications: string[];
    }) => {
      const { data, error } = await supabase.functions.invoke('check-drug-interactions', {
        body: params,
      });
      if (error) throw error;
      return data as {
        has_interaction: boolean;
        severity: 'none' | 'mild' | 'moderate' | 'severe';
        interactions: Array<{
          drug_a: string;
          drug_b: string;
          severity: string;
          mechanism: string;
          clinical_effect: string;
          management: string;
        }>;
        overall_recommendation: string;
      };
    },
  });
}
