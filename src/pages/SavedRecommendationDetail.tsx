import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FlyRecommendationDetail } from '@/components/FlyRecommendationDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FlyRecommendation } from '@/types/database';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  MapPin, 
  Thermometer, 
  Fish, 
  Calendar, 
  Cloud,
  Leaf
} from 'lucide-react';

interface SavedRecommendationData {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  country: string | null;
  recommendations: FlyRecommendation[];
  weather_conditions: string | null;
  estimated_water_temp: number | null;
  season: string | null;
  target_fish: string | null;
  created_at: string;
}

export default function SavedRecommendationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [recommendation, setRecommendation] = useState<SavedRecommendationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth');
      return;
    }

    if (!id || !user) return;

    const fetchRecommendation = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('saved_fly_recommendations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Parse recommendations if they're a string
        const recs = typeof data.recommendations === 'string' 
          ? JSON.parse(data.recommendations) 
          : data.recommendations;
        
        setRecommendation({
          ...data,
          recommendations: recs as FlyRecommendation[],
        });
      } catch (error) {
        console.error('Error fetching recommendation:', error);
        navigate('/my-spots');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [id, user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <p>Recommendation not found.</p>
          <Link to="/my-spots">
            <Button variant="link">Back to My Spots</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/my-spots')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Spots
        </Button>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary" />
            {recommendation.location_name}
          </h1>
          <p className="text-muted-foreground">
            {recommendation.country && `${recommendation.country} • `}
            Saved {format(new Date(recommendation.created_at), 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Conditions at time of recommendation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Conditions When Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {recommendation.season && (
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-forest" />
                  <span className="text-sm capitalize">{recommendation.season}</span>
                </div>
              )}
              {recommendation.weather_conditions && (
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{recommendation.weather_conditions}</span>
                </div>
              )}
              {recommendation.estimated_water_temp !== null && (
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Est. Water Temp: {recommendation.estimated_water_temp}°C
                  </span>
                </div>
              )}
              {recommendation.target_fish && (
                <div className="flex items-center gap-2">
                  <Fish className="h-4 w-4 text-sunrise" />
                  <span className="text-sm">{recommendation.target_fish}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(recommendation.created_at), 'h:mm a')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fly Recommendations with full details */}
        <h2 className="font-display text-xl font-semibold mb-4">
          Fly Recommendations ({recommendation.recommendations.length})
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {recommendation.recommendations.map((fly, index) => (
            <FlyRecommendationDetail key={index} recommendation={fly} />
          ))}
        </div>

        {/* Quick action to get fresh recommendations */}
        <Card className="mt-8 border-dashed">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <div>
              <p className="font-medium">Need updated recommendations?</p>
              <p className="text-sm text-muted-foreground">
                Get fresh fly suggestions based on current conditions
              </p>
            </div>
            <Button
              onClick={() => {
                const params = new URLSearchParams({
                  location: recommendation.location_name,
                  lat: recommendation.latitude.toString(),
                  lng: recommendation.longitude.toString(),
                  country: recommendation.country || '',
                });
                navigate(`/recommendations?${params.toString()}`);
              }}
            >
              Get Fresh Recommendations
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
