export interface Property {
  id: string;
  title: string;
  type: 'rent' | 'sale';
  price: number;
  address: string;
  imageUrl: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // sqft or sqm
  coordinates: { lat: number; lng: number };
  description: string;
}

export const placeholderProperties: Property[] = [
  {
    id: '1',
    title: 'Spacious Modern Villa',
    type: 'sale',
    price: 750000,
    address: '123 Sunshine Ave, Miami, FL',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    coordinates: { lat: 25.7617, lng: -80.1918 },
    description: 'A beautiful and spacious modern villa with a private pool and stunning city views. Perfect for families.'
  },
  {
    id: '2',
    title: 'Cozy Downtown Apartment',
    type: 'rent',
    price: 2200,
    address: '456 Urban St, New York, NY',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    bedrooms: 2,
    bathrooms: 1,
    area: 900,
    coordinates: { lat: 40.7128, lng: -74.0060 },
    description: 'A cozy apartment in the heart of downtown, close to all amenities and public transport. Ideal for young professionals.'
  },
  {
    id: '3',
    title: 'Suburban Family Home',
    type: 'sale',
    price: 450000,
    address: '789 Maple Dr, Chicago, IL',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    coordinates: { lat: 41.8781, lng: -87.6298 },
    description: 'Charming suburban home with a large backyard, perfect for families with children. Quiet neighborhood.'
  },
  {
    id: '4',
    title: 'Luxury Penthouse Suite',
    type: 'rent',
    price: 5500,
    address: '101 Sky High Rd, Los Angeles, CA',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    bedrooms: 3,
    bathrooms: 3,
    area: 2200,
    coordinates: { lat: 34.0522, lng: -118.2437 },
    description: 'Stunning penthouse suite with panoramic views of the city. Includes access to rooftop pool and gym.'
  },
   {
    id: '5',
    title: 'Beachfront Condo',
    type: 'sale',
    price: 1200000,
    address: '222 Ocean Blvd, San Diego, CA',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    coordinates: { lat: 32.7157, lng: -117.1611 },
    description: 'Luxurious beachfront condo with direct access to the sand and breathtaking ocean views.'
  },
  {
    id: '6',
    title: 'Chic Studio Loft',
    type: 'rent',
    price: 1800,
    address: '333 Artist Ln, San Francisco, CA',
    imageUrl: 'https://picsum.photos/400/300?random=6',
    bedrooms: 1,
    bathrooms: 1,
    area: 750,
    coordinates: { lat: 37.7749, lng: -122.4194 },
    description: 'A stylish studio loft in a vibrant neighborhood, featuring high ceilings and industrial-chic design.'
  }
];
