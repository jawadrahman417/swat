import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/googleai'; // Import a specific model type for potential use

let googleAiPluginInstance;

if (!process.env.GOOGLE_API_KEY) {
  console.error(
`**********************************************************************************
CRITICAL SERVER ERROR: GOOGLE_API_KEY environment variable is not set in .env.local.
AI features WILL FAIL.
Please create or check your .env.local file in the root of your project and add:
GOOGLE_API_KEY=your_actual_google_api_key_here

The application server may not start or function correctly.
**********************************************************************************`
  );
} else {
  try {
    // Initialize the plugin directly with the key
    googleAiPluginInstance = googleAI({ apiKey: process.env.GOOGLE_API_KEY });
    console.log("Google AI Plugin initialized successfully with GOOGLE_API_KEY.");
  } catch (e: any) {
    console.error("**********************************************************************************");
    console.error("CRITICAL SERVER ERROR: Failed to initialize Google AI plugin for Genkit.");
    console.error("Error details:", e.message);
    console.error("This can be due to an invalid GOOGLE_API_KEY, incorrect Google Cloud Project setup (e.g., Generative Language API not enabled), or network issues.");
    console.error("Please verify your GOOGLE_API_KEY (should start with 'AIza...') and Google Cloud Project setup.");
    console.error("Ensure the 'Generative Language API' is enabled in your Google Cloud project.");
    console.error("**********************************************************************************");
    // googleAiPluginInstance will remain undefined, handled below
  }
}

const pluginsToUse = [];
if (googleAiPluginInstance) {
  pluginsToUse.push(googleAiPluginInstance);
} else {
    console.warn(
`**********************************************************************************
WARNING (Server): Google AI plugin for Genkit could NOT be initialized.
AI features relying on Google AI (like location validation) will NOT work.
This is likely due to a missing/invalid GOOGLE_API_KEY or Google Cloud project
configuration issues (e.g., Generative Language API not enabled).
The application server is running, but AI functionality is severely degraded or non-functional.
Check server logs for CRITICAL ERRORS related to GOOGLE_API_KEY.
**********************************************************************************`
    );
}

export const ai = genkit({
  plugins: pluginsToUse,
  // No default model here. Models should be specified at the point of use (e.g., in definePrompt)
  // This makes dependencies clearer and avoids issues if the googleAI plugin isn't loaded.
});

// Client-side check for Firebase keys (good for developer awareness)
if (typeof window !== 'undefined') { // Only run this check on the client-side
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.warn(
  `**********************************************************************************
  WARNING (Client): One or more NEXT_PUBLIC_FIREBASE_ environment variables are missing.
  Firebase client-side features (like authentication) may not work correctly.
  Ensure these are set in your .env.local file:
  NEXT_PUBLIC_FIREBASE_API_KEY=your_key
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
  **********************************************************************************`
    );
  }

  if (!process.env.NEXT_PUBLIC_MAPS_API_KEY) {
    console.warn(
  `**********************************************************************************
  WARNING (Client): NEXT_PUBLIC_MAPS_API_KEY environment variable is missing.
  Map features may not work correctly. Ensure this is set in your .env.local file.
  **********************************************************************************`
    );
  }
}
