import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SavedRecommendation {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  country: string | null;
  recommendations: any;
  weather_conditions: string | null;
  estimated_water_temp: number | null;
  season: string | null;
  target_fish: string | null;
  created_at: string;
}

export function useSavedRecommendations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['saved-recommendations', user?.id],
    queryFn: async (): Promise<SavedRecommendation[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_fly_recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedRecommendation[];
    },
    enabled: !!user,
  });

  const deleteRecommendation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_fly_recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-recommendations'] });
      toast.success('Recommendation removed');
    },
    onError: () => {
      toast.error('Failed to remove recommendation');
    },
  });

  return {
    savedRecommendations: query.data || [],
    isLoading: query.isLoading,
    deleteRecommendation,
  };
}
