import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useLakes } from '@/hooks/useLakes';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, MapPin, Bookmark } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const savedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const lakeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView() {
  const { user } = useAuth();
  const { data: lakes } = useLakes();
  const { savedLocations } = useSavedLocations();
  const [filter, setFilter] = useState<'all' | 'lakes' | 'saved'>('all');

  const lakesWithCoords = useMemo(
    () => (lakes || []).filter((l) => l.latitude && l.longitude),
    [lakes]
  );

  const markers = useMemo(() => {
    const items: Array<{
      id: string;
      lat: number;
      lng: number;
      name: string;
      type: 'lake' | 'saved';
      detail?: string;
      country?: string;
    }> = [];

    if (filter !== 'saved') {
      lakesWithCoords.forEach((lake) => {
        items.push({
          id: `lake-${lake.id}`,
          lat: lake.latitude!,
          lng: lake.longitude!,
          name: lake.name,
          type: 'lake',
          detail: lake.location,
        });
      });
    }

    if (filter !== 'lakes' && user) {
      savedLocations.forEach((loc) => {
        items.push({
          id: `saved-${loc.id}`,
          lat: loc.latitude,
          lng: loc.longitude,
          name: loc.name,
          type: 'saved',
          country: loc.country,
        });
      });
    }

    return items;
  }, [lakesWithCoords, savedLocations, filter, user]);

  const center: [number, number] = markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : [45, -90];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-7 w-7 text-primary" />
              Map View
            </h1>
            <div className="flex gap-2">
              {(['all', 'lakes', 'saved'] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? 'default' : 'outline'}
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f === 'all' ? 'All' : f === 'lakes' ? 'Community Lakes' : 'My Spots'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1" style={{ minHeight: '500px' }}>
          <MapContainer
            center={center}
            zoom={4}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', minHeight: '500px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((m) => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={m.type === 'saved' ? savedIcon : lakeIcon}
              >
                <Popup>
                  <div className="text-sm space-y-1 min-w-[150px]">
                    <p className="font-semibold flex items-center gap-1">
                      {m.type === 'saved' ? (
                        <Bookmark className="h-3 w-3 text-primary" />
                      ) : (
                        <MapPin className="h-3 w-3 text-water" />
                      )}
                      {m.name}
                    </p>
                    {m.detail && <p className="text-muted-foreground">{m.detail}</p>}
                    {m.country && <p className="text-muted-foreground">{m.country}</p>}
                    <Link
                      to={`/recommendations?location=${encodeURIComponent(m.name)}&lat=${m.lat}&lng=${m.lng}&country=${encodeURIComponent(m.country || '')}`}
                    >
                      <Button size="sm" variant="outline" className="w-full mt-1 gap-1">
                        <Sparkles className="h-3 w-3" />
                        Get Flies
                      </Button>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}
