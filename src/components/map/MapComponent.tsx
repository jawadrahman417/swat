
// MapComponent.tsx
'use client';

import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home as HomeIcon } from "lucide-react";
import type { Property } from '@/lib/types'; // Updated import
import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Default center if no properties or API key
const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 }; // US center
const DEFAULT_ZOOM = 4;

interface MapComponentProps {
  properties: Property[];
  className?: string;
}

export default function MapComponent({ properties, className }: MapComponentProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleMarkerClick = useCallback((propertyId: string) => {
    setSelectedPropertyId(propertyId);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPropertyId(null);
  }, []);

  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId);
  }, [properties, selectedPropertyId]);

  if (!API_KEY || API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <Card className={cn("w-full h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-primary" /> Interactive Property Map
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full flex flex-col items-center justify-center bg-muted/50 rounded-b-md p-4">
          <p className="text-xl font-semibold text-destructive p-4 bg-destructive/10 rounded-md text-center">
            Google Maps API Key is missing or invalid.
          </p>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Please add your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.
          </p>
        </CardContent>
      </Card>
    );
  }

  const mapCenter = useMemo(() => {
    if (properties.length > 0) {
      // If properties are filtered, center on the first one or average
      // For simplicity, centering on the first one if available
      return properties[0].coordinates;
    }
    if (selectedProperty) {
        return selectedProperty.coordinates;
    }
    if (properties.length > 0) {
      return {
        lat: properties.reduce((sum, p) => sum + p.coordinates.lat, 0) / properties.length,
        lng: properties.reduce((sum, p) => sum + p.coordinates.lng, 0) / properties.length,
      };
    }
    return DEFAULT_CENTER;
  }, [properties, selectedProperty]);

  const mapZoom = properties.length > 0 ? (selectedProperty ? 14 : 10) : DEFAULT_ZOOM;

  return (
    <Card className={cn("w-full h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-6 w-6 text-primary" /> Interactive Property Map
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 rounded-b-md overflow-hidden">
        <APIProvider apiKey={API_KEY} solutionChannel="GMP_devsite_samples_js_react-map-solution">
          <Map
            key={properties.map(p => p.id).join(',') + (selectedProperty?.id || '')} // Force re-render if properties or selection change
            center={mapCenter}
            zoom={mapZoom}
            mapId="propswap-map-theme"
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            className="w-full h-full"
          >
            {properties.map((property) => (
              <AdvancedMarker
                key={property.id}
                position={property.coordinates}
                onClick={() => handleMarkerClick(property.id)}
                ref={property.id === selectedPropertyId ? markerRef : undefined}
                title={property.title}
              >
                 <div className={`p-1 rounded-full shadow-md cursor-pointer transition-colors ${property.id === selectedPropertyId ? 'bg-accent' : 'bg-primary hover:bg-primary/80'}`}>
                    <HomeIcon className="w-5 h-5 text-primary-foreground" />
                 </div>
              </AdvancedMarker>
            ))}

            {selectedProperty && marker && (
              <InfoWindow
                anchor={marker}
                onCloseClick={handleInfoWindowClose}
                pixelOffset={{width: 0, height: -40} as any} 
              >
                <div className="p-1 w-64 space-y-1">
                  <div className="relative w-full h-28 mb-2">
                    <Image 
                      src={selectedProperty.imageUrl} 
                      alt={selectedProperty.title} 
                      fill
                      sizes="240px"
                      className="rounded-md object-cover"
                      data-ai-hint="property exterior"
                    />
                  </div>
                  <h3 className="text-md font-semibold text-primary">{selectedProperty.title}</h3>
                  <p className="text-xs text-muted-foreground ">{selectedProperty.address}</p>
                  <p className="text-md font-bold text-primary">${selectedProperty.price.toLocaleString()}</p>
                  <Button variant="accent" size="sm" asChild className="w-full !mt-2">
                    {/* The Link might need to be adjusted if PropertyCard is not directly on the page or scroll target is different */}
                    <Link href={`#property-${selectedProperty.id}`} onClick={() => document.getElementById(`property-${selectedProperty.id}`)?.scrollIntoView({behavior: 'smooth'}) }>View Details</Link>
                  </Button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </CardContent>
    </Card>
  );
}

// Helper for cn if not already globally available
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
