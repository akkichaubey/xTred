import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";

/**
 * xTred Gemini Client
 *
 * - Models are read from env vars ONLY — never hardcoded per call site.
 * - Structured output mode enforced server-side.
 * - This file is server-only: never imported from client components.
 */

let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
}

/** Heavy synthesis calls — Section 3 full analysis */
export const MODEL_PRO = process.env.GEMINI_MODEL_PRO ?? "gemini-2.5-pro";
/** Fast tasks — news classification, sentiment tagging */
export const MODEL_FLASH = process.env.GEMINI_MODEL_FLASH ?? "gemini-2.5-flash";

/**
 * Generate a structured JSON response from Gemini.
 * Uses native JSON schema mode — no prompt hacks needed.
 */
export async function generateStructured<T>(
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  responseSchema: object,
  config?: Partial<GenerateContentConfig>
): Promise<T> {
  const model = getGenAI().models;

  const response = await model.generateContent({
    model: modelName,
    contents: [
      { role: "user", parts: [{ text: userPrompt }] },
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.2, // low temperature for consistency in financial analysis
      ...config,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response");

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Gemini response was not valid JSON: ${text.slice(0, 200)}`);
  }
}

/**
 * Classify news sentiment — uses Flash model for speed/cost efficiency
 */
export async function classifyNews(headlines: string[]): Promise<
  Array<{
    headline: string;
    classification: string;
    sentiment_score: number;
    impact: string;
  }>
> {
  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        headline: { type: "string" },
        classification: {
          type: "string",
          enum: ["Positive", "Negative", "Neutral", "Rumor", "Confirmed", "Breaking", "Fake"],
        },
        sentiment_score: { type: "number", minimum: -1, maximum: 1 },
        impact: { type: "string", enum: ["High", "Medium", "Low"] },
      },
      required: ["headline", "classification", "sentiment_score", "impact"],
    },
  };

  const prompt = `Classify each of the following crypto news headlines for sentiment and market impact. Return JSON array.\n\n${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}`;

  return generateStructured<
    Array<{
      headline: string;
      classification: string;
      sentiment_score: number;
      impact: string;
    }>
  >(
    MODEL_FLASH,
    "You are a financial news analyst specializing in cryptocurrency markets. Classify news objectively. Never suggest trading actions.",
    prompt,
    schema
  );
}
