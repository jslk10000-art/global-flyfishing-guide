import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  photo_url: string | null;
  location_name: string | null;
  fish_species: string | null;
  created_at: string;
  updated_at: string;
  profile?: { display_name: string | null };
  comment_count?: number;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { display_name: string | null };
}

export function useCommunityPosts() {
  return useQuery({
    queryKey: ['community-posts'],
    queryFn: async (): Promise<CommunityPost[]> => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get comment counts
      const postIds = (data || []).map((p) => p.id);
      if (postIds.length > 0) {
        const { data: comments } = await supabase
          .from('community_comments')
          .select('post_id')
          .in('post_id', postIds);

        const countMap: Record<string, number> = {};
        comments?.forEach((c) => {
          countMap[c.post_id] = (countMap[c.post_id] || 0) + 1;
        });

        return (data || []).map((p) => ({
          ...p,
          comment_count: countMap[p.id] || 0,
        }));
      }

      return (data || []).map((p) => ({ ...p, comment_count: 0 }));
    },
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async (): Promise<CommunityComment[]> => {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      content?: string;
      photo_url?: string;
      location_name?: string;
      fish_species?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await supabase
        .from('community_posts')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
}

export function useCreateComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { post_id: string; content: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await supabase
        .from('community_comments')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.post_id] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('community_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });
}
