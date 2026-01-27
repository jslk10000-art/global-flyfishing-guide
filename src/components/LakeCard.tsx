import { MapPin, Fish, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lake } from '@/types/database';
import { Link } from 'react-router-dom';

interface LakeCardProps {
  lake: Lake;
}

export function LakeCard({ lake }: LakeCardProps) {
  return (
    <Link to={`/lakes/${lake.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer h-full">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-water-light to-water/30">
          {lake.image_url ? (
            <img
              src={lake.image_url}
              alt={lake.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Fish className="h-16 w-16 text-water/50 animate-wave" />
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display line-clamp-1">{lake.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{lake.location}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {lake.best_season && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Best: {lake.best_season}</span>
            </div>
          )}
          {lake.fish_species && lake.fish_species.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {lake.fish_species.slice(0, 3).map((species) => (
                <Badge
                  key={species}
                  variant="secondary"
                  className="text-xs bg-forest-light text-forest"
                >
                  {species}
                </Badge>
              ))}
              {lake.fish_species.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{lake.fish_species.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
