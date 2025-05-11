'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, type ChangeEvent } from "react";
import { handleValidateLocation } from "@/lib/actions/propertyActions";
import type { ValidateLocationOutput } from "@/ai/flows/validate-location";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, MapPin, UploadCloud, Image as ImageIcon, Film } from "lucide-react";
import Image from "next/image";

const propertyUploadSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  type: z.enum(["sale", "rent"], { required_error: "You need to select a property type." }),
  address: z.string().min(5, "Address is required."),
  latitude: z.coerce.number().min(-90).max(90, "Latitude must be between -90 and 90."),
  longitude: z.coerce.number().min(-180).max(180, "Longitude must be between -180 and 180."),
  photo: z.any().refine(file => file instanceof File, "Photo is required."),
  videoClip: z.any().optional(), // For short clip feature
});

type PropertyUploadFormValues = z.infer<typeof propertyUploadSchema>;

export default function PropertyUploadForm() {
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLocValidating, setIsLocValidating] = useState(false);
  const [locValidationResult, setLocValidationResult] = useState<ValidateLocationOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyUploadFormValues>({
    resolver: zodResolver(propertyUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      address: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        // Reset location validation when photo changes
        setLocValidationResult(null); 
      };
      reader.readAsDataURL(file);
      form.setValue("photo", file); // Update RHF state
    }
  };

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
      form.setValue("videoClip", file);
    }
  };

  const onValidateLocation = async () => {
    const lat = form.getValues("latitude");
    const lng = form.getValues("longitude");

    if (!photoPreview || !photoFile) {
      toast({ title: "Photo Required", description: "Please upload a photo before validating location.", variant: "destructive" });
      return;
    }
    if (lat === undefined || lng === undefined) {
      toast({ title: "Coordinates Required", description: "Please enter latitude and longitude.", variant: "destructive" });
      return;
    }

    setIsLocValidating(true);
    setLocValidationResult(null);
    try {
      const result = await handleValidateLocation({
        latitude: lat,
        longitude: lng,
        photoDataUri: photoPreview, // photoPreview is already a data URI
      });
      setLocValidationResult(result);
      toast({
        title: result.isValidLocation ? "Location Validated" : "Location Validation Issue",
        description: result.formattedAddress || (result.isValidLocation ? "Address confirmed." : "Could not confirm address."),
        variant: result.isValidLocation ? "default" : "destructive",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Validation request failed.";
      setLocValidationResult({ isValidLocation: false, formattedAddress: `Error: ${errorMessage}` });
      toast({ title: "Validation Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLocValidating(false);
    }
  };

  async function onSubmit(values: PropertyUploadFormValues) {
    if (!locValidationResult?.isValidLocation) {
      toast({ title: "Location Not Validated", description: "Please validate the location before submitting.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    console.log("Form submitted:", { ...values, photo: photoFile?.name, video: values.videoClip?.name, locationValidation: locValidationResult });
    // Actual submission logic (e.g., FormData to backend)
    // For now, simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    toast({ title: "Property Listed!", description: `${values.title} has been successfully listed.`});
    form.reset();
    setPhotoPreview(null);
    setPhotoFile(null);
    setVideoPreview(null);
    setLocValidationResult(null);
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">List a New Property</CardTitle>
        <CardDescription>Fill in the details below to put your property on PropSwap.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Beautiful 3-Bedroom Family Home" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Tell us more about your property..." {...field} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 250000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl><Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Card className="p-4 bg-secondary/30">
                <FormLabel className="text-base font-semibold flex items-center mb-2"><MapPin className="mr-2 h-5 w-5 text-primary"/> Location Coordinates & Validation</FormLabel>
                <FormDescription className="mb-4">Provide coordinates and upload a photo to validate the property's location.</FormDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <FormField control={form.control} name="latitude" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl><Input type="number" step="any" placeholder="e.g., 34.0522" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="longitude" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl><Input type="number" step="any" placeholder="e.g., -118.2437" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => ( // field is not directly used for input type="file" control here
                    <FormItem>
                      <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> Property Photo (for validation & listing)</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" onChange={handlePhotoChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                      </FormControl>
                      {photoPreview && <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border"><Image src={photoPreview} alt="Photo preview" layout="fill" objectFit="cover" data-ai-hint="property photo"/></div>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" onClick={onValidateLocation} disabled={isLocValidating || !photoPreview} className="w-full mt-4" variant="outline">
                    {isLocValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Validate Location with Photo
                </Button>
                {locValidationResult && (
                    <div className={`mt-4 p-3 rounded-md text-sm flex items-center ${locValidationResult.isValidLocation ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {locValidationResult.isValidLocation ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                    <span>{locValidationResult.formattedAddress || (locValidationResult.isValidLocation ? 'Location successfully validated.' : 'Location validation failed.')}</span>
                    </div>
                )}
            </Card>

            <FormField
              control={form.control}
              name="videoClip"
              render={({ field }) => ( // field not directly used
                <FormItem>
                  <FormLabel className="flex items-center"><Film className="mr-2 h-5 w-5 text-primary"/> Short Video Clip (Optional)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="video/*" onChange={handleVideoChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                  </FormControl>
                  {videoPreview && <div className="mt-2"><video src={videoPreview} controls className="w-full max-h-60 rounded" data-ai-hint="property video"></video></div>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full text-lg py-3" variant="accent" disabled={isSubmitting || isLocValidating || !locValidationResult?.isValidLocation}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
              List Property
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
