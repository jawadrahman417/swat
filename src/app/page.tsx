
// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import PropertyCard from '@/components/property/PropertyCard';
import type { Property, AppliedFilters } from '@/lib/types'; 
import { placeholderProperties } from '@/lib/placeholder-data';
import { initialFilters } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import FilterSheet from '@/components/property/FilterSheet'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin as MapPinIcon } from 'lucide-react'; // Renamed to avoid conflict if MapPin is used elsewhere

export default function HomePage() {
  const [propertiesToDisplay, setPropertiesToDisplay] = useState<Property[]>([...placeholderProperties]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<AppliedFilters>(initialFilters);

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
      if (activeFilters.location.trim() !== '') {
        if (!property.address.toLowerCase().includes(activeFilters.location.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
    
    setPropertiesToDisplay(currentProperties);

  }, [searchTerm, activeFilters]);


  useEffect(() => {
    applyAllFilters();
  }, [applyAllFilters]);


  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleApplyFilters = (filters: AppliedFilters) => {
    setActiveFilters(filters);
  };

  // Sort properties by proximity to a default location (e.g., Karachi)
  // This is a simplified proximity sort, real-world would use actual user location.
  const sortedProperties = [...propertiesToDisplay].sort((a, b) => {
    const defaultLocation = { lat: 24.8607, lng: 67.0011 }; // Karachi as example
    const distA = Math.sqrt(Math.pow(a.coordinates.lat - defaultLocation.lat, 2) + Math.pow(a.coordinates.lng - defaultLocation.lng, 2));
    const distB = Math.sqrt(Math.pow(b.coordinates.lat - defaultLocation.lat, 2) + Math.pow(b.coordinates.lng - defaultLocation.lng, 2));
    return distA - distB;
  });

  return (
    <div className="space-y-8">
      <Card className="bg-card p-6 rounded-lg shadow-lg">
        <CardHeader className="p-0 mb-6">
            <CardTitle className="text-3xl font-bold text-primary">Find Your Next Property</CardTitle>
            <CardDescription>Search, filter, and explore listings.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>
      
      {/* Placeholder for Map - Removed MapComponent to fix initialization error */}
      {/* <Card className="bg-card p-0 rounded-lg shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <MapPinIcon className="mr-2 h-5 w-5" /> Property Locations
          </CardTitle>
          <CardDescription>Visualise properties on the map.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] md:h-[500px] bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Map feature is currently unavailable.</p>
        </CardContent>
      </Card> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {sortedProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
        {sortedProperties.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-10">No properties match your current search or filters.</p>
        )}
      </div>

      {sortedProperties.length > 0 && (
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
