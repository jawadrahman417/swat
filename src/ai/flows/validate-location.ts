//Validate Location On Upload
'use server';

/**
 * @fileOverview Validates the location of a property using Google Maps when the seller uploads photos.
 *
 * - validateLocation - A function that validates the location of the property.
 * - ValidateLocationInput - The input type for the validateLocation function.
 * - ValidateLocationOutput - The return type for the validateLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateLocationInputSchema = z.object({
  latitude: z.number().describe('The latitude of the property.'),
  longitude: z.number().describe('The longitude of the property.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the property, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type ValidateLocationInput = z.infer<typeof ValidateLocationInputSchema>;

const ValidateLocationOutputSchema = z.object({
  isValidLocation: z.boolean().describe('Whether the location is valid or not.'),
  formattedAddress: z.string().describe('The formatted address of the location or an error message.'),
});

export type ValidateLocationOutput = z.infer<typeof ValidateLocationOutputSchema>;

export async function validateLocation(input: ValidateLocationInput): Promise<ValidateLocationOutput> {
  return validateLocationFlow(input);
}

const validateLocationTool = ai.defineTool({
  name: 'getFormattedAddress',
  description: 'Returns the formatted address of a given latitude and longitude using Google Maps.',
  inputSchema: z.object({
    latitude: z.number().describe('The latitude of the location.'),
    longitude: z.number().describe('The longitude of the location.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
    // Placeholder implementation: Replace with actual Google Maps API call
    // to get the formatted address from lat/lng.
    // In a real application, you would use a geocoding service like
    // Google Maps Geocoding API to convert lat/lng to an address.
    // For demonstration purposes, we'll just return a formatted string.
    return `Formatted Address for: ${input.latitude}, ${input.longitude}`;
  }
);


const validateLocationPrompt = ai.definePrompt({
  name: 'validateLocationPrompt',
  input: {schema: ValidateLocationInputSchema},
  output: {schema: ValidateLocationOutputSchema},
  tools: [validateLocationTool],
  prompt: `You are an expert real estate assistant. The seller uploads a photo and the location (latitude and longitude).
  Use the getFormattedAddress tool to validate the location.
  Based on the photo: {{media url=photoDataUri}} and formatted address, determine if the location is valid.
  Return a JSON object in the following format:
  {
    "isValidLocation": true/false,
    "formattedAddress": "the formatted address"
  }`,
});

const validateLocationFlow = ai.defineFlow(
  {
    name: 'validateLocationFlow',
    inputSchema: ValidateLocationInputSchema,
    outputSchema: ValidateLocationOutputSchema,
  },
  async (input): Promise<ValidateLocationOutput> => {
    try {
      const { output } = await validateLocationPrompt(input);
      if (!output) {
        console.error('validateLocationPrompt did not return an output (null/undefined) for input:', input);
        return {
          isValidLocation: false,
          formattedAddress: "Error: AI model returned no output for location validation."
        };
      }
      return output;
    } catch (flowError) {
      console.error('Error executing validateLocationPrompt in flow:', flowError);
      let errorMessage = "An unexpected error occurred during AI location validation.";
      if (flowError instanceof Error) {
        errorMessage = `AI Error: ${flowError.message}`;
        if (flowError.message.toLowerCase().includes('api key not valid') || flowError.message.toLowerCase().includes('permission denied')) {
            errorMessage = "AI Error: The API key for the AI service might be invalid or missing permissions. Please check your server configuration.";
        }
      }
      return {
        isValidLocation: false,
        formattedAddress: errorMessage,
      };
    }
  }
);
