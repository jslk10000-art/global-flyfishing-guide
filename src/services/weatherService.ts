// Real-time weather service using Open-Meteo (free, no API key required)

export interface RealTimeWeather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  temperatureUnit: 'F' | 'C';
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

// WMO Weather interpretation codes
function getWeatherCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear', icon: 'Clear' };
  if (code <= 3) return { condition: 'Partly Cloudy', icon: 'Partly Cloudy' };
  if (code <= 48) return { condition: 'Foggy', icon: 'Cloudy' };
  if (code <= 57) return { condition: 'Drizzle', icon: 'Light Rain' };
  if (code <= 67) return { condition: 'Rain', icon: 'Rain' };
  if (code <= 77) return { condition: 'Snow', icon: 'Snow' };
  if (code <= 82) return { condition: 'Showers', icon: 'Rain' };
  if (code <= 86) return { condition: 'Snow Showers', icon: 'Snow' };
  if (code >= 95) return { condition: 'Thunderstorm', icon: 'Rain' };
  return { condition: 'Unknown', icon: 'Cloudy' };
}

export async function fetchRealTimeWeather(
  latitude: number,
  longitude: number,
  useFahrenheit: boolean = true
): Promise<RealTimeWeather> {
  const tempUnit = useFahrenheit ? 'fahrenheit' : 'celsius';
  const windUnit = useFahrenheit ? 'mph' : 'kmh';
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data: OpenMeteoResponse = await response.json();
  const { condition, icon } = getWeatherCondition(data.current.weather_code);

  return {
    temperature: Math.round(data.current.temperature_2m),
    condition,
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    icon,
    temperatureUnit: useFahrenheit ? 'F' : 'C',
  };
}

// Geocoding service to get coordinates from location name
interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}

export async function geocodeLocation(query: string): Promise<GeocodingResult[]> {
  // Try multiple search variations to better find water bodies
  const searchVariations = [
    query,
    // If query doesn't already contain water-related terms, try adding them
    ...(!/lake|reservoir|river|pond|creek|stream/i.test(query) 
      ? [`${query} lake`, `${query} reservoir`] 
      : []),
  ];

  const allResults: GeocodingResult[] = [];
  const seenCoords = new Set<string>();

  for (const searchQuery of searchVariations) {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=10&language=en&format=json`;
      
      const response = await fetch(url);
      
      if (!response.ok) continue;

      const data = await response.json();
      
      if (data.results) {
        for (const r of data.results) {
          // Deduplicate by coordinates (rounded to 2 decimals)
          const coordKey = `${r.latitude.toFixed(2)},${r.longitude.toFixed(2)}`;
          if (!seenCoords.has(coordKey)) {
            seenCoords.add(coordKey);
            allResults.push({
              name: r.name,
              latitude: r.latitude,
              longitude: r.longitude,
              country: r.country,
              admin1: r.admin1,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Geocoding error for "${searchQuery}":`, error);
    }
  }

  // Sort results to prioritize water bodies in the name
  const waterKeywords = /lake|reservoir|river|pond|creek|stream|bay|harbor/i;
  allResults.sort((a, b) => {
    const aIsWater = waterKeywords.test(a.name) ? 0 : 1;
    const bIsWater = waterKeywords.test(b.name) ? 0 : 1;
    return aIsWater - bIsWater;
  });

  return allResults.slice(0, 8);
}
