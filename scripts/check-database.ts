import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX! || "baps-embeddings"
);

async function checkDatabase() {
  console.log("🔍 Checking Pinecone index contents...\n");

  try {
    // Get index statistics
    console.log("1. Checking index statistics...");
    const indexStats = await pineconeIndex.describeIndexStats();

    const totalVectors = indexStats.totalRecordCount || 0;
    console.log(`✅ Found ${totalVectors} vectors in the index`);

    if (totalVectors === 0) {
      console.log("No vectors found in the index");
      return;
    }

    // Query a few sample vectors to see metadata
    console.log("\n2. Checking sample vectors...");
    const queryResponse = await pineconeIndex.query({
      vector: Array.from({ length: 1536 }, () => Math.random() - 0.5), // Mock vector
      topK: 5,
      includeMetadata: true,
      includeValues: false,
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log("Sample vectors:");
      queryResponse.matches.forEach((match, index) => {
        const metadata = match.metadata as any;
        console.log(
          `   ${index + 1}. ${metadata?.scripture || "Unknown"} (Page ${
            metadata?.page || "Unknown"
          })`
        );
        console.log(
          `      Content: "${(metadata?.content || "").substring(0, 100)}..."`
        );
        console.log(`      Similarity: ${match.score?.toFixed(3) || "N/A"}`);
      });
    }

    // Get unique scriptures from metadata
    console.log("\n3. Checking unique scriptures...");
    const scriptures = new Set<string>();

    // Query multiple times to get a broader sample
    for (let i = 0; i < Math.min(10, Math.ceil(totalVectors / 100)); i++) {
      const sampleQuery = await pineconeIndex.query({
        vector: Array.from({ length: 1536 }, () => Math.random() - 0.5),
        topK: 100,
        includeMetadata: true,
        includeValues: false,
      });

      sampleQuery.matches?.forEach((match) => {
        const metadata = match.metadata as any;
        if (metadata?.scripture) {
          scriptures.add(metadata.scripture);
        }
      });
    }

    console.log(`📚 Unique scriptures found: ${scriptures.size}`);
    if (scriptures.size > 0) {
      console.log("Scriptures:", Array.from(scriptures));
    }
  } catch (error) {
    console.error("❌ Pinecone index check failed:", error);
  }
}

checkDatabase();
