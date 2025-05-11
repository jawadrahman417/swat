'use server';
import { validateLocation, type ValidateLocationInput, type ValidateLocationOutput } from '@/ai/flows/validate-location';
import { z } from 'zod';

// Re-define or import input schema if needed for server-side validation prior to calling AI flow
const ServerValidateLocationInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  photoDataUri: z.string().refine(val => val.startsWith('data:image/') && val.includes(';base64,'), {
    message: "Invalid photo data URI format. Expected 'data:image/<type>;base64,<data>'."
  }),
});


export async function handleValidateLocation(data: ValidateLocationInput): Promise<ValidateLocationOutput> {
  try {
    // Optional: Validate input again on server-side if desired, though AI flow also has schema
    const validatedData = ServerValidateLocationInputSchema.parse(data);
    
    const result = await validateLocation(validatedData);
    return result;
  } catch (error) {
    console.error("Error validating location:", error);
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors specifically
      // For simplicity, just re-throwing a generic error message, but you could format Zod errors
      throw new Error(`Invalid input data: ${error.errors.map(e => e.message).join(', ')}`);
    }
    if (error instanceof Error) {
        throw new Error(`Validation failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred during location validation.');
  }
}
