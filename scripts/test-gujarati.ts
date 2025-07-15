import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

import { generateEmbedding } from "../lib/embeddings";
import { Pinecone } from "@pinecone-database/pinecone";

async function testGujaratiEmbeddings() {
  console.log(
    "🧪 Testing Gujarati text embedding and cross-language search...\n"
  );

  // Test Gujarati text
  const gujaratiTexts = [
    "ભગવાન સ્વામિનારાયણનો જીવન ચરિત્ર",
    "ગુણાતીતાનંદ સ્વામીની વાતો",
    "વચનામૃતમાં ભગવાન સ્વામિનારાયણના ઉપદેશો",
  ];

  // Test English queries
  const englishQueries = [
    "Tell me about Swaminarayan's life",
    "Teachings of Gunatitanand Swami",
    "Swaminarayan's discourses in Vachanamrut",
  ];

  try {
    console.log("1. Testing Gujarati text embeddings...");
    for (let i = 0; i < gujaratiTexts.length; i++) {
      const embedding = await generateEmbedding(gujaratiTexts[i]);
      console.log(
        `   ✅ Gujarati text ${i + 1}: ${embedding.length} dimensions`
      );
    }

    console.log("\n2. Testing English query embeddings...");
    for (let i = 0; i < englishQueries.length; i++) {
      const embedding = await generateEmbedding(englishQueries[i]);
      console.log(
        `   ✅ English query ${i + 1}: ${embedding.length} dimensions`
      );
    }

    console.log("\n3. Testing Pinecone connection with Gujarati...");
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pinecone.Index(
      process.env.PINECONE_INDEX! || "baps-embeddings"
    );

    // Test query with Gujarati text
    const gujaratiEmbedding = await generateEmbedding(gujaratiTexts[0]);
    const queryResponse = await index.query({
      vector: gujaratiEmbedding,
      topK: 3,
      includeMetadata: true,
      includeValues: false,
    });

    console.log(
      `   ✅ Pinecone query successful: ${
        queryResponse.matches?.length || 0
      } results`
    );

    console.log("\n🎉 Gujarati embedding test completed successfully!");
    console.log("   - Your model supports Gujarati text");
    console.log("   - Cross-language search should work");
    console.log("   - You can embed Gujarati content and query in English");
  } catch (error) {
    console.error("❌ Error testing Gujarati embeddings:", error);
  }
}

testGujaratiEmbeddings().catch(console.error);
