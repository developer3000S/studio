'use server';

/**
 * @fileOverview AI-powered tool that provides a summary of current stock and requirements.
 *
 * - meditrackRxInsights - A function that handles the stock and requirements process.
 * - MeditrackRxInsightsInput - The input type for the meditrackRxInsights function.
 * - MeditrackRxInsightsOutput - The return type for the meditrackRxInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const MeditrackRxInsightsInputSchema = z.object({
  patientData: z.string().describe('Patient data in CSV format.'),
  medicineData: z.string().describe('Medicine data in CSV format.'),
  prescriptionData: z.string().describe('Prescription data in CSV format.'),
  dispensationData: z.string().describe('Dispensation data in CSV format.'),
});
export type MeditrackRxInsightsInput = z.infer<typeof MeditrackRxInsightsInputSchema>;

const MeditrackRxInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of current stock and requirements.'),
});
export type MeditrackRxInsightsOutput = z.infer<typeof MeditrackRxInsightsOutputSchema>;

export async function meditrackRxInsights(input: MeditrackRxInsightsInput): Promise<MeditrackRxInsightsOutput> {
  try {
    const result = await meditrackRxInsightsFlow(input);
    return result;
  } catch(e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    throw new Error(`AI generation failed in meditrackRxInsights flow: ${errorMessage}`);
  }
}

const meditrackRxInsightsFlow = ai.defineFlow(
  {
    name: 'meditrackRxInsightsFlow',
    inputSchema: MeditrackRxInsightsInputSchema,
    outputSchema: MeditrackRxInsightsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
        model: googleAI('gemini-1.5-flash'),
        output: { schema: MeditrackRxInsightsOutputSchema },
        prompt: `You are a medical inventory management expert.

        Based on the patient data, medicine data, prescription data, and dispensation data, provide a summary of the current stock and requirements for the medicines.

        Provide a brief, insightful summary.

        Patient Data:
        ${input.patientData}

        Medicine Data:
        ${input.medicineData}

        Prescription Data:
        ${input.prescriptionData}

        Dispensation Data:
        ${input.dispensationData}

        Summary:`,
      });
      return output!;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`AI generation failed in meditrackRxInsightsFlow: ${errorMessage}`);
    }
  }
);
