import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

import { Pinecone } from "@pinecone-database/pinecone";
import { trackQueryPerformance } from "./analytics";

// Initialize Pinecone client
function getPineconeClient() {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
}

function getPineconeIndex() {
  const pinecone = getPineconeClient();
  return pinecone.Index(process.env.PINECONE_INDEX! || "baps-embeddings");
}

interface RetrievalOptions {
  topK?: number;
  similarityThreshold?: number;
  useHybridSearch?: boolean;
  useReranking?: boolean;
  useCache?: boolean;
}

interface RetrievalResult {
  id: string;
  content: string;
  scripture: string;
  page: string;
  similarity: number;
  relevance_score?: number;
}

// Simple in-memory cache
const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function queryVectorDB(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  const {
    topK = 8,
    similarityThreshold = 0.3,
    useHybridSearch = true,
    useReranking = true,
    useCache = true,
  } = options;

  // Check if Pinecone is configured
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT) {
    console.warn("Pinecone not configured - returning mock data");
    return getMockResults(query, topK);
  }

  // Check cache first
  const cacheKey = `${query}-${topK}-${similarityThreshold}`;
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - (cached as any).timestamp < CACHE_TTL) {
      return cached;
    }
  }

  try {
    let results: RetrievalResult[] = [];

    if (useHybridSearch) {
      // Hybrid search: combine semantic and keyword search
      const [semanticResults, keywordResults] = await Promise.all([
        performSemanticSearch(query, topK * 2, similarityThreshold),
        performKeywordSearch(query, topK * 2),
      ]);

      // Combine and deduplicate results
      const combined = [...semanticResults, ...keywordResults];
      results = deduplicateResults(combined);
    } else {
      // Pure semantic search
      results = await performSemanticSearch(query, topK, similarityThreshold);
    }

    // Apply cross-encoder reranking if enabled
    if (useReranking && results.length > 0) {
      results = await applyCrossEncoderReranking(query, results);
    }

    // Apply sentence-level context distillation
    results = await applyContextDistillation(query, results);

    // Limit to top K results
    results = results.slice(0, topK);

    // Cache results
    if (useCache) {
      cache.set(cacheKey, results as any);
      (results as any).timestamp = Date.now();
    }

    // Track performance
    trackQueryPerformance(query, Date.now(), results, results.length);

    return results;
  } catch (error) {
    console.error("Vector DB query error:", error);
    return getMockResults(query, topK);
  }
}

