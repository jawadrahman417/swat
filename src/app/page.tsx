
// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import PropertyCard from '@/components/property/PropertyCard';
import type { Property, AppliedFilters } from '@/lib/types'; 
import { placeholderProperties } from '@/lib/placeholder-data';
import { initialFilters } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, AlertTriangle } from 'lucide-react';
// import MapComponent from '@/components/map/MapComponent'; // Remove direct import
import FilterSheet from '@/components/property/FilterSheet'; 
import MapSkeleton from '@/components/map/MapSkeleton'; // Import the skeleton loader

import dynamic from 'next/dynamic';

// Lazy load MapComponent
const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false, // Map components often rely on browser APIs like `window`
  loading: () => <MapSkeleton />, // Show skeleton while loading
});


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
  const [propertiesToDisplay, setPropertiesToDisplay] = useState<PropertyWithDistance[]>([...placeholderProperties]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error' | 'unsupported' | 'default'>('loading');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AppliedFilters>(initialFilters);

  useEffect(() => {
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
      setLocationStatus('unsupported');
    }
  }, []);

  const applyAllFilters = useCallback(() => {
    let currentProperties: Property[] = [...placeholderProperties];

    // Filter properties based on search term
    if (searchTerm) {
      currentProperties = currentProperties.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filters from FilterSheet
    currentProperties = currentProperties.filter(property => {
      const minPrice = parseFloat(activeFilters.minPrice);
      const maxPrice = parseFloat(activeFilters.maxPrice);
      const bedrooms = parseInt(activeFilters.bedrooms, 10);
      const bathrooms = parseInt(activeFilters.bathrooms, 10);

      if (!isNaN(minPrice) && property.price < minPrice) return false;
      if (!isNaN(maxPrice) && property.price > maxPrice) return false;
      if (activeFilters.listingType !== 'any' && property.type !== activeFilters.listingType) return false;
      
      if (!isNaN(bedrooms) && property.bedrooms < bedrooms) return false;
      if (!isNaN(bathrooms) && property.bathrooms < bathrooms) return false;
      
      if (activeFilters.garage && !property.garage) return false;
      if (activeFilters.negotiable && !property.negotiable) return false;
      if (activeFilters.accessibility !== 'any' && property.accessibility !== activeFilters.accessibility) return false;
      if (activeFilters.water && !property.utilities.water) return false;
      if (activeFilters.electricity && !property.utilities.electricity) return false;

      if (activeFilters.selectedFeatures.length > 0) {
        if (!activeFilters.selectedFeatures.every(feature => property.features.includes(feature))) {
          return false;
        }
      }
      return true;
    });
    
    let propertiesWithDistance: PropertyWithDistance[] = currentProperties.map(p => ({ ...p }));

    if (locationStatus === 'success' && userLocation) {
      propertiesWithDistance = currentProperties.map(property => ({
        ...property,
        distance: haversineDistance(userLocation, property.coordinates),
      }));
      propertiesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    
    setPropertiesToDisplay(propertiesWithDistance);

  }, [userLocation, locationStatus, searchTerm, activeFilters]);


  useEffect(() => {
    applyAllFilters();
  }, [applyAllFilters]);


  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleApplyFilters = (filters: AppliedFilters) => {
    setActiveFilters(filters);
  };

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
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button variant="default" className="w-full md:w-auto" onClick={() => applyAllFilters()}>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
          <Button variant="outline" className="w-full md:w-auto" onClick={() => setIsFilterSheetOpen(true)}>
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>
      </div>
      
      {/* Map Section (moved under search/filter) */}
      <div className="h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-md">
        <MapComponent properties={propertiesToDisplay} />
      </div>
      
      {/* Location Status Message */}
      <div className="my-4 p-3 rounded-md text-sm bg-secondary text-secondary-foreground">
        {locationStatus === 'loading' && (
          <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 animate-pulse text-primary" /> Fetching your location to sort properties by proximity...</p>
        )}
        {locationStatus === 'success' && userLocation && (
          <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" /> Properties sorted by proximity to you. Map updated with results.</p>
        )}
        {(locationStatus === 'default' || locationStatus === 'error' || locationStatus === 'unsupported') && locationStatus !== 'loading' && (
          <p className="flex items-center"><AlertTriangle className="mr-2 h-4 w-4 text-accent" /> Could not determine your location. Showing default property order. Map displays all properties.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {propertiesToDisplay.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
        {propertiesToDisplay.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-10">No properties match your current search or filters.</p>
        )}
      </div>

      {propertiesToDisplay.length > 0 && (
        <div className="flex justify-center mt-8">
            <Button variant="outline">Load More Properties</Button>
        </div>
      )}
      <FilterSheet 
        open={isFilterSheetOpen} 
        onOpenChange={setIsFilterSheetOpen}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </div>
  );
}
