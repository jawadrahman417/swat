// PropertyUploadForm.tsx
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
import { Loader2, CheckCircle, XCircle, MapPin, UploadCloud, Image as ImageIcon, Film, MessageSquare } from "lucide-react";
import Image from "next/image";
import ChatInterface from "@/components/chat/ChatInterface"; // Import ChatInterface

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
            {/* Other Fields */}
            <Button type="submit" className="w-full text-lg py-3" variant="default" disabled={isSubmitting || isLocValidating || !locValidationResult?.isValidLocation}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
              List Property
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
