import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { geocodeLocation } from '@/services/weatherService';
import { SaveLocationButton } from '@/components/SaveLocationButton';

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
  showSaveButton?: boolean;
  selectedLocation?: LocationResult | null;
}

export function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Search any lake or location...", 
  initialValue = "",
  showSaveButton = true,
  selectedLocation
}: LocationSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const locations = await geocodeLocation(searchQuery);
      setResults(locations);
      setShowResults(true);
    } catch (error) {
      console.error('Geocoding error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    doSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch(query);
    }
  };

  const handleSelect = (location: LocationResult) => {
    setQuery(`${location.name}${location.admin1 ? `, ${location.admin1}` : ''}, ${location.country}`);
    setResults([]);
    setShowResults(false);
    onLocationSelect(location);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="pl-10 pr-4"
          />
        </div>
        <Button 
          onClick={handleSearchClick} 
          disabled={loading || query.length < 2}
          size="default"
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
        {showSaveButton && selectedLocation && (
          <SaveLocationButton location={selectedLocation} variant="icon" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full shadow-lg max-h-80 overflow-y-auto">
          <CardContent className="p-1">
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b mb-1">
              Select a fishing spot
            </div>
            {results.map((location, index) => {
              const isWaterBody = /lake|reservoir|river|pond|creek|stream|bay|loch|llyn/i.test(location.name);
              return (
                <Button
                  key={`${location.latitude}-${location.longitude}-${index}`}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto py-2.5 px-3 hover:bg-primary/5"
                  onClick={() => handleSelect(location)}
                >
                  <MapPin className={`h-4 w-4 shrink-0 ${isWaterBody ? 'text-water' : 'text-muted-foreground'}`} />
                  <div className="text-left flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {location.name}
                      {isWaterBody && (
                        <span className="text-[10px] bg-water/10 text-water px-1.5 py-0.5 rounded">
                          Water
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {location.admin1 && `${location.admin1}, `}{location.country}
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
