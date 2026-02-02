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

// Geocoding service using OpenStreetMap Nominatim (free, excellent POI coverage)
interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}

export async function geocodeLocation(query: string): Promise<GeocodingResult[]> {
  // Use Nominatim for primary search - much better POI/lake coverage
  const allResults: GeocodingResult[] = [];
  const seenCoords = new Set<string>();

  try {
    // Primary search with the query as-is
    const nominatimResults = await searchNominatim(query);
    addUniqueResults(nominatimResults, allResults, seenCoords);

    // If query doesn't contain water-related terms, also search with water body terms
    if (!/lake|reservoir|river|pond|creek|stream|loch|llyn/i.test(query)) {
      // Search for multiple water body types in parallel
      const [lakeResults, reservoirResults, riverResults] = await Promise.all([
        searchNominatim(`${query} lake`).catch(() => []),
        searchNominatim(`${query} reservoir`).catch(() => []),
        searchNominatim(`${query} river`).catch(() => []),
      ]);
      
      addUniqueResults(lakeResults, allResults, seenCoords);
      addUniqueResults(reservoirResults, allResults, seenCoords);
      addUniqueResults(riverResults, allResults, seenCoords);
    }
  } catch (error) {
    console.error('Nominatim geocoding error:', error);
  }

  // Sort results to prioritize water bodies
  const waterKeywords = /lake|reservoir|river|pond|creek|stream|bay|harbor|loch|llyn|water/i;
  allResults.sort((a, b) => {
    const aIsWater = waterKeywords.test(a.name) ? 0 : 1;
    const bIsWater = waterKeywords.test(b.name) ? 0 : 1;
    return aIsWater - bIsWater;
  });

  return allResults.slice(0, 10);
}

async function searchNominatim(query: string): Promise<GeocodingResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&accept-language=en`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FishingCompanionApp/1.0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.map((item: any) => ({
    name: item.name || item.display_name.split(',')[0],
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    country: item.address?.country || '',
    admin1: item.address?.state || item.address?.county || item.address?.region || undefined,
  }));
}

function addUniqueResults(
  newResults: GeocodingResult[],
  allResults: GeocodingResult[],
  seenCoords: Set<string>
) {
  for (const result of newResults) {
    const coordKey = `${result.latitude.toFixed(2)},${result.longitude.toFixed(2)}`;
    if (!seenCoords.has(coordKey)) {
      seenCoords.add(coordKey);
      allResults.push(result);
    }
  }
}
