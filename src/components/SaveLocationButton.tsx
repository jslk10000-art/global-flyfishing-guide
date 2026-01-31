import { Heart, HeartOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SaveLocationButtonProps {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  };
  variant?: 'icon' | 'full';
}

export function SaveLocationButton({ location, variant = 'icon' }: SaveLocationButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { saveLocation, deleteLocation, savedLocations, isLocationSaved } = useSavedLocations();

  const isSaved = isLocationSaved(location.latitude, location.longitude);
  const savedEntry = savedLocations.find(
    (loc) =>
      loc.latitude.toFixed(2) === location.latitude.toFixed(2) &&
      loc.longitude.toFixed(2) === location.longitude.toFixed(2)
  );

  const handleClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isSaved && savedEntry) {
      deleteLocation.mutate(savedEntry.id);
    } else {
      saveLocation.mutate(location);
    }
  };

  const isLoading = saveLocation.isPending || deleteLocation.isPending;

  if (variant === 'full') {
    return (
      <Button
        variant={isSaved ? 'secondary' : 'outline'}
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSaved ? (
          <Heart className="h-4 w-4 fill-current text-red-500" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
        {isSaved ? 'Saved' : 'Save Location'}
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          disabled={isLoading}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isSaved ? (
            <Heart className="h-5 w-5 fill-current text-red-500" />
          ) : (
            <Heart className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {!user ? 'Sign in to save' : isSaved ? 'Remove from saved' : 'Save location'}
      </TooltipContent>
    </Tooltip>
  );
}
