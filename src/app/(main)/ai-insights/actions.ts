'use server';
import { generateInsights } from "@/lib/ai";
import type { Patient, Medicine, Prescription, Dispensation } from '@/types';

interface ActionInput {
    patients: Patient[];
    medicines: Medicine[];
    prescriptions: Prescription[];
    dispensations: Dispensation[];
    useProxy: boolean;
    proxyUrl: string;
}

export async function generateInsightsAction(input: ActionInput) {
    const { useProxy, proxyUrl, ...data } = input;
    
    if (useProxy && !proxyUrl) {
        throw new Error('Proxy is enabled, but the proxy URL is not provided.');
    }

    return await generateInsights({
        ...data,
        proxyUrl: useProxy ? proxyUrl : undefined,
    });
}
