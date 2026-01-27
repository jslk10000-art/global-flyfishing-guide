import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { LakeCard } from '@/components/LakeCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { Button } from '@/components/ui/button';
import { useLakes } from '@/hooks/useLakes';
import { Skeleton } from '@/components/ui/skeleton';
import { Fish, MapPin, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

export default function Index() {
  const { data: lakes, isLoading } = useLakes();
  const featuredLakes = lakes?.slice(0, 3);

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
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Discover Colorado's
              <span className="text-primary block">Best Fly Fishing</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Find the perfect lake, get AI-powered fly recommendations, and log your catches. 
              Your complete guide to fly fishing in the Centennial State.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/lakes">
                <Button size="lg" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Explore Lakes
                </Button>
              </Link>
              <Link to="/recommendations">
                <Button size="lg" variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Get Fly Recommendations
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
                <MapPin className="h-7 w-7 text-water" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Find Fishing Spots</h3>
              <p className="text-muted-foreground">
                Browse Colorado's best lakes and rivers with detailed information and species guides.
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

      {/* Featured Lakes */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Popular Fishing Spots</h2>
              <p className="text-muted-foreground">Discover top-rated locations</p>
            </div>
            <Link to="/lakes">
              <Button variant="ghost" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {featuredLakes?.map((lake) => (
                <LakeCard key={lake.id} lake={lake} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Weather + CTA */}
      <section className="py-16 bg-gradient-to-br from-water-light/50 to-background">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Current Conditions
              </h2>
              <p className="text-muted-foreground mb-6">
                Check the weather before you head out to maximize your success on the water.
              </p>
              <WeatherWidget locationName="Denver, CO" />
            </div>
            <div className="bg-card rounded-xl p-8 border shadow-lg">
              <Fish className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-display text-2xl font-bold mb-3">Ready to Fish?</h3>
              <p className="text-muted-foreground mb-6">
                Sign up to save your fishing logs, get personalized recommendations, and track your progress.
              </p>
              <Link to="/auth">
                <Button size="lg" className="w-full">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Colorado Fly Fisher. Made with ❤️ for fly fishing enthusiasts.</p>
        </div>
      </footer>
    </div>
  );
}
