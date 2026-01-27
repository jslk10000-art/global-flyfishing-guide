import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlyRecommendation } from '@/types/database';

interface FlyRecommendationCardProps {
  recommendation: FlyRecommendation;
}

export function FlyRecommendationCard({ recommendation }: FlyRecommendationCardProps) {
  const confidenceColor = {
    high: 'bg-forest text-forest-foreground',
    medium: 'bg-sunrise text-sunrise-foreground',
    low: 'bg-muted text-muted-foreground',
  };

  const ConfidenceIcon = {
    high: TrendingUp,
    medium: Minus,
    low: TrendingDown,
  };

  const Icon = ConfidenceIcon[recommendation.confidence];

  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sunrise" />
            <CardTitle className="text-base font-semibold">{recommendation.name}</CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs flex items-center gap-1 ${confidenceColor[recommendation.confidence]}`}
          >
            <Icon className="h-3 w-3" />
            {recommendation.confidence}
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit text-xs">
          {recommendation.type}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
      </CardContent>
    </Card>
  );
}
