import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth-context';

export function useTimeline(familyMemberId?: string) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['timeline', userId, familyMemberId ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('timeline_entries')
        .select('*, family_members(name)')
        .eq('user_id', userId!)
        .order('occurred_at', { ascending: false })
        .limit(100);
      if (familyMemberId) q = q.eq('family_member_id', familyMemberId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}
