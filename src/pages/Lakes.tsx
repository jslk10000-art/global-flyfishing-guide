import { useState } from 'react';
import { useLakes } from '@/hooks/useLakes';
import { SearchBar } from '@/components/SearchBar';
import { LakeCard } from '@/components/LakeCard';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

export default function LakesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: lakes, isLoading } = useLakes(searchQuery);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Saved Fishing Spots</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Browse community locations or search anywhere using the Fly Finder
          </p>
        </div>

        <div className="mb-6 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or location..."
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : lakes && lakes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lakes.map((lake) => (
              <LakeCard key={lake.id} lake={lake} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No lakes found matching "{searchQuery}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
