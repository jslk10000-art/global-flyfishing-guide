import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { WeatherWidget } from '@/components/WeatherWidget';
import { LocationSearch } from '@/components/LocationSearch';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/hooks/useLocationContext';
import { useAuth } from '@/hooks/useAuth';
import { Fish, MapPin, Sparkles, BookOpen, Globe, Heart } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { location: selectedLocation, setLocation } = useLocation();
  const { user } = useAuth();

  const handleLocationSelect = (location: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }) => {
    setLocation(location);
  };

  const goToRecommendations = () => {
    if (selectedLocation) {
      const params = new URLSearchParams({
        location: selectedLocation.name,
        lat: selectedLocation.latitude.toString(),
        lng: selectedLocation.longitude.toString(),
        country: selectedLocation.country,
      });
      navigate(`/recommendations?${params.toString()}`);
    } else {
      navigate('/recommendations');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-water-light via-background to-forest-light py-20 md:py-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-water/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-forest/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">Works anywhere in the world</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Lake
              <span className="text-primary block">Fly Fishing Guide</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Search any lake or river worldwide. Get AI-powered fly recommendations, 
              real-time weather, and log your catches.
            </p>

            {/* Location Search */}
            <div className="mb-6 max-w-lg">
              <LocationSearch 
                onLocationSelect={handleLocationSelect}
                placeholder="Search any lake, river, or destination..."
                initialValue={selectedLocation ? `${selectedLocation.name}, ${selectedLocation.country}` : ''}
                selectedLocation={selectedLocation}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2" onClick={goToRecommendations}>
                <Sparkles className="h-4 w-4" />
                {selectedLocation ? `Get Flies for ${selectedLocation.name}` : 'Get Fly Recommendations'}
              </Button>
              {user && (
                <Link to="/my-spots">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Heart className="h-4 w-4" />
                    My Saved Spots
                  </Button>
                </Link>
              )}
              <Link to="/lakes">
                <Button size="lg" variant="outline" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Browse Community Lakes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-water-light mb-4">
                <Globe className="h-7 w-7 text-water" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Fish Anywhere</h3>
              <p className="text-muted-foreground">
                Search any lake or river in the world with real-time weather and conditions.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sunrise-light mb-4">
                <Sparkles className="h-7 w-7 text-sunrise" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">AI Fly Finder</h3>
              <p className="text-muted-foreground">
                Get personalized fly recommendations based on weather, season, and target species.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-light mb-4">
                <BookOpen className="h-7 w-7 text-forest" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Fishing Log</h3>
              <p className="text-muted-foreground">
                Track your trips, catches, and successful fly patterns to improve your technique.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Weather + CTA */}
      <section className="py-16 bg-gradient-to-br from-water-light/50 to-background">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Real-Time Weather
              </h2>
              <p className="text-muted-foreground mb-6">
                Get live weather conditions for any location to maximize your success on the water.
              </p>
              <WeatherWidget 
                latitude={selectedLocation?.latitude} 
                longitude={selectedLocation?.longitude}
                locationName={selectedLocation?.name}
              />
            </div>
            <div className="bg-card rounded-xl p-8 border shadow-lg">
              <Fish className="h-12 w-12 text-primary mb-4" />
              {user ? (
                <>
                  <h3 className="font-display text-2xl font-bold mb-3">Welcome Back!</h3>
                  <p className="text-muted-foreground mb-6">
                    View your saved fishing spots, logs, and recommendations.
                  </p>
                  <Link to="/my-spots">
                    <Button size="lg" className="w-full">My Fishing Spots</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="font-display text-2xl font-bold mb-3">Ready to Fish?</h3>
                  <p className="text-muted-foreground mb-6">
                    Sign up to save your fishing logs, get personalized recommendations, and track your progress.
                  </p>
                  <Link to="/auth">
                    <Button size="lg" className="w-full">Get Started Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Your Lake Fly Fishing Guide. Made with ❤️ for fly fishing enthusiasts worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
