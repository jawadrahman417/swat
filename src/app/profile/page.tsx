
// src/app/profile/page.tsx
import PropertyUploadForm from "@/components/property/PropertyUploadForm";
import PropertyCard from "@/components/property/PropertyCard";
import { placeholderProperties } from '@/lib/placeholder-data';
import type { Property } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, PlusSquare } from "lucide-react";

export default function ProfilePage() {
  // For now, let's assume the first 3 placeholder properties are the user's.
  // In a real app, this would come from a user-specific data source.
  const userProperties: Property[] = placeholderProperties.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b">
            <div>
                <h1 className="text-3xl font-bold text-primary flex items-center">
                    <Building className="mr-3 h-8 w-8" /> My Property Portfolio
                </h1>
                <p className="text-muted-foreground mt-1">Manage your listings and add new properties.</p>
            </div>
        </div>

        <Card className="mb-12 bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-primary">
                <PlusSquare className="mr-2 h-6 w-6" /> List a New Property
            </CardTitle>
            <CardDescription>Fill in the details below to add a new property to your portfolio.</CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyUploadForm />
          </CardContent>
        </Card>
        
        <div>
            <h2 className="text-2xl font-semibold text-primary mb-6">My Active Listings ({userProperties.length})</h2>
            {userProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
                ))}
            </div>
            ) : (
            <div className="text-center py-12 bg-card shadow-md rounded-lg">
                <Building className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-medium text-muted-foreground">You haven't listed any properties yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Why not add your first property above?</p>
            </div>
            )}
        </div>
      </section>
    </div>
  );
}
