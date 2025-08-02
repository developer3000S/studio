'use server';

/**
 * @fileOverview A flow to list available AI models.
 * 
 * - listModels - A function that returns a list of available model names.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ListModelsOutputSchema = z.array(z.string());
export type ListModelsOutput = z.infer<typeof ListModelsOutputSchema>;

export async function listModels(): Promise<ListModelsOutput> {
    try {
        const result = await listModelsFlow();
        return result;
    } catch (e) {
        console.error('Error in listModels flow:', e);
        return [];
    }
}

const listModelsFlow = ai.defineFlow(
    {
        name: 'listModelsFlow',
        outputSchema: ListModelsOutputSchema,
    },
    async () => {
        try {
            const models = await ai.listModels();
            return models.map(m => m.name);
        } catch (e) {
            console.error('Error fetching models from AI provider:', e);
            throw new Error('Failed to fetch model list.');
        }
    }
);
