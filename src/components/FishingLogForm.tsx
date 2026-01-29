import { useState } from 'react';
import { useCreateFishingLog } from '@/hooks/useFishingLogs';
import { useLakes } from '@/hooks/useLakes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Star } from 'lucide-react';
import { fishingLogSchema } from '@/lib/validations';

interface FishingLogFormProps {
  onSuccess?: () => void;
}

interface FormErrors {
  date?: string;
  fish_caught?: string;
  fly_used?: string;
  weather_conditions?: string;
  water_temperature?: string;
  notes?: string;
  success_rating?: string;
}

export function FishingLogForm({ onSuccess }: FishingLogFormProps) {
  const [lakeId, setLakeId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fishCaught, setFishCaught] = useState('');
  const [flyUsed, setFlyUsed] = useState('');
  const [weatherConditions, setWeatherConditions] = useState('');
  const [waterTemp, setWaterTemp] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: lakes } = useLakes();
  const createLog = useCreateFishingLog();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with zod
    const result = fishingLogSchema.safeParse({
      lake_id: lakeId || undefined,
      date,
      fish_caught: fishCaught || undefined,
      fly_used: flyUsed || undefined,
      weather_conditions: weatherConditions || undefined,
      water_temperature: waterTemp ? parseFloat(waterTemp) : undefined,
      notes: notes || undefined,
      success_rating: rating || undefined,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors.',
        variant: 'destructive',
      });
      return;
    }

    setErrors({});

    try {
      await createLog.mutateAsync({
        lake_id: result.data.lake_id || undefined,
        date: result.data.date,
        fish_caught: result.data.fish_caught || undefined,
        fly_used: result.data.fly_used || undefined,
        weather_conditions: result.data.weather_conditions || undefined,
        water_temperature: result.data.water_temperature ?? undefined,
        notes: result.data.notes || undefined,
        success_rating: result.data.success_rating ?? undefined,
      });

      toast({
        title: 'Log saved!',
        description: 'Your fishing trip has been recorded.',
      });

      // Reset form
      setLakeId('');
      setDate(new Date().toISOString().split('T')[0]);
      setFishCaught('');
      setFlyUsed('');
      setWeatherConditions('');
      setWaterTemp('');
      setNotes('');
      setRating(0);

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your fishing log.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Log a Fishing Trip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lake">Lake/River</Label>
              <Select value={lakeId} onValueChange={setLakeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {lakes?.map((lake) => (
                    <SelectItem key={lake.id} value={lake.id}>
                      {lake.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fishCaught">Fish Caught</Label>
              <Input
                id="fishCaught"
                placeholder="e.g., 3 Rainbow Trout"
                value={fishCaught}
                onChange={(e) => setFishCaught(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flyUsed">Fly Used</Label>
              <Input
                id="flyUsed"
                placeholder="e.g., Elk Hair Caddis #16"
                value={flyUsed}
                onChange={(e) => {
                  setFlyUsed(e.target.value);
                  if (errors.fly_used) setErrors((prev) => ({ ...prev, fly_used: undefined }));
                }}
                className={errors.fly_used ? 'border-destructive' : ''}
              />
              {errors.fly_used && (
                <p className="text-sm text-destructive">{errors.fly_used}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weather">Weather Conditions</Label>
              <Input
                id="weather"
                placeholder="e.g., Partly cloudy, 65°F"
                value={weatherConditions}
                onChange={(e) => {
                  setWeatherConditions(e.target.value);
                  if (errors.weather_conditions) setErrors((prev) => ({ ...prev, weather_conditions: undefined }));
                }}
                className={errors.weather_conditions ? 'border-destructive' : ''}
              />
              {errors.weather_conditions && (
                <p className="text-sm text-destructive">{errors.weather_conditions}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waterTemp">Water Temp (°F)</Label>
              <Input
                id="waterTemp"
                type="number"
                step="0.1"
                placeholder="e.g., 52"
                value={waterTemp}
                onChange={(e) => {
                  setWaterTemp(e.target.value);
                  if (errors.water_temperature) setErrors((prev) => ({ ...prev, water_temperature: undefined }));
                }}
                className={errors.water_temperature ? 'border-destructive' : ''}
              />
              {errors.water_temperature && (
                <p className="text-sm text-destructive">{errors.water_temperature}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Success Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-sunrise text-sunrise'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about your trip..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }));
              }}
              rows={3}
              className={errors.notes ? 'border-destructive' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={createLog.isPending}>
            {createLog.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Fishing Log
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
