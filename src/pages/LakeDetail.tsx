import { useParams, Link } from 'react-router-dom';
import { useLake } from '@/hooks/useLakes';
import { Header } from '@/components/Header';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Calendar, Fish, ExternalLink } from 'lucide-react';

export default function LakeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lake, isLoading } = useLake(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (!lake) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Lake not found</h1>
          <Link to="/lakes">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lakes
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const mapsUrl = lake.latitude && lake.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${lake.latitude},${lake.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lake.name + ', ' + lake.location)}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <Link to="/lakes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Lakes
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-water-light to-water/30">
              {lake.image_url ? (
                <img
                  src={lake.image_url}
                  alt={lake.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Fish className="h-24 w-24 text-water/30 animate-wave" />
                </div>
              )}
            </div>

            {/* Lake Info */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{lake.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {lake.location}
                </span>
                {lake.best_season && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Best: {lake.best_season}
                  </span>
                )}
              </div>

              {lake.description && (
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {lake.description}
                </p>
              )}

              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </a>
            </div>

            {/* Fish Species */}
            {lake.fish_species && lake.fish_species.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                  <Fish className="h-5 w-5" />
                  Fish Species
                </h2>
                <div className="flex flex-wrap gap-2">
                  {lake.fish_species.map((species) => (
                    <Badge
                      key={species}
                      variant="secondary"
                      className="bg-forest-light text-forest text-sm py-1.5 px-3"
                    >
                      {species}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WeatherWidget
              latitude={lake.latitude ?? undefined}
              longitude={lake.longitude ?? undefined}
              locationName={lake.name}
            />

            <Link to={`/recommendations?lake=${encodeURIComponent(lake.name)}`}>
              <Button className="w-full" size="lg">
                Get Fly Recommendations
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
