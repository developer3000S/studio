'use server';
/**
 * @fileOverview A medical insights AI agent.
 *
 * - meditrackRxInsights - A function that handles the medical insights generation process.
 * - MeditrackRxInsightsInput - The input type for the meditrackRxInsights function.
 * - MeditrackRxInsightsOutput - The return type for the meditrackRxInsights function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import type { Patient, Medicine, Prescription, Dispensation } from "@/types";

const MeditrackRxInsightsInputSchema = z.object({
  patients: z.array(z.any()),
  medicines: z.array(z.any()),
  prescriptions: z.array(z.any()),
  dispensations: z.array(z.any()),
});
export type MeditrackRxInsightsInput = z.infer<typeof MeditrackRxInsightsInputSchema>;

const MeditrackRxInsightsOutputSchema = z.object({
  analysis: z.string().describe('The detailed analysis in Markdown format.'),
});
export type MeditrackRxInsightsOutput = z.infer<typeof MeditrackRxInsightsOutputSchema>;

export async function meditrackRxInsights(input: MeditrackRxInsightsInput): Promise<MeditrackRxInsightsOutput> {
  const model = googleAI('gemini-1.5-flash');

  const prompt = `You are a medical data analyst. Your task is to analyze the provided data and generate a comprehensive report in Markdown format.

The data includes:
1.  **Patients**: Information about patients, their diagnosis, and doctors.
2.  **Medicines**: A catalog of available medications.
3.  **Prescriptions**: Which medicines are prescribed to which patients, including dosages.
4.  **Dispensations**: Records of when medicines were given to patients.

Your analysis should cover the following points:
*   **Overall Summary**: A brief overview of the data.
*   **Patient Demographics**: Analyze patient distribution by diagnosis or doctor.
*   **Medication Usage**: Identify the most frequently prescribed medications.
*   **Dispensation Patterns**: Analyze dispensation frequency and identify any potential gaps or issues.
*   **Financials**: Briefly touch upon the total cost of consumed medications based on dispensation data.
*   **Recommendations**: Provide actionable recommendations based on your findings (e.g., "Consider reviewing prescriptions for Patient X", "Stock up on Medicine Y").

Here is the data:
- Patients: ${JSON.stringify(input.patients, null, 2)}
- Medicines: ${JSON.stringify(input.medicines, null, 2)}
- Prescriptions: ${JSON.stringify(input.prescriptions, null, 2)}
- Dispensations: ${JSON.stringify(input.dispensations, null, 2)}

Generate a detailed report.
`;

  try {
    const { output } = await ai.generate({
      model: model,
      prompt: prompt,
      output: {
        schema: MeditrackRxInsightsOutputSchema,
      },
    });
    return output!;
  } catch (e: any) {
     console.error(`AI generation failed: ${e.message}`);
     throw new Error(`AI generation failed: ${e.message}`);
  }
}
