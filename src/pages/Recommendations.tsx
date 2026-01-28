import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FlyRecommendationCard } from '@/components/FlyRecommendationCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { LocationSearch } from '@/components/LocationSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FlyRecommendation } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { fetchRealTimeWeather, RealTimeWeather } from '@/services/weatherService';
import { Sparkles, Loader2, RefreshCw, Globe } from 'lucide-react';

interface SelectedLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export default function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  
  // Initialize from URL params
  const initialLocation = searchParams.get('location');
  const initialLat = searchParams.get('lat');
  const initialLng = searchParams.get('lng');
  const initialCountry = searchParams.get('country');

  const [location, setLocation] = useState<SelectedLocation | null>(
    initialLocation && initialLat && initialLng ? {
      name: initialLocation,
      latitude: parseFloat(initialLat),
      longitude: parseFloat(initialLng),
      country: initialCountry || '',
    } : null
  );

  const [weather, setWeather] = useState<RealTimeWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [season, setSeason] = useState('');
  const [targetFish, setTargetFish] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [recommendations, setRecommendations] = useState<FlyRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch weather when location changes
  useEffect(() => {
    if (!location) {
      setWeather(null);
      return;
    }

    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const data = await fetchRealTimeWeather(location.latitude, location.longitude);
        setWeather(data);
      } catch (error) {
        console.error('Weather fetch error:', error);
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  const handleLocationSelect = (loc: SelectedLocation) => {
    setLocation(loc);
    setHasSearched(false);
    setRecommendations([]);
  };

  const getRecommendations = async () => {
    if (!location) return;
    
    setLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('fly-recommendations', {
        body: {
          lake: `${location.name}, ${location.country}`,
          weather: weather?.condition || undefined,
          season: season || undefined,
          targetFish: targetFish || undefined,
          waterTemp: waterTemp ? parseFloat(waterTemp) : weather?.temperature,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });

      if (error) throw error;
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      // Set fallback recommendations
      setRecommendations([
        { name: 'Elk Hair Caddis', type: 'dry fly', reason: 'Versatile pattern effective in most conditions', confidence: 'high' },
        { name: 'Pheasant Tail Nymph', type: 'nymph', reason: 'Classic searching pattern for subsurface feeding', confidence: 'high' },
        { name: 'Woolly Bugger', type: 'streamer', reason: 'Great all-around streamer for aggressive fish', confidence: 'medium' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Common fish species by region
  const fishSpecies = [
    'Rainbow Trout',
    'Brown Trout',
    'Brook Trout',
    'Cutthroat Trout',
    'Lake Trout',
    'Atlantic Salmon',
    'Grayling',
    'Pike',
    'Perch',
    'Carp',
    'Bass',
    'Bluegill',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-sunrise" />
            AI Fly Finder
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Get personalized fly recommendations for any location worldwide
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fishing Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Location</Label>
                  <LocationSearch 
                    onLocationSelect={handleLocationSelect}
                    placeholder="Search any lake or river..."
                    initialValue={location ? `${location.name}, ${location.country}` : ''}
                  />
                </div>

                {location && (
                  <div className="p-3 bg-primary/10 rounded-lg text-sm">
                    <p className="font-medium">{location.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {location.admin1 && `${location.admin1}, `}{location.country}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="season">Season (optional)</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect from date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall/Autumn</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetFish">Target Fish (optional)</Label>
                  <Select value={targetFish} onValueChange={setTargetFish}>
                    <SelectTrigger>
                      <SelectValue placeholder="What are you fishing for?" />
                    </SelectTrigger>
                    <SelectContent>
                      {fishSpecies.map((fish) => (
                        <SelectItem key={fish} value={fish}>
                          {fish}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waterTemp">Water Temp (optional)</Label>
                  <Input
                    id="waterTemp"
                    type="number"
                    placeholder="e.g., 52°F or 11°C"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={getRecommendations}
                  disabled={loading || !location}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : hasSearched ? (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {!location ? 'Select a Location First' : hasSearched ? 'Update Recommendations' : 'Get Recommendations'}
                </Button>
              </CardContent>
            </Card>

            {/* Weather Widget */}
            <WeatherWidget
              latitude={location?.latitude}
              longitude={location?.longitude}
              locationName={location?.name}
            />
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">
                  Recommended Flies for {location?.name}
                </h2>
                {weather && (
                  <p className="text-sm text-muted-foreground">
                    Current conditions: {weather.temperature}°{weather.temperatureUnit}, {weather.condition}
                  </p>
                )}
                {recommendations.map((rec, index) => (
                  <FlyRecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            ) : hasSearched ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    No recommendations found. Try adjusting your criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-12 w-12 text-primary/50 mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">Search Any Location</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Search for any lake, river, or fishing destination worldwide. We'll fetch real-time weather and provide AI-powered fly recommendations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