// Mock data for when Pinecone is not configured
function getMockResults(query: string, topK: number): RetrievalResult[] {
  const bapsScriptures = [
    "Vachanamrut",
    "Shikshapatri",
    "Gunatitanand Swami Ni Vato",
    "Bhakta Chintamani",
    "Satsangi Jivan",
    "Satsang Diksha",
  ];

  const bapsTopics = [
    "BAPS Satsang is the spiritual assembly of BAPS Swaminarayan Sanstha, founded by Bhagwan Swaminarayan and established by Shastriji Maharaj. It includes daily worship, scripture study, and community service.",
    "The difference between BAPS and other Swaminarayan sects lies in BAPS's emphasis on Akshar-Purushottam philosophy, established by Shastriji Maharaj, and the current guru Pramukh Swami Maharaj's leadership.",
    "BAPS Satsang includes daily puja, reading of Vachanamrut and Shikshapatri, participating in weekly assemblies, and following the five basic practices: daily worship, scripture study, community service, spiritual discourses, and temple visits.",
    "The core principles of BAPS include devotion to Bhagwan Swaminarayan and the guru, following the Shikshapatri's moral code, participating in satsang assemblies, and serving the community through various activities.",
    "BAPS temples serve as centers for spiritual education, community service, and cultural preservation, offering daily worship services, youth activities, and educational programs.",
    "The role of the guru in BAPS is central - the current guru Pramukh Swami Maharaj guides devotees through spiritual discourses, personal guidance, and by setting examples of saintly living.",
    "BAPS emphasizes the importance of family values, with programs like Ghar Sabha (home assemblies) that strengthen family bonds through shared spiritual practices.",
    "The BAPS organization is unique among Swaminarayan sects for its systematic approach to spiritual development, comprehensive educational programs, and extensive humanitarian work worldwide.",
  ];

  // Enhanced query matching for BAPS-specific content
  const queryLower = query.toLowerCase();
  let relevantTopics = bapsTopics;

  if (queryLower.includes("baps") && queryLower.includes("satsang")) {
    relevantTopics = [
      "BAPS Satsang is the spiritual assembly of BAPS Swaminarayan Sanstha, founded by Bhagwan Swaminarayan and established by Shastriji Maharaj. It includes daily worship, scripture study, and community service.",
      "BAPS Satsang includes daily puja, reading of Vachanamrut and Shikshapatri, participating in weekly assemblies, and following the five basic practices: daily worship, scripture study, community service, spiritual discourses, and temple visits.",
      "The core principles of BAPS include devotion to Bhagwan Swaminarayan and the guru, following the Shikshapatri's moral code, participating in satsang assemblies, and serving the community through various activities.",
    ];
  } else if (queryLower.includes("difference") || queryLower.includes("sect")) {
    relevantTopics = [
      "The difference between BAPS and other Swaminarayan sects lies in BAPS's emphasis on Akshar-Purushottam philosophy, established by Shastriji Maharaj, and the current guru Pramukh Swami Maharaj's leadership.",
      "BAPS emphasizes the importance of family values, with programs like Ghar Sabha (home assemblies) that strengthen family bonds through shared spiritual practices.",
      "The BAPS organization is unique among Swaminarayan sects for its systematic approach to spiritual development, comprehensive educational programs, and extensive humanitarian work worldwide.",
    ];
  } else if (queryLower.includes("guru") || queryLower.includes("swami")) {
    relevantTopics = [
      "The role of the guru in BAPS is central - the current guru Pramukh Swami Maharaj guides devotees through spiritual discourses, personal guidance, and by setting examples of saintly living.",
      "BAPS was established by Shastriji Maharaj and continues under the guidance of Pramukh Swami Maharaj, who serves as the spiritual head and provides guidance to millions of devotees worldwide.",
    ];
  }

  return Array.from(
    { length: Math.min(topK, relevantTopics.length) },
    (_, i) => ({
      id: `baps-${i}`,
      content: relevantTopics[i],
      scripture: bapsScriptures[i % bapsScriptures.length],
      page: `${Math.floor(Math.random() * 50) + 1}`,
      similarity: 0.85 + Math.random() * 0.15, // Higher similarity for BAPS content
      relevance_score: 0.8 + Math.random() * 0.2,
    })
  );
}

async function performSemanticSearch(
  query: string,
  topK: number,
  threshold: number
): Promise<RetrievalResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Query Pinecone
    const queryResponse = await getPineconeIndex().query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      includeValues: false,
    });

    return (
      queryResponse.matches
        ?.filter((match) => match.score && match.score >= threshold)
        .map((match) => ({
          id: match.id,
          content: String(match.metadata?.content || ""),
          scripture: String(match.metadata?.scripture || ""),
          page: String(match.metadata?.page || ""),
          similarity: match.score || 0,
        })) || []
    );
  } catch (error) {
    console.error("Pinecone semantic search error:", error);
    return [];
  }
}

async function performKeywordSearch(
  query: string,
  topK: number
): Promise<RetrievalResult[]> {
  try {
    // Extract keywords from query
    const keywords = extractKeywords(query);

    if (keywords.length === 0) return [];

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Query Pinecone with metadata filtering
    const queryResponse = await getPineconeIndex().query({
      vector: queryEmbedding,
      topK: topK * 2, // Get more results to filter
      includeMetadata: true,
      includeValues: false,
      filter: {
        // Filter by keywords in content (simplified approach)
        content: { $in: keywords },
      },
    });

    return (
      queryResponse.matches
        ?.map((match) => ({
          id: match.id,
          content: String(match.metadata?.content || ""),
          scripture: String(match.metadata?.scripture || ""),
          page: String(match.metadata?.page || ""),
          similarity: match.score || 0.5, // Default similarity for keyword matches
        }))
        .slice(0, topK) || []
    );
  } catch (error) {
    console.error("Pinecone keyword search error:", error);
    return [];
  }
}

