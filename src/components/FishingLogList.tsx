import { useFishingLogs, useDeleteFishingLog } from '@/hooks/useFishingLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Fish, MapPin, Star, Trash2, Thermometer, Cloud, Camera } from 'lucide-react';
import { format } from 'date-fns';

export function FishingLogList() {
  const { data: logs, isLoading } = useFishingLogs();
  const deleteLog = useDeleteFishingLog();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteLog.mutateAsync(id);
      toast({
        title: 'Log deleted',
        description: 'Your fishing log has been removed.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete the log.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Fish className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            No fishing logs yet. Start recording your trips!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="group">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(log.date), 'MMMM d, yyyy')}
                </CardTitle>
                {log.lake && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {log.lake.name}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {log.success_rating && (
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= log.success_rating!
                            ? 'fill-sunrise text-sunrise'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(log.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(log as any).photo_url && (
              <div className="rounded-lg overflow-hidden border">
                <img src={(log as any).photo_url} alt="Catch photo" className="w-full h-48 object-cover" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {log.fish_caught && (
                <Badge variant="secondary" className="bg-forest-light text-forest">
                  <Fish className="h-3 w-3 mr-1" />
                  {log.fish_caught}
                </Badge>
              )}
              {log.fly_used && (
                <Badge variant="outline">
                  🪰 {log.fly_used}
                </Badge>
              )}
              {log.weather_conditions && (
                <Badge variant="outline">
                  <Cloud className="h-3 w-3 mr-1" />
                  {log.weather_conditions}
                </Badge>
              )}
              {log.water_temperature && (
                <Badge variant="outline">
                  <Thermometer className="h-3 w-3 mr-1" />
                  {log.water_temperature}°F
                </Badge>
              )}
            </div>
            {log.notes && (
              <p className="text-sm text-muted-foreground">{log.notes}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
