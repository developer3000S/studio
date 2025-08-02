'use server';
/**
 * @fileOverview An AI flow for generating insights from medical data.
 *
 * - meditrackRxInsights - A function that handles the medical data analysis.
 * - MeditrackRxInsightsInput - The input type for the meditrackRxInsights function.
 * - MeditrackRxInsightsOutput - The return type for the meditrackRxInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const PatientSchema = z.object({
  id: z.number(),
  fio: z.string(),
  birthYear: z.number(),
  diagnosis: z.string(),
  attendingDoctor: z.string(),
});

const MedicineSchema = z.object({
  id: z.number(),
  smmnNodeCode: z.string(),
  section: z.string(),
  standardizedMnn: z.string(),
  tradeNameVk: z.string(),
  standardizedDosageForm: z.string(),
  standardizedDosage: z.string(),
  characteristic: z.string(),
  packaging: z.number(),
  price: z.number(),
});

const PrescriptionSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  medicineId: z.number(),
  dailyDose: z.number(),
  annualRequirement: z.number(),
});

const DispensationSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  medicineId: z.number(),
  dispensationDate: z.string(),
  quantity: z.number(),
});

const MeditrackRxInsightsInputSchema = z.object({
  patients: z.array(PatientSchema),
  medicines: z.array(MedicineSchema),
  prescriptions: z.array(PrescriptionSchema),
  dispensations: z.array(DispensationSchema),
  model: z.string().optional(),
});
export type MeditrackRxInsightsInput = z.infer<typeof MeditrackRxInsightsInputSchema>;

const MeditrackRxInsightsOutputSchema = z.object({
  report: z.string().describe('A detailed report in Markdown format.'),
});
export type MeditrackRxInsightsOutput = z.infer<typeof MeditrackRxInsightsOutputSchema>;

export async function meditrackRxInsights(input: MeditrackRxInsightsInput): Promise<MeditrackRxInsightsOutput> {
  return meditrackRxInsightsFlow(input);
}

const insightsPrompt = ai.definePrompt(
  {
    name: 'meditrackRxInsightsPrompt',
    inputSchema: MeditrackRxInsightsInputSchema,
    outputSchema: MeditrackRxInsightsOutputSchema,
    prompt: `
        You are a medical data analyst. Analyze the following data from a medication tracking system.
        Provide a detailed report in Markdown format.
        
        The report should include:
        1.  A brief summary of the overall data.
        2.  Key insights about patient demographics and diagnoses.
        3.  Analysis of medication usage, including the most prescribed drugs.
        4.  Observations about dispensation patterns.
        5.  Potential issues or areas for improvement, such as patients with high needs or potential stock shortages.
        
        Data:
        - Patients: {{{json patients}}}
        - Medicines: {{{json medicines}}}
        - Prescriptions: {{{json prescriptions}}}
        - Dispensations: {{{json dispensations}}}
      `,
    config: {
        temperature: 0.5,
    }
  },
);

const meditrackRxInsightsFlow = ai.defineFlow(
  {
    name: 'meditrackRxInsightsFlow',
    inputSchema: MeditrackRxInsightsInputSchema,
    outputSchema: MeditrackRxInsightsOutputSchema,
  },
  async (input) => {
    console.log(`Generating insights with model: ${input.model || 'default'}`);
    
    const { output } = await insightsPrompt(input, { model: googleAI(input.model || 'gemini-1.5-flash') });

    return output!;
  }
);
