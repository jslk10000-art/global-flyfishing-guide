import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lake } from '@/types/database';

export function useLakes(searchQuery?: string) {
  return useQuery({
    queryKey: ['lakes', searchQuery],
    queryFn: async (): Promise<Lake[]> => {
      let query = supabase
        .from('lakes')
        .select('*')
        .order('name');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Lake[];
    },
  });
}

export function useLake(id: string | undefined) {
  return useQuery({
    queryKey: ['lake', id],
    queryFn: async (): Promise<Lake | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('lakes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Lake | null;
    },
    enabled: !!id,
  });
}
