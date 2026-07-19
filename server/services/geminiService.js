import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Lazy initialization so the app doesn't crash on boot if the key is missing (handled at runtime)
let aiClient = null;
const getAiClient = () => {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
};

/**
 * Sends raw quiz text to Gemini to convert into structured JSON.
 * @param {string} rawText - Unstructured text input from the user.
 * @param {number} retryCount - Number of times to retry if JSON parsing fails.
 * @returns {Promise<Array>} List of question objects
 */
export const generateQuizFromText = async (rawText, retryCount = 3) => {
  const client = getAiClient();

  const prompt = `
You are an expert quiz generator. Your task is to extract multiple-choice questions from the provided text and structure them as a valid JSON array of objects.

Each question object MUST strictly follow this JSON schema:
{
  "question": "The question text, clean and trimmed",
  "optionA": "Option A text",
  "optionB": "Option B text",
  "optionC": "Option C text",
  "optionD": "Option D text",
  "correctAnswer": "A, B, C, or D"
}

Rules:
1. Identify up to 60 questions from the text.
2. Provide exactly 4 options (A, B, C, D) for each question.
3. Determine the correct answer, which must be exactly one of the characters: "A", "B", "C", "D". If the correct answer is not explicitly mentioned, infer it logically or choose the best option.
4. Output ONLY the JSON array. Do not include markdown code block syntax (like \`\`\`json or \`\`\`), no explanations, no HTML, and no pre/post-text. The response must be immediately parseable by JSON.parse.

Unstructured Input Text:
${rawText}
`;

  let attempt = 0;
  while (attempt < retryCount) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error('Empty response received from Gemini API.');
      }

      // Precautionary sanitization of markdown fences if Gemini ignored the format instructions
      let cleanedText = text;
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```$/, '');
      }
      cleanedText = cleanedText.trim();

      const questions = JSON.parse(cleanedText);

      if (!Array.isArray(questions)) {
        throw new Error('Response parsed successfully, but it is not a JSON array.');
      }

      return questions;
    } catch (error) {
      attempt++;
      console.warn(`[Gemini Parse Warning] Attempt ${attempt} failed: ${error.message}`);
      if (attempt >= retryCount) {
        throw new Error(`Failed to generate valid quiz JSON after ${retryCount} attempts. Last error: ${error.message}`);
      }
    }
  }
};
