import { supabase } from "./supabase";
import { generateEmbedding } from "./embeddings";

export interface ScriptureChunk {
  id: string;
  scripture: string;
  page: string;
  content: string;
  similarity: number;
}

export async function queryVectorDB(
  query: string,
  topK: number = 3
): Promise<ScriptureChunk[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Query the database using the match_documents function
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Lowered from 0.7 to 0.5
      match_count: topK, // Reduced from 5 to 3 for faster results
    });

    if (error) {
      console.error("Error querying vector database:", error);

      // If it's a timeout, try with even lower threshold
      if (error.message?.includes("timeout")) {
        console.log("Timeout detected, trying with lower threshold...");
        const { data: retryData, error: retryError } = await supabase.rpc(
          "match_documents",
          {
            query_embedding: queryEmbedding,
            match_threshold: 0.3,
            match_count: 2,
          }
        );

        if (retryError) {
          console.error("Retry also failed:", retryError);
          return [];
        }

        return retryData || [];
      }

      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in queryVectorDB:", error);
    return [];
  }
}

export async function insertEmbeddings(
  embeddings: Array<{
    scripture: string;
    page: string;
    content: string;
    embedding: number[];
  }>
) {
  try {
    // Generate unique IDs for each embedding
    const embeddingsWithIds = embeddings.map((embedding, index) => ({
      id: `${embedding.scripture}_${embedding.page}_${Date.now()}_${index}`,
      scripture: embedding.scripture,
      page: embedding.page,
      content: embedding.content,
      embedding: embedding.embedding,
    }));

    const { error } = await supabase
      .from("embeddings")
      .insert(embeddingsWithIds);

    if (error) {
      console.error("Error inserting embeddings:", error);
      throw error;
    }

    console.log(`Successfully inserted ${embeddings.length} embeddings`);
  } catch (error) {
    console.error("Error in insertEmbeddings:", error);
    throw error;
  }
}
