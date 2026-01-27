import { Header } from '@/components/Header';
import { FishingLogForm } from '@/components/FishingLogForm';
import { FishingLogList } from '@/components/FishingLogList';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, LogIn } from 'lucide-react';

export default function FishingLogPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Sign in to access your fishing log</h1>
            <p className="text-muted-foreground mb-6">
              Keep track of your catches, flies, and conditions for every trip.
            </p>
            <Link to="/auth">
              <Button size="lg">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            My Fishing Log
          </h1>
          <p className="text-muted-foreground">
            Record your trips and track what works best
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <FishingLogForm />
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Recent Trips</h2>
            <FishingLogList />
          </div>
        </div>
      </main>
    </div>
  );
}
