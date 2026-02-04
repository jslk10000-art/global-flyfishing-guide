import { FlyRecommendation } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Anchor,
  Ruler,
  Activity,
  ArrowDownToLine
} from 'lucide-react';

interface FlyRecommendationDetailProps {
  recommendation: FlyRecommendation;
}

export function FlyRecommendationDetail({ recommendation }: FlyRecommendationDetailProps) {
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sunrise" />
            <CardTitle className="text-lg font-semibold">{recommendation.name}</CardTitle>
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
      <CardContent className="pt-4 space-y-4">
        <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          {recommendation.lineType && (
            <div className="flex items-start gap-2">
              <Anchor className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Line Type</p>
                <p className="text-sm font-medium">{recommendation.lineType}</p>
              </div>
            </div>
          )}
          
          {recommendation.leaderLength && (
            <div className="flex items-start gap-2">
              <Ruler className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Leader</p>
                <p className="text-sm font-medium">{recommendation.leaderLength}</p>
              </div>
            </div>
          )}
          
          {recommendation.retrieveStyle && (
            <div className="flex items-start gap-2">
              <Activity className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Retrieve Style</p>
                <p className="text-sm font-medium">{recommendation.retrieveStyle}</p>
              </div>
            </div>
          )}
          
          {recommendation.idealDepth && (
            <div className="flex items-start gap-2">
              <ArrowDownToLine className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Ideal Depth</p>
                <p className="text-sm font-medium">{recommendation.idealDepth}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
