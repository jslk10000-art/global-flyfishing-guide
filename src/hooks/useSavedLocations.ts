import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1: string | null;
  created_at: string;
}

export function useSavedLocations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['saved-locations', user?.id],
    queryFn: async (): Promise<SavedLocation[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_saved_locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedLocation[];
    },
    enabled: !!user,
  });

  const saveLocation = useMutation({
    mutationFn: async (location: {
      name: string;
      latitude: number;
      longitude: number;
      country: string;
      admin1?: string;
    }) => {
      if (!user) throw new Error('Must be logged in to save locations');

      const { data, error } = await supabase
        .from('user_saved_locations')
        .insert({
          user_id: user.id,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          country: location.country,
          admin1: location.admin1 || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Location already saved');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-locations'] });
      toast.success('Location saved!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_saved_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-locations'] });
      toast.success('Location removed');
    },
    onError: () => {
      toast.error('Failed to remove location');
    },
  });

  const isLocationSaved = (latitude: number, longitude: number): boolean => {
    if (!query.data) return false;
    return query.data.some(
      (loc) =>
        loc.latitude.toFixed(2) === latitude.toFixed(2) &&
        loc.longitude.toFixed(2) === longitude.toFixed(2)
    );
  };

  return {
    savedLocations: query.data || [],
    isLoading: query.isLoading,
    saveLocation,
    deleteLocation,
    isLocationSaved,
  };
}
