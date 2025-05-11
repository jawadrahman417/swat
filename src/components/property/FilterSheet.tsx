
'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AppliedFilters, Feature } from '@/lib/types';
import { ALL_FEATURES, initialFilters as globalInitialFilters } from '@/lib/types';
import { Separator } from '../ui/separator';
import { FilterXIcon, RotateCcwIcon } from 'lucide-react';

interface FilterSheetProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onApplyFilters: (filters: AppliedFilters) => void;
  currentFilters: AppliedFilters;
}

export default function FilterSheet({ open, onOpenChange, onApplyFilters, currentFilters }: FilterSheetProps) {
  const [sheetFilters, setSheetFilters] = useState<AppliedFilters>(currentFilters);

  const handleInputChange = (field: keyof AppliedFilters, value: string | boolean | Feature[]) => {
    setSheetFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (feature: Feature, checked: boolean) => {
    setSheetFilters(prev => {
      const updatedFeatures = checked
        ? [...prev.selectedFeatures, feature]
        : prev.selectedFeatures.filter(f => f !== feature);
      return { ...prev, selectedFeatures: updatedFeatures };
    });
  };

  const handleApply = () => {
    onApplyFilters(sheetFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    setSheetFilters(globalInitialFilters);
    onApplyFilters(globalInitialFilters); // Optionally apply cleared filters immediately
  };
  
  // Sync sheetFilters with currentFilters when sheet opens or currentFilters change
  useState(() => {
    setSheetFilters(currentFilters);
  });


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-2xl">Filter Properties</SheetTitle>
          <SheetDescription>
            Refine your search based on your preferences.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Price Range ($)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="minPrice">Min Price</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="Any"
                    value={sheetFilters.minPrice}
                    onChange={e => handleInputChange('minPrice', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="Any"
                    value={sheetFilters.maxPrice}
                    onChange={e => handleInputChange('maxPrice', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Listing Type */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Listing Type</h3>
              <RadioGroup
                value={sheetFilters.listingType}
                onValueChange={(value: 'sale' | 'rent' | 'any') => handleInputChange('listingType', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="type-any" />
                  <Label htmlFor="type-any">Any</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sale" id="type-sale" />
                  <Label htmlFor="type-sale">For Sale</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rent" id="type-rent" />
                  <Label htmlFor="type-rent">For Rent</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />

            {/* Property Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Property Details</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor="bedrooms">Min. Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="Any"
                    value={sheetFilters.bedrooms}
                    onChange={e => handleInputChange('bedrooms', e.target.value)}
                    min="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Min. Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="Any"
                    value={sheetFilters.bathrooms}
                    onChange={e => handleInputChange('bathrooms', e.target.value)}
                    min="0"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="garage"
                  checked={sheetFilters.garage}
                  onCheckedChange={checked => handleInputChange('garage', Boolean(checked))}
                />
                <Label htmlFor="garage">Has Garage</Label>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Features & Amenities</h3>
              <div className="space-y-2 grid grid-cols-2 gap-x-4 gap-y-2">
                {ALL_FEATURES.map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature.replace(/\s+/g, '-')}`}
                      checked={sheetFilters.selectedFeatures.includes(feature)}
                      onCheckedChange={checked => handleFeatureChange(feature, Boolean(checked))}
                    />
                    <Label htmlFor={`feature-${feature.replace(/\s+/g, '-')}`}>{feature}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            
            {/* Other Filters */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Other Options</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                        id="negotiable"
                        checked={sheetFilters.negotiable}
                        onCheckedChange={checked => handleInputChange('negotiable', Boolean(checked))}
                        />
                        <Label htmlFor="negotiable">Price is Negotiable</Label>
                    </div>

                    <div>
                        <Label className="block mb-1.5 text-sm font-medium">Accessibility</Label>
                        <RadioGroup
                            value={sheetFilters.accessibility}
                            onValueChange={(value: 'vehicle' | 'narrow_way' | 'any') => handleInputChange('accessibility', value)}
                            className="flex space-x-4"
                        >
                            <div className="flex items-center space-x-2">
                            <RadioGroupItem value="any" id="access-any" />
                            <Label htmlFor="access-any">Any</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vehicle" id="access-vehicle" />
                            <Label htmlFor="access-vehicle">Vehicle</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                            <RadioGroupItem value="narrow_way" id="access-narrow" />
                            <Label htmlFor="access-narrow">Narrow Way</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    
                    <div>
                        <Label className="block mb-1.5 text-sm font-medium">Utilities</Label>
                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                                id="water"
                                checked={sheetFilters.water}
                                onCheckedChange={checked => handleInputChange('water', Boolean(checked))}
                            />
                            <Label htmlFor="water">Water Available</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="electricity"
                                checked={sheetFilters.electricity}
                                onCheckedChange={checked => handleInputChange('electricity', Boolean(checked))}
                            />
                            <Label htmlFor="electricity">Electricity Available</Label>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </ScrollArea>
        <SheetFooter className="px-6 pb-6 pt-4 border-t">
          <Button onClick={handleClear} variant="outline" className="w-full sm:w-auto">
            <RotateCcwIcon className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
          <SheetClose asChild>
            <Button onClick={handleApply} className="w-full sm:w-auto">
             <FilterXIcon className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
