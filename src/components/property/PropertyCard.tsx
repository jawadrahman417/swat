
import Image from 'next/image';
import type { Property } from '@/lib/types'; // Updated import
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BedDouble, Bath, Ruler, MapPin } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card 
      id={`property-${property.id}`} 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
    >
      <CardHeader className="p-0">
        <div className="relative w-full h-52 md:h-60">
          <Image 
            src={property.imageUrl} 
            alt={property.title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="house exterior" 
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg md:text-xl font-semibold">{property.title}</CardTitle>
          <Badge variant={property.type === 'sale' ? 'default' : 'secondary'} className="whitespace-nowrap">
            {property.type === 'sale' ? 'For Sale' : 'For Rent'}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground mb-1 flex items-center">
          <MapPin className="w-4 h-4 mr-1 shrink-0" /> {property.address}
        </CardDescription>
        <p className="text-xl md:text-2xl font-bold text-primary my-3">${property.price.toLocaleString()}</p>
        <div className="flex items-center space-x-3 text-xs md:text-sm text-muted-foreground">
          <span className="flex items-center"><BedDouble className="w-4 h-4 mr-1 shrink-0" /> {property.bedrooms} Beds</span>
          <span className="flex items-center"><Bath className="w-4 h-4 mr-1 shrink-0" /> {property.bathrooms} Baths</span>
          <span className="flex items-center"><Ruler className="w-4 h-4 mr-1 shrink-0" /> {property.area} sqft</span>
        </div>
        {/* Displaying a few features for demonstration */}
        {property.features && property.features.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Features: {property.features.slice(0, 2).join(', ')}{property.features.length > 2 ? '...' : ''}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
         <Button variant="accent" className="w-full">
            View Details
         </Button>
      </CardFooter>
    </Card>
  );
}
