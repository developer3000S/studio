'use server';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Patient, Medicine, Prescription, Dispensation } from '@/types';

// Ensure the API key is set
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables. Please add it to the .env file.');
}

// 1. Create a new instance of the GoogleGenerativeAI class
const genAI = new GoogleGenerativeAI(apiKey);

interface InsightsInput {
    patients: Patient[];
    medicines: Medicine[];
    prescriptions: Prescription[];
    dispensations: Dispensation[];
}

export async function generateInsights(input: InsightsInput): Promise<string> {
  try {
    // 2. Get the generative model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert medical data analyst. Analyze the following data from a medication tracking system and provide a concise, insightful report in Markdown format. The report must be in Russian.

      Data:
      - Patients: ${JSON.stringify(input.patients, null, 2)}
      - Medicines: ${JSON.stringify(input.medicines, null, 2)}
      - Prescriptions: ${JSON.stringify(input.prescriptions, null, 2)}
      - Dispensations: ${JSON.stringify(input.dispensations, null, 2)}

      Your report should highlight key trends, potential issues (like medication shortages or adherence problems), and provide actionable recommendations. Focus on clarity and data-driven conclusions.
    `;

    // 3. Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (e: any) {
    console.error('Error generating insights:', e);
    // Provide a more user-friendly error message
    if (e.message.includes('API key not valid')) {
        throw new Error('AI generation failed: The provided API key is not valid. Please check your .env file.');
    }
    throw new Error(`AI generation failed: ${e.message}`);
  }
}
