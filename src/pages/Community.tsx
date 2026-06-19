import { Header } from '@/components/Header';
import { CommunityFeed } from '@/components/CommunityFeed';
import { FishIdentifier } from '@/components/FishIdentifier';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, LogIn } from 'lucide-react';

export default function Community() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Angler Community
          </h1>
          <p className="text-muted-foreground">
            Share your catches, ask questions, and identify fish species instantly
          </p>
        </div>

        {!user && (
          <div className="flex flex-col items-center justify-center py-12 text-center mb-8">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Sign in to join the community</h2>
            <p className="text-muted-foreground mb-6">
              Share catches, comment on posts, and use the AI fish identifier.
            </p>
            <Link to="/auth">
              <Button size="lg">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {user && (
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList>
              <TabsTrigger value="feed" className="gap-1">
                <Users className="h-4 w-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="identify" className="gap-1">
                <Search className="h-4 w-4" />
                Fish ID
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              <CommunityFeed />
            </TabsContent>

            <TabsContent value="identify">
              <FishIdentifier />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
