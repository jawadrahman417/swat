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
import { gemini15Flash } from '@genkit-ai/googleai'; // Import a specific model

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
  console.log('[validateLocation function wrapper] Calling validateLocationFlow.');
  return validateLocationFlow(input);
}

const validateLocationTool = ai.defineTool({
  name: 'getFormattedAddress',
  description: 'Returns the formatted address of a given latitude and longitude. This tool simulates a geocoding service call.',
  inputSchema: z.object({
    latitude: z.number().describe('The latitude of the location.'),
    longitude: z.number().describe('The longitude of the location.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
    // Placeholder implementation: Replace with actual Google Maps API call
    // to get the formatted address from lat/lng.
    console.log('[validateLocationTool] Executing with input:', input);
    // In a real app, this would use Google Geocoding API or similar.
    // For robust demo, ensure this returns a plausible address format.
    return `Formatted Address for (${input.latitude}, ${input.longitude}) (Mock Geocoding Service)`;
  }
);


const validateLocationPrompt = ai.definePrompt({
  name: 'validateLocationPrompt',
  model: gemini15Flash, // Explicitly set the model
  input: {schema: ValidateLocationInputSchema},
  output: {schema: ValidateLocationOutputSchema},
  tools: [validateLocationTool],
  prompt: `You are an expert real estate assistant. The seller has provided a photo of a property and its location (latitude and longitude).
  Your task is to validate if the provided location seems plausible for the property shown in the photo.
  
  1. Use the 'getFormattedAddress' tool to get a formatted address for the given latitude and longitude.
  2. Analyze the content of the photo: {{media url=photoDataUri}}.
  3. Compare the visual information from the photo with the formatted address obtained from the tool.
  4. Determine if the location (address) is a valid and plausible match for what is depicted in the photo. For example, if the photo shows a snowy mountain landscape, an address in a tropical city is not valid. If the photo shows a beach house, an address in a landlocked desert area is not valid.
  
  Return a JSON object with 'isValidLocation' (boolean) and 'formattedAddress' (string from the tool or an error message if the tool failed).
  If the tool provides an address, use that for 'formattedAddress'. If the tool itself fails or returns an error, reflect that error in 'formattedAddress' and set 'isValidLocation' to false.
  
  Example of good reasoning: Photo shows a skyscraper. Tool returns "123 Main St, New York, NY". This is likely valid.
  Example of bad reasoning: Photo shows a desert. Tool returns "456 High Street, London, UK". This is likely invalid.
  `,
   // Added safety settings to be less restrictive for testing, adjust as needed for production
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const validateLocationFlow = ai.defineFlow(
  {
    name: 'validateLocationFlow',
    inputSchema: ValidateLocationInputSchema,
    outputSchema: ValidateLocationOutputSchema,
  },
  async (input): Promise<ValidateLocationOutput> => {
    try {
      console.log('[validateLocationFlow] Starting flow with input for coordinates:', input.latitude, input.longitude);
      const { output, usage } = await validateLocationPrompt(input); // Genkit prompt call
      
      console.log('[validateLocationFlow] AI usage:', usage);

      if (!output) {
        console.error('[validateLocationFlow] validateLocationPrompt did not return an output (null/undefined) for input:', input);
        return {
          isValidLocation: false,
          formattedAddress: "Error: AI model returned no output for location validation. This could be due to content filtering or an issue with the model. Please check server logs for details from the AI service.",
        };
      }
      console.log('[validateLocationFlow] Successfully received output from AI:', output);
      return output;
    } catch (flowError: any) {
      console.error('[validateLocationFlow] Error executing validateLocationPrompt or within flow:', flowError);
      let errorMessage = "An unexpected error occurred during AI location validation.";
      
      if (flowError.message) {
        errorMessage = `AI Error: ${flowError.message}`;
        const lowerCaseErrorMessage = flowError.message.toLowerCase();
         if (lowerCaseErrorMessage.includes('api key') || 
            lowerCaseErrorMessage.includes('permission denied') ||
            lowerCaseErrorMessage.includes('quota') ||
            lowerCaseErrorMessage.includes('access denied') ||
            lowerCaseErrorMessage.includes('api_key_not_valid') ||
            lowerCaseErrorMessage.includes('resource_exhausted') ||
            lowerCaseErrorMessage.includes('billing') ||
            lowerCaseErrorMessage.includes('generative language api is not used') // Specific error for API not enabled
            ) {
            errorMessage = "AI service error: Could not validate location. This may be due to an API key issue, insufficient permissions/billing, API not enabled, or exceeding usage quotas. Please check your server configuration and Google Cloud Project / AI service dashboard.";
            console.error("[validateLocationFlow] Critical AI Service Error. Details:", flowError.message);
        } else if (lowerCaseErrorMessage.includes('deadline_exceeded') || lowerCaseErrorMessage.includes('timeout')) {
            errorMessage = "AI service error: The request timed out. Please try again later.";
        } else if (lowerCaseErrorMessage.includes('content filtered') || lowerCaseErrorMessage.includes('safety settings')) {
            errorMessage = "AI service error: The response was blocked due to safety settings or content filters. The input or output may have violated policy.";
        }
      }
      
      return {
        isValidLocation: false,
        formattedAddress: errorMessage,
      };
    }
  }
);