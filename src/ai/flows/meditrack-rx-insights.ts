'use server';
/**
 * @fileOverview AI flow for generating insights on MeditrackRx data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Patient, Medicine, Prescription, Dispensation } from '@/types';
import { googleAI } from '@genkit-ai/googleai';

// Define input and output schemas using Zod, but DO NOT EXPORT them.
const MeditrackRxInsightsInputSchema = z.object({
  patients: z.array(z.any()),
  medicines: z.array(z.any()),
  prescriptions: z.array(z.any()),
  dispensations: z.array(z.any()),
});
export type MeditrackRxInsightsInput = z.infer<typeof MeditrackRxInsightsInputSchema>;

const MeditrackRxInsightsOutputSchema = z.object({
    analysis: z.string().describe('A detailed analysis of the provided data in Markdown format.'),
});
export type MeditrackRxInsightsOutput = z.infer<typeof MeditrackRxInsightsOutputSchema>;


/**
 * Generates insights based on the provided medical data.
 * This is the only function exported from this file.
 */
export async function meditrackRxInsights(input: MeditrackRxInsightsInput): Promise<MeditrackRxInsightsOutput> {
  const prompt = `
    You are a medical data analyst. Your task is to provide a summary and key insights based on the provided data.
    Analyze the data and generate a report in Markdown format.

    The report should include:
    1.  **Общая сводка**: Ключевые метрики (общее количество пациентов, медикаментов, назначений).
    2.  **Анализ потребности в медикаментах**: Определите топ-3 самых востребованных медикамента на основе годовой потребности. Укажите, для скольких пациентов они назначены.
    3.  **Анализ выдач**: Сравните годовую потребность с фактическими выдачами. Укажите медикаменты, по которым наблюдается наибольший дефицит (разница между потребностью и выдачей).
    4.  **Пациенты с высоким риском**: Определите пациентов, у которых есть назначения, но не было ни одной выдачи.
    5.  **Финансовый анализ**: Рассчитайте общую стоимость годовой потребности по всем препаратам.

    Structure the output clearly using Markdown headers, lists, and bold text. Provide concrete numbers and percentages where possible.
    Be concise and clear in your analysis.

    Here is the data:
    - Patients: ${JSON.stringify(input.patients, null, 2)}
    - Medicines: ${JSON.stringify(input.medicines, null, 2)}
    - Prescriptions: ${JSON.stringify(input.prescriptions, null, 2)}
    - Dispensations: ${JSON.stringify(input.dispensations, null, 2)}
  `;

  try {
    console.log("Calling Genkit with model 'gemini-1.5-flash-latest'...");
    
    const { output } = await ai.generate({
      model: googleAI('gemini-1.5-flash-latest'),
      prompt: prompt,
      output: {
        format: 'json',
        schema: MeditrackRxInsightsOutputSchema,
      },
      config: {
        temperature: 0.3,
      },
    });

    if (!output) {
        throw new Error("AI model returned no output.");
    }
    
    return output;

  } catch (e: any) {
    console.error(`AI generation failed: ${e.message}`);
    throw new Error(`AI generation failed: ${e.message}`);
  }
}
