-- Create table for saved fly recommendations
CREATE TABLE public.saved_fly_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  country TEXT,
  recommendations JSONB NOT NULL,
  weather_conditions TEXT,
  estimated_water_temp NUMERIC,
  season TEXT,
  target_fish TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_fly_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved recommendations"
ON public.saved_fly_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved recommendations"
ON public.saved_fly_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recommendations"
ON public.saved_fly_recommendations
FOR DELETE
USING (auth.uid() = user_id);