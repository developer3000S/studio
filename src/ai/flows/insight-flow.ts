/**
 * @fileOverview Flow for generating medical data insights.
 *
 * This file defines a Genkit flow that analyzes medical data (patients,
 * medicines, prescriptions, dispensations) to generate analytical reports.
 * The flow uses a structured input schema and leverages a generative AI model
 * to produce insights in Russian Markdown format.
 *
 * - generateInsights: The main function that executes the insight generation flow.
 * - InsightInputSchema: The Zod schema for the input data.
 * - InsightInput: The TypeScript type for the input data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import type { Patient, Medicine, Prescription, Dispensation } from '@/types';

// Zod schema for the input data, ensuring type safety and validation.
export const InsightInputSchema = z.object({
  patients: z.array(z.any()).describe('List of patients'),
  medicines: z.array(z.any()).describe('List of medicines'),
  prescriptions: z.array(z.any()).describe('List of prescriptions'),
  dispensations: z.array(z.any()).describe('List of dispensations'),
});

// TypeScript type inferred from the Zod schema.
export type InsightInput = z.infer<typeof InsightInputSchema>;

// The main exported function that clients will call.
// It takes the structured data and passes it to the Genkit flow.
export async function generateInsights(input: InsightInput): Promise<string> {
  const {output} = await insightFlow(input);
  return output || 'Не удалось сгенерировать отчет.';
}

// Define the prompt for the AI model.
// This prompt instructs the model to act as a medical data analyst,
// specifies the output format (Russian Markdown), and provides placeholders
// for the data that will be injected.
const insightPrompt = ai.definePrompt({
  name: 'insightPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  input: {
    schema: InsightInputSchema,
  },
  prompt: `
    You are an expert medical data analyst. Analyze the following data from a medication tracking system and provide a concise, insightful report in Markdown format. The report must be in Russian.

    Data:
    - Patients: {{{json patients}}}
    - Medicines: {{{json medicines}}}
    - Prescriptions: {{{json prescriptions}}}
    - Dispensations: {{{json dispensations}}}

    Your report should highlight key trends, potential issues (like medication shortages or adherence problems), and provide actionable recommendations. Focus on clarity and data-driven conclusions.
  `,
});

// Define the Genkit flow.
// This flow takes the input data, invokes the defined prompt with that data,
// and returns the generated text from the model.
const insightFlow = ai.defineFlow(
  {
    name: 'insightFlow',
    inputSchema: InsightInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const {text} = await insightPrompt(input);
    return text;
  }
);
