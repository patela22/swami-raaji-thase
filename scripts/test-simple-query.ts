import { queryVectorDB } from "../lib/retriever";
import {
  processQueryForRetrieval,
  createQueryVariations,
} from "../lib/query-expansion";

async function testSimpleQuery() {
  console.log("🧪 Testing simple query: 'who is bapa'...\n");

  const query = "who is bapa";

  try {
    // Test query processing
    console.log("1. Testing query processing...");
    const processedQuery = processQueryForRetrieval(query);
    console.log(`   Original: "${query}"`);
    console.log(`   Processed: "${processedQuery}"`);

    const queryVariations = createQueryVariations(processedQuery);
    console.log(`   Variations: ${queryVariations.length}`);
    queryVariations.forEach((variation, index) => {
      console.log(`   ${index + 1}. "${variation}"`);
    });

    // Test with different similarity thresholds
    console.log("\n2. Testing with different thresholds...");

    for (const threshold of [0.1, 0.2, 0.3, 0.4, 0.5]) {
      console.log(`\n   Testing threshold: ${threshold}`);
      const results = await queryVectorDB(processedQuery, {
        topK: 5,
        similarityThreshold: threshold,
        useHybridSearch: true,
        useReranking: true,
      });

      console.log(`   Found ${results.length} results`);

      if (results.length > 0) {
        results.slice(0, 2).forEach((result, index) => {
          console.log(
            `   ${index + 1}. ${result.scripture} (Page ${
              result.page
            }) - Similarity: ${result.similarity.toFixed(3)}`
          );
          console.log(
            `      Content: "${result.content.substring(0, 100)}..."`
          );
        });
      }
    }

    // Test without hybrid search
    console.log("\n3. Testing without hybrid search...");
    const semanticResults = await queryVectorDB(processedQuery, {
      topK: 5,
      similarityThreshold: 0.3,
      useHybridSearch: false,
      useReranking: true,
    });

    console.log(`   Semantic search found ${semanticResults.length} results`);

    if (semanticResults.length > 0) {
      semanticResults.slice(0, 2).forEach((result, index) => {
        console.log(
          `   ${index + 1}. ${result.scripture} (Page ${
            result.page
          }) - Similarity: ${result.similarity.toFixed(3)}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testSimpleQuery();
