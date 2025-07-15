import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const pineconeIndex = pinecone.Index(
  process.env.PINECONE_INDEX! || "baps-embeddings"
);

// Map old scripture names to new ones (same as in ingest.ts)
function getScriptureName(fileName: string): string {
  const nameMap: { [key: string]: string } = {
    // Main scriptures
    "bhakta-chintamni": "Bhakta Chintamani",
    "satsangi jivan": "Satsangi Jivan",
    vachnamrut: "Vachanamrut",
    SatsangDiksha: "Satsang Diksha",
    "Gunatitanand Swami Ni Vato English": "Gunatitanand Swami Ni Vato",

    // Jivan Charitras
    "PSM Jivan Charitra 9": "Pramukh Swami Maharaj Jivan Charitra - Part 9",
    "PSM Jivan Charitra 8-min": "Pramukh Swami Maharaj Jivan Charitra - Part 8",
    "PSM Jivan 7": "Pramukh Swami Maharaj Jivan Charitra - Part 7",
    "PSM Jivan Charitra Part 3":
      "Pramukh Swami Maharaj Jivan Charitra - Part 3",
    "PSM Jivan Charitra Part 6":
      "Pramukh Swami Maharaj Jivan Charitra - Part 6",
    "PSM_Jivan Charitra Part 5":
      "Pramukh Swami Maharaj Jivan Charitra - Part 5",
    "PSM Jivan Charitra - Part 4":
      "Pramukh Swami Maharaj Jivan Charitra - Part 4",
    "PSM Jivan Charitra Part - 2_compressed":
      "Pramukh Swami Maharaj Jivan Charitra - Part 2",
    "PSM Jivan Charitra Part 1":
      "Pramukh Swami Maharaj Jivan Charitra - Part 1",

    "Yogiji Maharaj Jivan Charitra Part 6":
      "Yogiji Maharaj Jivan Charitra - Part 6",
    "Yogiji Maharaj Jivan Charitra Part 5":
      "Yogiji Maharaj Jivan Charitra - Part 5",
    "Yogiji Maharaj Jivan Charitra Part 4":
      "Yogiji Maharaj Jivan Charitra - Part 4",
    "Yogiji Maharaj Jivan Charitra Part 3":
      "Yogiji Maharaj Jivan Charitra - Part 3",
    "Yogiji Maharaj Jivan Charitra Part 2":
      "Yogiji Maharaj Jivan Charitra - Part 2",
    "Yogiji Maharaj Jivan Charitra Part 1":
      "Yogiji Maharaj Jivan Charitra - Part 1",

    Shastriji_Maharaj_Jivan_Charitra_Part_1:
      "Shastriji Maharaj Jivan Charitra - Part 1",
    Brahmaswarup_Pragji_Bhakta_Jivan_Charitra:
      "Brahmaswarup Pragji Bhakta Jivan Charitra",
    Aksharbrahman_Gunatitanand_Swami_Part_2:
      "Aksharbrahman Gunatitanand Swami - Part 2",
    Aksharbrahman_Gunatitanand_Swami_Part_1:
      "Aksharbrahman Gunatitanand Swami - Part 1",

    "2025_Bhagwan_Swaminarayan_Part__5": "Bhagwan Swaminarayan - Part 5",
    "202505_BhagwanSwaminarayan_Part4": "Bhagwan Swaminarayan - Part 4",
    "2025_Bhagwan_Swaminarayan_Part__3": "Bhagwan Swaminarayan - Part 3",
    "2025_Bhagwan_Swaminarayan_Part__2-Pragna-1":
      "Bhagwan Swaminarayan - Part 2",
    "2025_Bhagwan_Swaminarayan_Part__1": "Bhagwan Swaminarayan - Part 1",

    // Mahant Swami Maharaj
    "Mahant Swami Maharaj - An Epitome of Saintliness":
      "Mahant Swami Maharaj - An Epitome of Saintliness",
  };

  // Return mapped name if exists, otherwise format the filename nicely
  if (nameMap[fileName]) {
    return nameMap[fileName];
  }

  // Fallback: format the filename nicely
  return fileName
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function updateScriptureNames() {
  console.log("🔄 Updating scripture names in Pinecone index...\n");

  try {
    // Get index statistics
    const indexStats = await pineconeIndex.describeIndexStats();
    const totalVectors = indexStats.totalRecordCount || 0;

    if (totalVectors === 0) {
      console.log("❌ No vectors found in the index");
      return;
    }

    console.log(`📚 Found ${totalVectors} vectors in the index`);

    // Note: Pinecone doesn't support bulk metadata updates like Supabase
    // This script will show what changes would be needed but can't perform them
    console.log("⚠️  Note: Pinecone doesn't support bulk metadata updates");
    console.log("   To update scripture names, you would need to:");
    console.log(
      "   1. Re-run the ingest script with updated scripture names, or"
    );
    console.log("   2. Delete and recreate the index, or");
    console.log("   3. Use a paid Pinecone plan with more advanced features");

    // Show what scripture names are currently in the index
    console.log("\n📖 Current scripture names in index:");
    const scriptures = new Set<string>();

    // Query multiple times to get a sample of scripture names
    for (let i = 0; i < Math.min(10, Math.ceil(totalVectors / 100)); i++) {
      const queryResponse = await pineconeIndex.query({
        vector: Array.from({ length: 1536 }, () => Math.random() - 0.5),
        topK: 100,
        includeMetadata: true,
        includeValues: false,
      });

      queryResponse.matches?.forEach((match) => {
        const metadata = match.metadata as any;
        if (metadata?.scripture) {
          scriptures.add(metadata.scripture);
        }
      });
    }

    console.log(`Found ${scriptures.size} unique scripture names:`);
    Array.from(scriptures)
      .sort()
      .forEach((scripture) => {
        const newName = getScriptureName(scripture);
        if (newName !== scripture) {
          console.log(`   "${scripture}" → "${newName}"`);
        } else {
          console.log(`   "${scripture}" (no change needed)`);
        }
      });

    console.log(`\n✅ Scripture name analysis complete!`);
    console.log(`   - Total unique scriptures: ${scriptures.size}`);
    console.log(
      `   - Note: Actual updates require re-ingestion or index recreation`
    );
  } catch (error) {
    console.error("❌ Error during analysis:", error);
  }
}

// Run the update
updateScriptureNames()
  .then(() => {
    console.log("\n🎉 Scripture name analysis completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
