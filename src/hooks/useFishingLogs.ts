import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FishingLog } from '@/types/database';
import { useAuth } from './useAuth';

export function useFishingLogs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fishing-logs', user?.id],
    queryFn: async (): Promise<FishingLog[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('fishing_logs')
        .select(`
          *,
          lake:lakes(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as FishingLog[];
    },
    enabled: !!user,
  });
}

interface CreateLogInput {
  lake_id?: string;
  date: string;
  fish_caught?: string;
  fly_used?: string;
  weather_conditions?: string;
  water_temperature?: number;
  notes?: string;
  success_rating?: number;
}

export function useCreateFishingLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLogInput) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('fishing_logs')
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishing-logs'] });
    },
  });
}

export function useDeleteFishingLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fishing_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fishing-logs'] });
    },
  });
}
