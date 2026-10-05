import { GoogleGenAI } from '@google/genai';

/**
 * Safely initializes Google Gen AI instance with fallback for build-time safety
 * and environment variable guards.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export const ai: GoogleGenAI | null = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function getGeminiClient(): GoogleGenAI | null {
  const currentKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  if (!currentKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey: currentKey });
}

export async function generateContentSafe(prompt: string, modelName = 'gemini-2.5-flash'): Promise<string | null> {
  try {
    const client = getGeminiClient();
    if (!client) {
      return null;
    }
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt
    });
    return response.text || null;
  } catch (error) {
    console.warn('Gemini API call failed gracefully:', error);
    return null;
  }
}
