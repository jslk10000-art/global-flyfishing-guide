
-- Storage bucket for catch photos
INSERT INTO storage.buckets (id, name, public) VALUES ('catch-photos', 'catch-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view catch photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'catch-photos');

CREATE POLICY "Authenticated users can upload catch photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'catch-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own catch photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'catch-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add photo_url to fishing_logs
ALTER TABLE public.fishing_logs ADD COLUMN photo_url text;

-- Community posts table
CREATE TABLE public.community_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  photo_url text,
  location_name text,
  fish_species text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.community_posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.community_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Community comments table
CREATE TABLE public.community_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view comments"
ON public.community_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own comments"
ON public.community_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.community_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
