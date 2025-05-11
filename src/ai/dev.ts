import { config } from 'dotenv';

// Load .env.local first, then .env as fallback
config({ path: '.env.local' });
config(); // Default .env

import '@/ai/flows/validate-location.ts';
