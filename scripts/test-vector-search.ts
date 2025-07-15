import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

import { queryVectorDB } from "../lib/retriever";

async function testVectorSearch() {
  console.log("🧪 Testing vector search functionality...\n");

  const testQueries = [
    "What is BAPS Satsang?",
    "Who is Swaminarayan?",
    "What are the teachings of BAPS?",
    "Tell me about the Vachanamrut",
  ];

  for (const query of testQueries) {
    console.log(`🔍 Testing query: "${query}"`);

    try {
      const results = await queryVectorDB(query, { topK: 3 });
      console.log(`   Found ${results.length} results`);

      if (results.length > 0) {
        results.forEach((result: any, index: number) => {
          console.log(
            `   ${index + 1}. ${result.scripture} (Page ${
              result.page
            }) - Similarity: ${result.similarity.toFixed(3)}`
          );
          console.log(
            `      Content: "${result.content.substring(0, 100)}..."`
          );
        });
      } else {
        console.log(`   ❌ No results found`);
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }

    console.log("");
  }
}

testVectorSearch();
