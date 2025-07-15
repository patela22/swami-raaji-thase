import { generateEmbedding } from "../lib/embeddings";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX! || "baps-embeddings"
);

async function debugVectorSearch() {
  console.log("🔍 Debugging vector search step by step...\n");

  const testQuery = "What is BAPS Satsang?";

  try {
    // Step 1: Generate embedding for the query
    console.log("1. Generating query embedding...");
    const queryEmbedding = await generateEmbedding(testQuery);
    console.log(
      `   ✅ Query embedding generated: ${queryEmbedding.length} dimensions`
    );
    console.log(
      `   First 5 values: [${queryEmbedding.slice(0, 5).join(", ")}]`
    );

    // Step 2: Test Pinecone query directly
    console.log("\n2. Testing Pinecone query...");
    const queryResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      includeValues: false,
    });

    console.log(
      `   ✅ Pinecone query returned ${
        queryResponse.matches?.length || 0
      } results`
    );

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log("   Sample results:");
      queryResponse.matches.slice(0, 3).forEach((match, index) => {
        const metadata = match.metadata as any;
        console.log(
          `   ${index + 1}. ${metadata?.scripture || "Unknown"} (Page ${
            metadata?.page || "Unknown"
          }) - Similarity: ${match.score?.toFixed(3) || "N/A"}`
        );
        console.log(
          `      Content: "${(metadata?.content || "").substring(0, 100)}..."`
        );
      });
    } else {
      console.log("   ❌ No results found");
    }

    // Step 3: Test with different topK values
    console.log("\n3. Testing with more results (topK: 10)...");
    const queryResponse2 = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
      includeValues: false,
    });

    console.log(
      `   ✅ Found ${
        queryResponse2.matches?.length || 0
      } results with higher topK`
    );
    if (queryResponse2.matches && queryResponse2.matches.length > 0) {
      console.log("   Sample results:");
      queryResponse2.matches.slice(0, 3).forEach((match, index) => {
        const metadata = match.metadata as any;
        console.log(
          `   ${index + 1}. ${metadata?.scripture || "Unknown"} (Page ${
            metadata?.page || "Unknown"
          }) - Similarity: ${match.score?.toFixed(3) || "N/A"}`
        );
      });
    }

    // Step 4: Check index statistics
    console.log("\n4. Checking index statistics...");
    const indexStats = await pineconeIndex.describeIndexStats();
    console.log("   ✅ Index accessible");
    console.log(`   Total vectors: ${indexStats.totalRecordCount || 0}`);
    console.log(`   Index dimension: ${indexStats.dimension || "Unknown"}`);
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugVectorSearch();
