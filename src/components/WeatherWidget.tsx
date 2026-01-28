import { Cloud, Droplets, Wind, Sun, CloudRain, Snowflake, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { fetchRealTimeWeather, RealTimeWeather } from '@/services/weatherService';

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

function WeatherIcon({ condition }: { condition: string }) {
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun className="h-10 w-10 text-sunrise" />;
    case 'partly cloudy':
      return <Cloud className="h-10 w-10 text-muted-foreground" />;
    case 'cloudy':
      return <Cloud className="h-10 w-10 text-muted-foreground" />;
    case 'light rain':
    case 'rain':
      return <CloudRain className="h-10 w-10 text-water" />;
    case 'snow':
      return <Snowflake className="h-10 w-10 text-water-light" />;
    default:
      return <Sun className="h-10 w-10 text-sunrise" />;
  }
}

export function WeatherWidget({ latitude, longitude, locationName }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<RealTimeWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setWeather(null);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRealTimeWeather(latitude, longitude);
        setWeather(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Unable to load weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (!latitude || !longitude) {
    return (
      <Card className="bg-gradient-to-br from-water-light to-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a location to see weather</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-water-light to-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Weather...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="bg-gradient-to-br from-water-light to-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weather Unavailable
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-water-light to-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Conditions {locationName && `• ${locationName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <WeatherIcon condition={weather.condition} />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{weather.temperature}</span>
                <span className="text-lg text-muted-foreground">°{weather.temperatureUnit}</span>
              </div>
              <p className="text-sm text-muted-foreground">{weather.condition}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wind className="h-4 w-4" />
              <span>{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
