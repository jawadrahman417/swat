
// MapComponent.tsx
'use client';

import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home as HomeIcon, AlertTriangle } from "lucide-react";
import type { Property } from '@/lib/types'; 
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import MapSkeleton from './MapSkeleton'; // Ensure skeleton is used for loading

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures component only renders on client where window is available
  }, []);

  const handleMarkerClick = useCallback((propertyId: string) => {
    setSelectedPropertyId(propertyId);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPropertyId(null);
  }, []);

  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId);
  }, [properties, selectedPropertyId]);

  const mapCenter = useMemo(() => {
    if (selectedProperty) {
        return selectedProperty.coordinates;
    }
    if (properties.length > 0) {
      // Calculate average center of all properties
      const totalLat = properties.reduce((sum, p) => sum + p.coordinates.lat, 0);
      const totalLng = properties.reduce((sum, p) => sum + p.coordinates.lng, 0);
      return {
        lat: totalLat / properties.length,
        lng: totalLng / properties.length,
      };
    }
    return DEFAULT_CENTER;
  }, [properties, selectedProperty]);

  // Adjust zoom level based on whether properties are present or a specific one is selected
  const mapZoom = properties.length > 0 ? (selectedProperty ? 14 : (properties.length === 1 ? 12 : 10) ) : DEFAULT_ZOOM;


  if (!isClient) {
    return <MapSkeleton />; // Show skeleton during SSR or before client-side hydration
  }

  if (!API_KEY) {
    console.error("Google Maps API Key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.");
    return (
      <Card className={cn("w-full h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-primary" /> Interactive Property Map
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full flex flex-col items-center justify-center bg-muted/50 rounded-b-md p-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
          <p className="text-lg font-semibold text-destructive">
            Google Maps API Key is Missing
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The map cannot be displayed because the Google Maps API key is not configured.
            Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Fallback if properties array is empty after API key check
  const displayProperties = properties && properties.length > 0 ? properties : [];


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
            key={JSON.stringify(mapCenter) + mapZoom + displayProperties.length} // More stable key based on center, zoom and property count
            center={mapCenter}
            zoom={mapZoom}
            mapId="propswap-map-theme" // You can define custom map styles in GCP
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            className="w-full h-full"
            onLoad={(map) => console.log("Map Loaded:", map)}
            onError={(error) => {
                console.error("Google Maps API Error:", error);
                 // It's good to provide user feedback if the map specifically errors out
                // This could be due to API key restrictions, quota limits, or network issues.
            }}
          >
            {displayProperties.map((property) => (
              <AdvancedMarker
                key={property.id}
                position={property.coordinates}
                onClick={() => handleMarkerClick(property.id)}
                ref={property.id === selectedPropertyId ? markerRef : undefined}
                title={property.title}
              >
                 <div className={`p-1 rounded-full shadow-md cursor-pointer transition-colors ${property.id === selectedPropertyId ? 'bg-accent ring-2 ring-accent-foreground' : 'bg-primary hover:bg-primary/80'}`}>
                    <HomeIcon className="w-5 h-5 text-primary-foreground" />
                 </div>
              </AdvancedMarker>
            ))}

            {selectedProperty && marker && (
              <InfoWindow
                anchor={marker}
                onCloseClick={handleInfoWindowClose}
                pixelOffset={{width: 0, height: -40} as any} // Type assertion for pixelOffset
              >
                <div className="p-1 w-64 space-y-1">
                  <div className="relative w-full h-28 mb-2 rounded-md overflow-hidden">
                    <Image 
                      src={selectedProperty.imageUrl} 
                      alt={selectedProperty.title} 
                      fill
                      sizes="240px" // Provide appropriate sizes
                      className="object-cover"
                      data-ai-hint="property exterior"
                    />
                  </div>
                  <h3 className="text-md font-semibold text-primary">{selectedProperty.title}</h3>
                  <p className="text-xs text-muted-foreground ">{selectedProperty.address}</p>
                  <p className="text-md font-bold text-primary">${selectedProperty.price.toLocaleString()}</p>
                  <Button variant="accent" size="sm" asChild className="w-full !mt-2">
                    {/* Ensure property.id is unique and correct for scrolling */}
                    <Link href={`#property-${selectedProperty.id}`} onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior
                        const element = document.getElementById(`property-${selectedProperty.id}`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        handleInfoWindowClose(); // Close info window after clicking
                    }}>View Details</Link>
                  </Button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
        {/* Informational message about API key configuration */}
        <div className="absolute bottom-2 left-2 bg-background/80 p-2 rounded-md shadow text-xs text-muted-foreground">
          Map uses Google Maps. Ensure your API key is valid and APIs (Maps JavaScript, Geocoding, Places) are enabled in Google Cloud.
        </div>
      </CardContent>
    </Card>
  );
}

