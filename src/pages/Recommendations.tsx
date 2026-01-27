import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FlyRecommendationCard } from '@/components/FlyRecommendationCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLakes } from '@/hooks/useLakes';
import { FlyRecommendation } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  const initialLake = searchParams.get('lake') || '';

  const [lake, setLake] = useState(initialLake);
  const [weather, setWeather] = useState('');
  const [season, setSeason] = useState('');
  const [targetFish, setTargetFish] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [recommendations, setRecommendations] = useState<FlyRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: lakes } = useLakes();

  const getRecommendations = async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('fly-recommendations', {
        body: {
          lake: lake || undefined,
          weather: weather || undefined,
          season: season || undefined,
          targetFish: targetFish || undefined,
          waterTemp: waterTemp ? parseFloat(waterTemp) : undefined,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-sunrise" />
            AI Fly Finder
          </h1>
          <p className="text-muted-foreground">
            Get personalized fly recommendations based on conditions
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fishing Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lake">Lake/River</Label>
                  <Select value={lake} onValueChange={setLake}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {lakes?.map((l) => (
                        <SelectItem key={l.id} value={l.name}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weather">Weather</Label>
                  <Select value={weather} onValueChange={setWeather}>
                    <SelectTrigger>
                      <SelectValue placeholder="Current weather" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunny">Sunny</SelectItem>
                      <SelectItem value="partly cloudy">Partly Cloudy</SelectItem>
                      <SelectItem value="overcast">Overcast</SelectItem>
                      <SelectItem value="rainy">Rainy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Current season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetFish">Target Fish</Label>
                  <Select value={targetFish} onValueChange={setTargetFish}>
                    <SelectTrigger>
                      <SelectValue placeholder="What are you fishing for?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rainbow Trout">Rainbow Trout</SelectItem>
                      <SelectItem value="Brown Trout">Brown Trout</SelectItem>
                      <SelectItem value="Brook Trout">Brook Trout</SelectItem>
                      <SelectItem value="Cutthroat Trout">Cutthroat Trout</SelectItem>
                      <SelectItem value="Kokanee Salmon">Kokanee Salmon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waterTemp">Water Temp (°F)</Label>
                  <Input
                    id="waterTemp"
                    type="number"
                    placeholder="e.g., 52"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={getRecommendations}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : hasSearched ? (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {hasSearched ? 'Update Recommendations' : 'Get Recommendations'}
                </Button>
              </CardContent>
            </Card>

            <WeatherWidget />
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
                  Recommended Flies
                </h2>
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
                  <Sparkles className="h-12 w-12 text-sunrise/50 mb-4" />
                  <p className="text-muted-foreground text-center">
                    Enter fishing conditions and click "Get Recommendations" to see AI-powered fly suggestions.
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
