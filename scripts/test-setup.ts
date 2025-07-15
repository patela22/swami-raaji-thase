import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

import { generateEmbedding } from "../lib/embeddings";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX! || "baps-embeddings"
);

async function testSetup() {
  console.log("🧪 Testing Swami Raaji Thase setup...\n");

  // Test 1: Environment variables
  console.log("1. Checking environment variables...");
  const requiredEnvVars = [
    "OPENAI_API_KEY",
    "PINECONE_API_KEY",
    "PINECONE_ENVIRONMENT",
    "PINECONE_INDEX",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.log("❌ Missing environment variables:", missingVars.join(", "));
    console.log("Please set these in your .env.local file");
    console.log(
      "Note: The app works with mock data if Pinecone is not configured"
    );
    return false;
  }
  console.log("✅ Environment variables configured\n");

  // Test 2: OpenAI API
  console.log("2. Testing OpenAI API...");
  try {
    const testEmbedding = await generateEmbedding("test");
    console.log("✅ Embedding generation successful");
    console.log(`📏 Embedding dimension: ${testEmbedding.length}`);

    if (testEmbedding.length === 1536) {
      console.log(
        "✅ Embedding dimension matches text-embedding-3-small (1536)"
      );
    } else {
      console.log(
        `⚠️  Unexpected embedding dimension: ${testEmbedding.length}`
      );
    }
  } catch (error) {
    console.log("❌ OpenAI API error:", error);
    return false;
  }
  console.log();

  // Test 3: Pinecone connection
  console.log("3. Testing Pinecone connection...");
  try {
    // Test by querying the index
    const mockVector = {
      id: "test-vector",
      values: Array.from({ length: 1536 }, () => Math.random() - 0.5), // Mock vector
      metadata: {
        content: "Test content for BAPS teachings",
        scripture: "Vachanamrut",
        page: "1",
      },
    };
    await pineconeIndex.upsert([mockVector]);
    console.log("✅ Pinecone connection working");
  } catch (error) {
    console.log("❌ Pinecone connection error:", error);
    console.log("Make sure your Pinecone index is set up correctly");
    return false;
  }
  console.log();

  // Test 4: Index statistics
  console.log("4. Checking Pinecone index...");
  try {
    const indexStats = await pineconeIndex.describeIndexStats();
    console.log(
      `✅ Index name: ${indexStats.totalRecordCount || "Unknown"} vectors`
    );
    console.log(`✅ Index dimension: ${indexStats.dimension || "Unknown"}`);
  } catch (error) {
    console.log("❌ Index statistics error:", error);
    return false;
  }
  console.log();

  console.log("🎉 All tests passed! Your setup is ready.");
  console.log("\nNext steps:");
  console.log("1. Add PDF files to the data/ directory");
  console.log("2. Run: npm run ingest");
  console.log("3. Run: npm run dev");
  console.log("4. Open http://localhost:3000");

  return true;
}

// Run the test
if (require.main === module) {
  testSetup().catch(console.error);
}
