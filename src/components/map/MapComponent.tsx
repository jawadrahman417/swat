// src/components/map/MapComponent.tsx
'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home as HomeIcon, AlertTriangle } from "lucide-react";
import type { Property } from '@/lib/types';
import { useState, useEffect, useMemo }_from_ 'react';
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
}

export default function MapComponent({ properties, className }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

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

  const mapZoom = properties.length > 0 ? (properties.length === 1 ? 12 : 10) : DEFAULT_ZOOM;

  useEffect(() => {
    if (mapInstance && properties.length > 0) {
      const bounds = L.latLngBounds(properties.map(p => [p.coordinates.lat, p.coordinates.lng] as L.LatLngExpression));
      if (bounds.isValid()) {
         mapInstance.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (mapInstance) {
        mapInstance.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [properties, mapInstance]);


  if (!isClient) {
    return <MapSkeleton />;
  }

  const displayProperties = properties && properties.length > 0 ? properties : [];

  return (
    <Card className={cn("w-full h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-6 w-6 text-primary" /> Interactive Property Map
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 rounded-b-md overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMapInstance}
          key={displayProperties.length > 0 ? displayProperties.map(p=>p.id).join('_') : 'empty_map'} // Re-render map if properties change significantly
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {displayProperties.map((property) => (
            <Marker
              key={property.id}
              position={[property.coordinates.lat, property.coordinates.lng]}
              icon={L.divIcon({
                html: ReactDOMServer.renderToString(<HomeIcon className="w-5 h-5 text-primary-foreground" />),
                className: 'p-1 rounded-full shadow-md bg-primary leaflet-marker-icon', // Custom class for styling
                iconSize: [28,28], // Adjust size as needed
                iconAnchor: [14,28], // Point of the icon which will correspond to marker's location
                popupAnchor: [0,-28] // Point from which the popup should open relative to the iconAnchor
              })}
            >
              <Popup>
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
                  <Button variant="accent" size="sm" asChild className="w-full !mt-2">
                    <Link href={`#property-${property.id}`} onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(`property-${property.id}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      if (mapInstance && (e.target as HTMLElement).closest('.leaflet-popup-close-button')) {
                        // This is a bit hacky, ideally Popup has an onClose prop or marker has a closePopup method
                        mapInstance.closePopup();
                      }
                    }}>View Details</Link>
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
         {displayProperties.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 pointer-events-none">
            <div className="text-center p-4 bg-background/80 rounded-md shadow">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No properties to display on the map.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Required for custom HTML icons in Leaflet
// This is a workaround, ideally use a proper React component rendering to string if complex.
// For simple icons, CSS classes on a divIcon are often enough.
// If using SVG or complex HTML, ensure it's properly handled.
// For now, this is a placeholder for the ReactDOMServer part if needed.
// We can use lucide-react icons directly if we customize the divIcon more.
const ReactDOMServer = {
  renderToString: (element: React.ReactElement) => {
    // This is a simplified mock. For actual rendering, you'd need a proper setup
    // or use a library that provides this. However, for simple Lucide icons,
    // we can often get away with constructing the SVG string or using CSS.
    // For this example, let's assume the HomeIcon is simple enough or replaced by CSS.
    if (element.type === HomeIcon) {
      // Approximate SVG output for HomeIcon for divIcon. This is very basic.
      return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
    }
    return '';
  }
};
