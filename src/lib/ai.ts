'use server';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import type { Patient, Medicine, Prescription, Dispensation } from '@/types';

// Ensure the API key is set
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables');
}

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

interface InsightsInput {
    patients: Patient[];
    medicines: Medicine[];
    prescriptions: Prescription[];
    dispensations: Dispensation[];
}

export async function generateInsights(input: InsightsInput): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
    You are an expert medical data analyst. Analyze the following data from a medication tracking system and provide a concise, insightful report in Markdown format.

    Data:
    - Patients: ${JSON.stringify(input.patients, null, 2)}
    - Medicines: ${JSON.stringify(input.medicines, null, 2)}
    - Prescriptions: ${JSON.stringify(input.prescriptions, null, 2)}
    - Dispensations: ${JSON.stringify(input.dispensations, null, 2)}

    Your report should highlight key trends, potential issues (like medication shortages or adherence problems), and provide actionable recommendations. Focus on clarity and data-driven conclusions.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (e: any) {
    console.error('Error generating insights:', e);
    throw new Error(`AI generation failed: ${e.message}`);
  }
}
