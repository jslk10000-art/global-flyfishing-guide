import { useState, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { geocodeLocation } from '@/services/weatherService';
import { useDebounce } from '@/hooks/useDebounce';

interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  initialValue?: string;
}

export function LocationSearch({ onLocationSelect, placeholder = "Search any lake or location...", initialValue = "" }: LocationSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const locations = await geocodeLocation(debouncedQuery);
        setResults(locations);
        setShowResults(true);
      } catch (error) {
        console.error('Geocoding error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleSelect = (location: LocationResult) => {
    setQuery(`${location.name}${location.admin1 ? `, ${location.admin1}` : ''}, ${location.country}`);
    setShowResults(false);
    onLocationSelect(location);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full shadow-lg">
          <CardContent className="p-1">
            {results.map((location, index) => (
              <Button
                key={`${location.latitude}-${location.longitude}-${index}`}
                variant="ghost"
                className="w-full justify-start gap-2 h-auto py-2 px-3"
                onClick={() => handleSelect(location)}
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {location.admin1 && `${location.admin1}, `}{location.country}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
