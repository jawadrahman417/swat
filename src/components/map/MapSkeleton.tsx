
// src/components/map/MapSkeleton.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

export default function MapSkeleton() {
  return (
    <Card className="w-full h-[400px] md:h-[500px] flex flex-col shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-6 w-6 text-primary" /> Interactive Property Map
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 rounded-b-md overflow-hidden flex flex-col items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-lg mx-auto bg-primary/10" />
          <Skeleton className="h-4 w-56 mx-auto bg-muted-foreground/10" />
          <Skeleton className="h-4 w-40 mx-auto bg-muted-foreground/10" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading map data, please wait...</p>
        </div>
      </CardContent>
    </Card>
  );
}
