'use server';
/**
 * @fileoverview This file initializes the Genkit AI instance with necessary plugins.
 * It configures Genkit to use Google AI services and sets up the environment
 * for defining and running generative AI flows.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This setup allows the application to use Google's generative models,
// such as Gemini, for various AI-powered tasks. The API key is
// automatically sourced from the GEMINI_API_KEY environment variable.
export const ai = genkit({
  plugins: [googleAI()],
});
