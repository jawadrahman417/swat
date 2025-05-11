'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/property/PropertyCard';
import type { Property } from '@/lib/placeholder-data'; // Import Property type
import { placeholderProperties } from '@/lib/placeholder-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, AlertTriangle } from 'lucide-react';

// Helper function to calculate Haversine distance
function haversineDistance(
  userCoords: { latitude: number; longitude: number },
  propertyCoords: { lat: number; lng: number }
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (propertyCoords.lat - userCoords.latitude) * Math.PI / 180;
  const dLon = (propertyCoords.lng - userCoords.longitude) * Math.PI / 180;
  const lat1 = userCoords.latitude * Math.PI / 180;
  const lat2 = propertyCoords.lat * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

interface PropertyWithDistance extends Property {
  distance?: number;
}

export default function HomePage() {
  const [sortedProperties, setSortedProperties] = useState<PropertyWithDistance[]>([...placeholderProperties]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error' | 'unsupported' | 'default'>('loading');

  useEffect(() => {
    // Ensure this runs only in the browser
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        (error) => {
          console.error("Error getting user location:", error);
          setLocationStatus('error');
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser or not in a browser environment.");
      // Fallback if geolocation is not available or not in a browser
      setLocationStatus('unsupported');
    }
  }, []);

  useEffect(() => {
    if (locationStatus === 'success' && userLocation) {
      const propertiesWithDistance = placeholderProperties.map(property => ({
        ...property,
        distance: haversineDistance(userLocation, property.coordinates),
      }));
      propertiesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      setSortedProperties(propertiesWithDistance);
    } else if (locationStatus === 'error' || locationStatus === 'unsupported') {
      // If location failed, ensure default sort and update status to 'default' to show appropriate message
      setSortedProperties([...placeholderProperties]); 
      setLocationStatus('default');
    } else if (locationStatus === 'loading') {
      // While loading, properties are already set to default by useState initial value
      // No specific action needed here unless we want a different loading display for properties
    }
    // If locationStatus is 'default', properties are already set to default
  }, [userLocation, locationStatus]);

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-primary">Find Your Next Property</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search by location, type, or keyword..."
            className="flex-grow"
            aria-label="Search properties"
          />
          <Button variant="default" className="w-full md:w-auto">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Button variant="outline" className="w-full md:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      {/* Location Status Message */}
      <div className="my-4 p-3 rounded-md text-sm bg-secondary text-secondary-foreground">
        {locationStatus === 'loading' && (
          <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 animate-pulse text-primary" /> Fetching your location to sort properties by proximity...</p>
        )}
        {locationStatus === 'success' && userLocation && (
          <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" /> Properties sorted by proximity to you.</p>
        )}
        {(locationStatus === 'default' || locationStatus === 'error' || locationStatus === 'unsupported') && locationStatus !== 'loading' && (
          <p className="flex items-center"><AlertTriangle className="mr-2 h-4 w-4 text-accent" /> Could not determine your location. Showing default property order. Please ensure location services are enabled.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {sortedProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Properties</Button>
      </div>
    </div>
  );
}
