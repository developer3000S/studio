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

export const MeditrackRxInsightsInputSchema = z.object({
  patients: z.array(PatientSchema),
  medicines: z.array(MedicineSchema),
  prescriptions: z.array(PrescriptionSchema),
  dispensations: z.array(DispensationSchema),
  model: z.string().optional(),
});
export type MeditrackRxInsightsInput = z.infer<typeof MeditrackRxInsightsInputSchema>;

export const MeditrackRxInsightsOutputSchema = z.object({
  report: z.string().describe('A detailed report in Markdown format.'),
});
export type MeditrackRxInsightsOutput = z.infer<typeof MeditrackRxInsightsOutputSchema>;

export async function meditrackRxInsights(input: MeditrackRxInsightsInput): Promise<MeditrackRxInsightsOutput> {
  const modelToUse = input.model || 'gemini-1.5-flash';
  console.log(`[meditrackRxInsights] Preparing to call ai.generate with model: ${modelToUse}`);
  
  try {
    const { output } = await ai.generate({
      model: googleAI(modelToUse),
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
        - Patients: ${JSON.stringify(input.patients)}
        - Medicines: ${JSON.stringify(input.medicines)}
        - Prescriptions: ${JSON.stringify(input.prescriptions)}
        - Dispensations: ${JSON.stringify(input.dispensations)}
      `,
      output: {
        schema: MeditrackRxInsightsOutputSchema,
      },
      config: {
        temperature: 0.5,
      }
    });

    if (!output) {
      throw new Error("AI failed to generate a report.");
    }
    
    return output;

  } catch (e: any) {
    console.error(`AI generation failed in meditrackRxInsights: ${e.message}`);
    throw new Error(`AI generation failed in meditrackRxInsights: ${e.message}`);
  }
}
