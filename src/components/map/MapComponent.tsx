// src/components/map/MapComponent.tsx
'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home as HomeIcon, AlertTriangle } from "lucide-react";
import type { Property } from '@/lib/types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import MapSkeleton from './MapSkeleton';

// Configure Leaflet default icon paths
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

const DEFAULT_CENTER: L.LatLngExpression = [39.8283, -98.5795]; // US center
const DEFAULT_ZOOM = 4;

interface MapComponentProps {
  properties: Property[];
  className?: string;
  selectedPropertyId?: string | null;
  onPropertySelect?: (propertyId: string | null) => void;
}

const UpdateMapCenter = ({ center, zoom }: { center: L.LatLngExpression; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};


export default function MapComponent({ properties, className, selectedPropertyId, onPropertySelect }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);
  // const [mapInstance, setMapInstance] = useState<L.Map | null>(null); // Keep if needed for other direct map manipulations

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mapCenter = useMemo(() => {
    if (properties.length > 0) {
      const totalLat = properties.reduce((sum, p) => sum + p.coordinates.lat, 0);
      const totalLng = properties.reduce((sum, p) => sum + p.coordinates.lng, 0);
      return [totalLat / properties.length, totalLng / properties.length] as L.LatLngExpression;
    }
    return DEFAULT_CENTER;
  }, [properties]);

  const mapZoom = properties.length > 0 ? (properties.length === 1 ? 12 : 6) : DEFAULT_ZOOM;
  
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
          // whenCreated={setMapInstance} // Keep if needed
          key={displayProperties.map(p=>p.id).join('_') + (selectedPropertyId || '')} // Re-render map if properties change significantly or selection
        >
          <UpdateMapCenter center={mapCenter} zoom={mapZoom} />
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
              icon={L.divIcon({
                html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 ${selectedPropertyId === property.id ? 'text-accent' : 'text-primary'}"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
                className: `p-1 rounded-full shadow-md ${selectedPropertyId === property.id ? 'bg-primary-foreground ring-2 ring-accent' : 'bg-primary-foreground'} leaflet-marker-icon`,
                iconSize: [32,32], 
                iconAnchor: [16,32], 
                popupAnchor: [0,-32] 
              })}
            >
              <Popup autoPan={false}>
                <div className="p-1 w-64 space-y-1">
                  <div className="relative w-full h-28 mb-2 rounded-md overflow-hidden">
                    <Image
                      src={property.imageUrl}
                      alt={property.title}
                      fill
                      sizes="240px"
                      className="object-cover"
                      data-ai-hint="property exterior"
                    />
                  </div>
                  <h3 className="text-md font-semibold text-primary">{property.title}</h3>
                  <p className="text-xs text-muted-foreground ">{property.address}</p>
                  <p className="text-md font-bold text-primary">${property.price.toLocaleString()}</p>
                  <Button variant="default" size="sm" asChild className="w-full !mt-2">
                    <Link href={`#property-${property.id}`} onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(`property-${property.id}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Closing popup logic can be complex. Leaflet handles it mostly.
                      // If custom close needed: mapInstance?.closePopup();
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
