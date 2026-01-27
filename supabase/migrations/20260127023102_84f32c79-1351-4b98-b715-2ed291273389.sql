-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lakes table
CREATE TABLE public.lakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  fish_species TEXT[],
  best_season TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fishing_logs table
CREATE TABLE public.fishing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lake_id UUID REFERENCES public.lakes(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  fish_caught TEXT,
  fly_used TEXT,
  weather_conditions TEXT,
  water_temperature DECIMAL(5, 2),
  notes TEXT,
  success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fishing_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lakes policies (public read, admin write - for now everyone can read)
CREATE POLICY "Anyone can view lakes" ON public.lakes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add lakes" ON public.lakes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fishing logs policies
CREATE POLICY "Users can view their own logs" ON public.fishing_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own logs" ON public.fishing_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON public.fishing_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON public.fishing_logs FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fishing_logs_updated_at BEFORE UPDATE ON public.fishing_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample Colorado lakes
INSERT INTO public.lakes (name, location, latitude, longitude, description, fish_species, best_season) VALUES
('Dream Lake', 'Rocky Mountain National Park, CO', 40.3103, -105.6649, 'A stunning alpine lake surrounded by peaks. Known for beautiful scenery and brook trout.', ARRAY['Brook Trout', 'Cutthroat Trout'], 'Summer'),
('Blue Mesa Reservoir', 'Gunnison, CO', 38.4536, -107.2086, 'Colorado''s largest body of water. Excellent for kokanee salmon and lake trout.', ARRAY['Kokanee Salmon', 'Lake Trout', 'Rainbow Trout', 'Brown Trout'], 'Spring-Fall'),
('Spinney Mountain Reservoir', 'Park County, CO', 39.0233, -105.7033, 'Gold Medal water known for trophy trout. Catch-and-release only for some species.', ARRAY['Rainbow Trout', 'Brown Trout', 'Cutthroat Trout', 'Northern Pike'], 'Spring-Fall'),
('Eleven Mile Reservoir', 'Park County, CO', 38.9567, -105.5389, 'Popular destination with diverse fishing opportunities and beautiful mountain views.', ARRAY['Rainbow Trout', 'Brown Trout', 'Kokanee Salmon', 'Carp', 'Northern Pike'], 'Year-round'),
('South Platte River', 'Deckers, CO', 39.2544, -105.2275, 'Famous Gold Medal tailwater with technical fishing for large trout.', ARRAY['Rainbow Trout', 'Brown Trout'], 'Year-round');