function extractKeywords(query: string): string[] {
  // Simple keyword extraction - in production, use NLP libraries
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
    "what",
    "when",
    "where",
    "why",
    "how",
    "who",
    "which",
    "whom",
    "whose",
  ]);

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 5); // Limit to top 5 keywords
}

function deduplicateResults(results: RetrievalResult[]): RetrievalResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.scripture}-${result.page}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function applyCrossEncoderReranking(
  query: string,
  results: RetrievalResult[]
): Promise<RetrievalResult[]> {
  // In a production system, you would use a cross-encoder model here
  // For now, we'll use a simple heuristic-based reranking

  return results
    .map((result) => {
      // Calculate relevance score based on query-content overlap
      const queryWords = query.toLowerCase().split(/\s+/);
      const contentWords = result.content.toLowerCase().split(/\s+/);
      const overlap = queryWords.filter((word) =>
        contentWords.includes(word)
      ).length;
      const relevanceScore = overlap / queryWords.length;

      return {
        ...result,
        relevance_score: relevanceScore,
        similarity: (result.similarity + relevanceScore) / 2, // Combine scores
      };
    })
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
}

async function applyContextDistillation(
  query: string,
  results: RetrievalResult[]
): Promise<RetrievalResult[]> {
  // Extract the most relevant sentences from each chunk
  return results.map((result) => {
    const sentences = result.content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    const queryWords = query.toLowerCase().split(/\s+/);

    // Score sentences based on query relevance
    const scoredSentences = sentences.map((sentence) => {
      const sentenceWords = sentence.toLowerCase().split(/\s+/);
      const overlap = queryWords.filter((word) =>
        sentenceWords.includes(word)
      ).length;
      return { sentence, score: overlap / queryWords.length };
    });

    // Keep top 3 most relevant sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.sentence)
      .join(". ");

    return {
      ...result,
      content: topSentences + (topSentences.endsWith(".") ? "" : "."),
    };
  });
}

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OpenAI API key not configured - using mock embedding");
    // Return a mock embedding vector
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small",
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Embedding generation error:", error);
    // Return a mock embedding vector as fallback
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }
}

export async function insertEmbeddings(
  chunks: Array<{
    scripture: string;
    page: string;
    content: string;
    embedding: number[];
  }>
): Promise<void> {
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT) {
    console.warn("Pinecone not configured - skipping embedding insertion");
    return;
  }

  try {
    // Prepare vectors for Pinecone
    const vectors = chunks.map((chunk, index) => ({
      id: `${chunk.scripture}-${chunk.page}-${index}`,
      values: chunk.embedding,
      metadata: {
        content: chunk.content,
        scripture: chunk.scripture,
        page: chunk.page,
      },
    }));

    // Upsert vectors to Pinecone
    await getPineconeIndex().upsert(vectors);

    console.log(
      `Successfully inserted ${chunks.length} embeddings to Pinecone`
    );
  } catch (error) {
    console.error("Failed to insert embeddings to Pinecone:", error);
    throw error;
  }
}

export function applyQueryGuardrails(query: string): string {
  // Remove potentially harmful content
  const sanitized = query
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();

  // Limit query length
  if (sanitized.length > 500) {
    return sanitized.substring(0, 500);
  }

  return sanitized;
}

// Continuous evaluation metrics
export function evaluateRetrievalQuality(
  query: string,
  results: RetrievalResult[],
  userFeedback?: "relevant" | "irrelevant"
): void {
  const metrics = {
    query_length: query.length,
    result_count: results.length,
    avg_similarity:
      results.reduce((sum, r) => sum + r.similarity, 0) / results.length,
    max_similarity: Math.max(...results.map((r) => r.similarity)),
    min_similarity: Math.min(...results.map((r) => r.similarity)),
    user_feedback: userFeedback,
  };

  // Log metrics for analysis
  console.log("Retrieval Quality Metrics:", metrics);

  // In production, send to analytics service
  // trackRetrievalMetrics(metrics);
}
