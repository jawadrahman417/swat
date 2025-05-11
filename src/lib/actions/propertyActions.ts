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
    console.log("[propertyActions] Attempting to validate location with AI for coordinates:", validatedData.latitude, validatedData.longitude);
    
    const result = await validateLocation(validatedData);
    console.log("[propertyActions] AI Location validation result:", result);
    return result;
  } catch (error) {
    // Log the full error object for better server-side debugging
    console.error("Detailed error in handleValidateLocation propertyAction:", error); 

    let userFriendlyMessage = "An unexpected error occurred during location validation.";
    if (error instanceof z.ZodError) {
      userFriendlyMessage = `Invalid input data: ${error.errors.map(e => e.message).join(', ')}`;
    } else if (error instanceof Error) {
        userFriendlyMessage = `Validation server error: ${error.message}`;
        // Check for common API key issues specifically from the error message
        const lowerCaseErrorMessage = error.message.toLowerCase();
        if (lowerCaseErrorMessage.includes('api key') || 
            lowerCaseErrorMessage.includes('permission denied') ||
            lowerCaseErrorMessage.includes('quota') ||
            lowerCaseErrorMessage.includes('access denied')) {
            userFriendlyMessage = "AI service error: Could not validate location. This might be due to an API key issue, insufficient permissions, or exceeding usage quotas. Please check server logs and your AI service configuration.";
            console.error("AI Service Configuration Alert: Possible API key, permission, or quota issue detected in propertyActions. Full error message:", error.message);
        }
    }
    
    // Re-throw the error to be caught by the client-side calling function,
    // which should then display a toast or user message.
    // If this throw results in a generic "Internal Server Error" page in the browser,
    // it means the error is happening at a level Next.js handles opaquely,
    // often due to fundamental setup/environment issues (like missing .env variables server-side).
    if (error instanceof z.ZodError) {
        throw new Error(userFriendlyMessage); // Throw a new error with a potentially more user-friendly message
    }
    if (error instanceof Error) {
        // Re-throw the modified message if it's more specific, otherwise original
        throw new Error(userFriendlyMessage !== `Validation server error: ${error.message}` ? userFriendlyMessage : error.message);
    }
    throw new Error(userFriendlyMessage); // Throw a new error for unknown error types
  }
}
