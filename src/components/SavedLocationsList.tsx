import { MapPin, Trash2, Navigation, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSavedLocations, SavedLocation } from '@/hooks/useSavedLocations';
import { useLocation } from '@/hooks/useLocationContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SavedLocationsListProps {
  onLocationSelect?: (location: SavedLocation) => void;
  compact?: boolean;
}

export function SavedLocationsList({ onLocationSelect, compact = false }: SavedLocationsListProps) {
  const { savedLocations, isLoading, deleteLocation } = useSavedLocations();
  const { setLocation } = useLocation();
  const navigate = useNavigate();

  const handleSelect = (location: SavedLocation) => {
    setLocation({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      admin1: location.admin1 || undefined,
    });
    onLocationSelect?.(location);
  };

  const handleNavigateToRecommendations = (location: SavedLocation) => {
    handleSelect(location);
    const params = new URLSearchParams({
      location: location.name,
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      country: location.country,
    });
    navigate(`/recommendations?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (savedLocations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No saved locations yet</p>
        <p className="text-sm">Search and save your favorite fishing spots!</p>
      </div>
    );
  }

  // Group by country
  const groupedByCountry = savedLocations.reduce((acc, loc) => {
    const key = loc.country;
    if (!acc[key]) acc[key] = [];
    acc[key].push(loc);
    return acc;
  }, {} as Record<string, SavedLocation[]>);

  if (compact) {
    return (
      <div className="space-y-2">
        {savedLocations.slice(0, 5).map((location) => (
          <Button
            key={location.id}
            variant="ghost"
            className="w-full justify-start gap-2 h-auto py-2"
            onClick={() => handleNavigateToRecommendations(location)}
          >
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="text-left truncate">
              <div className="font-medium truncate">{location.name}</div>
              <div className="text-xs text-muted-foreground">
                {location.admin1 && `${location.admin1}, `}{location.country}
              </div>
            </div>
          </Button>
        ))}
        {savedLocations.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{savedLocations.length - 5} more saved
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByCountry).map(([country, locations]) => (
        <Card key={country}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {country} ({locations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <button
                  onClick={() => handleSelect(location)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {location.admin1 && `${location.admin1}`}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="View on map"
                    onClick={() =>
                      navigate(
                        `/map?filter=saved&lat=${location.latitude}&lng=${location.longitude}`
                      )
                    }
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Get recommendations"
                    onClick={() => handleNavigateToRecommendations(location)}
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove saved location?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {location.name} from your saved locations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteLocation.mutate(location.id)}>
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
