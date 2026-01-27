import { Cloud, Droplets, Wind, Sun, CloudRain, Snowflake, ThermometerSun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { WeatherData } from '@/types/database';

interface WeatherWidgetProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

// Simple weather simulation based on location and date
function getSimulatedWeather(lat?: number, lng?: number): WeatherData {
  const month = new Date().getMonth();
  const hour = new Date().getHours();
  
  // Base temperature for Colorado (varies by season)
  const seasonTemp: Record<number, number> = {
    0: 32, 1: 38, 2: 45, 3: 52, 4: 60, 5: 72,
    6: 78, 7: 76, 8: 68, 9: 55, 10: 42, 11: 34,
  };
  
  const baseTemp = seasonTemp[month] || 55;
  const variation = Math.sin(hour / 24 * Math.PI * 2) * 10;
  const altitudeAdjust = lat && lat > 39 ? -5 : 0;
  
  const temperature = Math.round(baseTemp + variation + altitudeAdjust + (Math.random() * 6 - 3));
  
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature,
    condition,
    humidity: Math.round(30 + Math.random() * 40),
    windSpeed: Math.round(5 + Math.random() * 15),
    icon: condition,
  };
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
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Simulate fetching weather data
    const data = getSimulatedWeather(latitude, longitude);
    setWeather(data);
  }, [latitude, longitude]);

  if (!weather) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Loading Weather...</CardTitle>
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
                <span className="text-lg text-muted-foreground">°F</span>
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
