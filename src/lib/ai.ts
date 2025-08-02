'use server';
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getGenerativeModel(modelName: string) {
    return genAI.getGenerativeModel({ model: modelName });
}
