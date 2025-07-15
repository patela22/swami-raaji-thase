import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function debugPinecone() {
  console.log("🔍 Debugging Pinecone connection...\n");

  // Show environment variables (masked)
  console.log("Environment variables:");
  console.log(
    `  PINECONE_API_KEY: ${
      process.env.PINECONE_API_KEY ? "Set" : "Missing"
    } (${process.env.PINECONE_API_KEY?.substring(0, 10)}...)`
  );
  console.log(
    `  PINECONE_ENVIRONMENT: ${process.env.PINECONE_ENVIRONMENT || "Missing"}`
  );
  console.log(`  PINECONE_INDEX: ${process.env.PINECONE_INDEX || "Missing"}`);
  console.log();

  if (
    !process.env.PINECONE_API_KEY ||
    !process.env.PINECONE_ENVIRONMENT ||
    !process.env.PINECONE_INDEX
  ) {
    console.log("❌ Missing required environment variables");
    return;
  }

  try {
    console.log("1. Creating Pinecone client...");
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    console.log("✅ Pinecone client created");

    console.log("2. Getting index...");
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    console.log("✅ Index reference created");

    console.log("3. Testing index statistics...");
    const indexStats = await pineconeIndex.describeIndexStats();
    console.log("✅ Index statistics retrieved");
    console.log(`   Total vectors: ${indexStats.totalRecordCount || 0}`);
    console.log(`   Index dimension: ${indexStats.dimension || "Unknown"}`);

    console.log("4. Testing query...");
    const mockVector = Array.from({ length: 1536 }, () => Math.random() - 0.5);
    const queryResponse = await pineconeIndex.query({
      vector: mockVector,
      topK: 1,
      includeMetadata: false,
      includeValues: false,
    });
    console.log("✅ Query successful");
    console.log(`   Results returned: ${queryResponse.matches?.length || 0}`);

    console.log("\n🎉 All Pinecone tests passed!");
  } catch (error) {
    console.log("❌ Pinecone error:");
    console.log(error);

    if (error instanceof Error) {
      console.log("\nError details:");
      console.log(`  Message: ${error.message}`);
      console.log(`  Name: ${error.name}`);

      if ("cause" in error) {
        console.log(`  Cause: ${(error as any).cause}`);
      }
    }
  }
}

debugPinecone().catch(console.error);
