
export const ALL_FEATURES = [
  "Attached Washroom", 
  "Garden", 
  "Balcony", 
  "Swimming Pool", 
  "Gym Access", 
  "Pet Friendly", 
  "Furnished", 
  "Air Conditioning",
  "Security System",
  "Parking"
] as const;
export type Feature = typeof ALL_FEATURES[number];

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
  negotiable: boolean;
  accessibility: 'vehicle' | 'narrow_way' | 'unspecified';
  utilities: {
    water: boolean;
    electricity: boolean;
  };
  garage: boolean;
  features: Feature[]; // List of features like "Attached Washroom", "Garden"
}

export interface AppliedFilters {
  minPrice: string; // Stored as string from input, convert to number for filtering
  maxPrice: string; // Stored as string from input
  listingType: 'sale' | 'rent' | 'any';
  bedrooms: string; // Stored as string, min number of bedrooms
  bathrooms: string; // Stored as string, min number of bathrooms
  garage: boolean; // If true, property must have a garage
  selectedFeatures: Feature[]; // Property must have all selected features
  negotiable: boolean; // If true, property must be negotiable
  accessibility: 'vehicle' | 'narrow_way' | 'any';
  water: boolean; // If true, property must have water utility
  electricity: boolean; // If true, property must have electricity utility
  location: string; // Added location filter
}

export const initialFilters: AppliedFilters = {
  minPrice: '',
  maxPrice: '',
  listingType: 'any',
  bedrooms: '',
  bathrooms: '',
  garage: false,
  selectedFeatures: [],
  negotiable: false,
  accessibility: 'any',
  water: false,
  electricity: false,
  location: '', // Initialize location filter
};

