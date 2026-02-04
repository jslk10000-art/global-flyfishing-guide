import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useSavedRecommendations } from '@/hooks/useSavedRecommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Thermometer, Fish, Trash2, Sparkles, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function MySpots() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedLocations, isLoading: locationsLoading, deleteLocation } = useSavedLocations();
  const { savedRecommendations, isLoading: recsLoading, deleteRecommendation } = useSavedRecommendations();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLocationClick = (location: { name: string; latitude: number; longitude: number; country: string }) => {
    const params = new URLSearchParams({
      location: location.name,
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      country: location.country,
    });
    navigate(`/recommendations?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">My Fishing Spots</h1>
          <p className="text-muted-foreground">
            Your saved locations and fly recommendations
          </p>
        </div>

        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Saved Locations
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Saved Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations">
            {locationsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : savedLocations.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedLocations.map((location) => (
                  <Card key={location.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteLocation.mutate(location.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleLocationClick(location)}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Get Fly Recommendations
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No saved locations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Search for a location and save it to quickly access it later
                </p>
                <Button onClick={() => navigate('/')}>
                  Find a Fishing Spot
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            {recsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : savedRecommendations.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedRecommendations.map((rec) => (
                  <Card key={rec.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Link to={`/my-spots/recommendation/${rec.id}`} className="hover:underline">
                          <CardTitle className="text-lg flex items-center gap-1">
                            {rec.location_name}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteRecommendation.mutate(rec.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(rec.created_at), 'MMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {rec.season && (
                          <span className="bg-muted px-2 py-0.5 rounded">{rec.season}</span>
                        )}
                        {rec.target_fish && (
                          <span className="bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                            <Fish className="h-3 w-3" />
                            {rec.target_fish}
                          </span>
                        )}
                        {rec.estimated_water_temp && (
                          <span className="bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {rec.estimated_water_temp}°C
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Flies: </span>
                        {Array.isArray(rec.recommendations) 
                          ? rec.recommendations.slice(0, 3).map((r: any) => r.name).join(', ')
                          : 'N/A'
                        }
                        {Array.isArray(rec.recommendations) && rec.recommendations.length > 3 && '...'}
                      </div>
                      <Link to={`/my-spots/recommendation/${rec.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View Full Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No saved recommendations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get fly recommendations and save them for future trips
                </p>
                <Button onClick={() => navigate('/recommendations')}>
                  Get Fly Recommendations
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
