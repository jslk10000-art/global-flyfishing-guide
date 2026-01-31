-- Create table for user saved locations
CREATE TABLE public.user_saved_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  country TEXT NOT NULL,
  admin1 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate saves
ALTER TABLE public.user_saved_locations 
ADD CONSTRAINT unique_user_location UNIQUE (user_id, latitude, longitude);

-- Enable Row Level Security
ALTER TABLE public.user_saved_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved locations"
ON public.user_saved_locations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved locations"
ON public.user_saved_locations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved locations"
ON public.user_saved_locations
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_saved_locations_user_id ON public.user_saved_locations(user_id);