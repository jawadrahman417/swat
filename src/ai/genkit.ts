import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/googleai'; // Import a specific model type for potential use

let googleAiPluginInstance;

if (!process.env.GOOGLE_API_KEY) {
  console.error(
`**********************************************************************************
CRITICAL SERVER ERROR: GOOGLE_API_KEY environment variable is not set.
AI features WILL FAIL.
Please create a .env.local file in the root of your project (or ensure it's set
in your production environment) and add:
GOOGLE_API_KEY=your_actual_google_api_key_here

The application server may not start or function correctly.
**********************************************************************************`
  );
  // Consider throwing an error to halt server startup if this key is absolutely critical
  // throw new Error("CRITICAL: GOOGLE_API_KEY is not set. AI features disabled.");
} else {
  try {
    // Initialize the plugin directly with the key if process.env might be tricky for the plugin
    googleAiPluginInstance = googleAI({ apiKey: process.env.GOOGLE_API_KEY });
  } catch (e: any) {
    console.error("**********************************************************************************");
    console.error("CRITICAL SERVER ERROR: Failed to initialize Google AI plugin for Genkit.");
    console.error("Error details:", e.message);
    console.error("This is often due to an invalid GOOGLE_API_KEY, incorrect Google Cloud Project setup (e.g., Generative Language API not enabled), or network issues.");
    console.error("Please verify your GOOGLE_API_KEY and Google Cloud Project setup.");
    console.error("**********************************************************************************");
    // Consider throwing an error to halt server startup
    // throw new Error("Failed to initialize Google AI plugin. Check GOOGLE_API_KEY and server logs.");
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
This is almost certainly due to a missing or invalid GOOGLE_API_KEY or
Google Cloud project configuration issues.
The application server is running, but AI functionality is severely degraded or non-functional.
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
}
