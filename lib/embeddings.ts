import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  // Validate input
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Invalid input: text must be a non-empty string");
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.trim(),
    encoding_format: "float",
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Validate input
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error("Invalid input: texts must be a non-empty array");
  }

  // Filter out invalid texts
  const validTexts = texts.filter(
    (text) => text && typeof text === "string" && text.trim().length > 0
  );

  if (validTexts.length === 0) {
    throw new Error("No valid texts provided for embedding generation");
  }

  // Check if we have too many texts (rough token estimate)
  const totalChars = validTexts.reduce((sum, text) => sum + text.length, 0);
  const estimatedTokens = totalChars / 4; // Rough estimate: 4 chars per token

  if (estimatedTokens > 300000) {
    throw new Error(
      `Too many tokens estimated (${estimatedTokens.toFixed(
        0
      )}). Please reduce batch size.`
    );
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: validTexts,
    encoding_format: "float",
  });

  return response.data.map((item) => item.embedding);
}
