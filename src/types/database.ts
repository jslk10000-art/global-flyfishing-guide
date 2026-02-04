export interface Lake {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  fish_species: string[] | null;
  best_season: string | null;
  image_url: string | null;
  created_at: string;
}

export interface FishingLog {
  id: string;
  user_id: string;
  lake_id: string | null;
  date: string;
  fish_caught: string | null;
  fly_used: string | null;
  weather_conditions: string | null;
  water_temperature: number | null;
  notes: string | null;
  success_rating: number | null;
  created_at: string;
  updated_at: string;
  lake?: Lake;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface FlyRecommendation {
  name: string;
  type: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  lineType?: string;
  leaderLength?: string;
  retrieveStyle?: string;
  idealDepth?: string;
}
