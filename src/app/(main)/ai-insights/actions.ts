'use server';
import { generateInsights } from "@/ai/flows/insight-flow";
import type { Patient, Medicine, Prescription, Dispensation } from '@/types';

interface ActionInput {
    patients: Patient[];
    medicines: Medicine[];
    prescriptions: Prescription[];
    dispensations: Dispensation[];
}

export async function generateInsightsAction(input: ActionInput) {
    return await generateInsights(input);
}
