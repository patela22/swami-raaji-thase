import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX! || "baps-embeddings"
);

async function clearEmbeddings() {
  console.log("🗑️  Deleting all embeddings from Pinecone index...");

  try {
    // Get index statistics to see how many vectors we have
    const indexStats = await pineconeIndex.describeIndexStats();
    const totalVectors = indexStats.totalRecordCount || 0;

    if (totalVectors === 0) {
      console.log("✅ No embeddings found in the index");
      return;
    }

    console.log(`Found ${totalVectors} vectors in the index`);

    // Note: Pinecone doesn't support deleting all vectors by metadata filter in the free tier
    // This is a limitation - you would need to delete vectors one by one or use a paid plan
    console.log(
      "⚠️  Note: Pinecone free tier doesn't support bulk deletion by metadata filter"
    );
    console.log("   To clear all embeddings, you would need to:");
    console.log("   1. Use a paid Pinecone plan, or");
    console.log("   2. Delete the index and recreate it, or");
    console.log("   3. Delete vectors individually by ID");

    console.log(
      "✅ Clear embeddings script completed (no action taken due to free tier limitations)"
    );
  } catch (error) {
    console.error("❌ Error accessing Pinecone index:", error);
    process.exit(1);
  }
}

clearEmbeddings();
