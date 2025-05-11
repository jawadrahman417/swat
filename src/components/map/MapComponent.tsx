// src/components/map/MapComponent.tsx
'use client';

import 'leaflet/dist/leaflet.css';
import L, { type LatLngExpression } from 'leaflet'; // Import L and LatLngExpression type
// Import marker icon images if not using custom L.divIcon exclusively or for fallbacks.
// Default Leaflet icons require these.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react"; // HomeIcon, AlertTriangle removed as they are not used here
import type { Property } from '@/lib/types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import MapSkeleton from './MapSkeleton';

// Configure Leaflet default icon paths for standard markers (if used)
// This is important if you mix L.divIcon with default L.Icon markers.
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

const DEFAULT_CENTER_COORDS: [number, number] = [39.8283, -98.5795]; // US center as array
const DEFAULT_ZOOM = 4;

interface MapComponentProps {
  properties: Property[];
  className?: string;
  selectedPropertyId?: string | null;
  onPropertySelect?: (propertyId: string | null) => void;
}

// Removed UpdateMapCenter component as MapContainer's center/zoom props are reactive.

export default function MapComponent({ properties, className, selectedPropertyId, onPropertySelect }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mapCenter: LatLngExpression = useMemo(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(p =>
        p.coordinates &&
        typeof p.coordinates.lat === 'number' && !isNaN(p.coordinates.lat) &&
        typeof p.coordinates.lng === 'number' && !isNaN(p.coordinates.lng)
      );

      if (validProperties.length > 0) {
        const bounds = L.latLngBounds(validProperties.map(p => [p.coordinates.lat, p.coordinates.lng]));
        if (bounds.isValid()) {
          return bounds.getCenter();
        }
      }
    }
    return L.latLng(DEFAULT_CENTER_COORDS[0], DEFAULT_CENTER_COORDS[1]);
  }, [properties]);

  const mapZoom = useMemo(() => {
    if (properties.length === 0) return DEFAULT_ZOOM;
    if (properties.length === 1) return 13; // Zoom in more for a single property
    // For multiple properties, fitBounds is often better, but a fixed zoom can work.
    return 6; 
  }, [properties]);
  
  const handleMarkerClick = useCallback((propertyId: string) => {
    if (onPropertySelect) {
      onPropertySelect(propertyId);
    }
  }, [onPropertySelect]);

  if (!isClient) {
    return <MapSkeleton />;
  }

  const displayProperties = properties && properties.length > 0 ? properties : [];

  return (
    <Card className={cn("w-full h-full flex flex-col shadow-lg rounded-lg overflow-hidden", className)}>
      <CardHeader className="bg-card border-b">
        <CardTitle className="flex items-center text-primary">
          <MapPin className="mr-2 h-6 w-6" /> Interactive Property Map
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          // Removed key to prevent unnecessary re-initializations unless MapComponent itself is keyed
        >
          {/* UpdateMapCenter component removed */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {displayProperties.map((property) => (
            <Marker
              key={property.id}
              position={[property.coordinates.lat, property.coordinates.lng]}
              eventHandlers={{
                click: () => handleMarkerClick(property.id),
              }}
              icon={L.divIcon({ // Using custom SVG icon
                html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 ${selectedPropertyId === property.id ? 'text-accent' : 'text-primary'}"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
                className: `p-1 rounded-full shadow-md ${selectedPropertyId === property.id ? 'bg-primary-foreground ring-2 ring-accent' : 'bg-primary-foreground'} leaflet-marker-icon`,
                iconSize: [32,32], 
                iconAnchor: [16,32], // Anchor point of the icon (bottom center for house shape)
                popupAnchor: [0,-32] // Popup anchor relative to iconAnchor
              })}
            >
              <Popup autoPan={false}>
                <div className="p-1 w-64 space-y-1">
                  <div className="relative w-full h-28 mb-2 rounded-md overflow-hidden">
                    <Image
                      src={property.imageUrl}
                      alt={property.title}
                      fill
                      sizes="240px" // Provide appropriate sizes attribute
                      className="object-cover"
                      data-ai-hint="property exterior"
                    />
                  </div>
                  <h3 className="text-md font-semibold text-primary">{property.title}</h3>
                  <p className="text-xs text-muted-foreground ">{property.address}</p>
                  <p className="text-md font-bold text-primary">${property.price.toLocaleString()}</p>
                  <Button variant="default" size="sm" asChild className="w-full !mt-2">
                    {/* The href targets an ID on the page. Ensure PropertyCard has corresponding id. */}
                    <Link href={`#property-${property.id}`} onClick={(e) => {
                      // Smooth scroll to the property card
                      const element = document.getElementById(`property-${property.id}`);
                      if (element) {
                        e.preventDefault(); // Prevent default link behavior only if element exists
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                      // Closing popup is handled by Leaflet by default when map is clicked or another popup opens.
                      // If map.closePopup() is needed, it would require map instance access.
                    }}>View Details</Link>
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
         {displayProperties.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 pointer-events-none z-10">
            <div className="text-center p-4 bg-background/90 rounded-md shadow-xl">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No properties to display on the map.</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}