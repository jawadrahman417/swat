import PropertyCard from '@/components/property/PropertyCard';
import { placeholderProperties } from '@/lib/placeholder-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

export default function HomePage() {
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {placeholderProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Properties</Button>
      </div>
    </div>
  );
}
