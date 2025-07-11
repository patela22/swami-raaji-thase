import { supabase } from "../lib/supabase";

async function checkDatabase() {
  console.log("🔍 Checking database contents...\n");

  try {
    // Check embeddings table
    console.log("1. Checking embeddings table...");
    const { data: embeddings, error: embeddingsError } = await supabase
      .from("embeddings")
      .select("scripture, page, content")
      .limit(5);

    if (embeddingsError) {
      console.error("❌ Error querying embeddings:", embeddingsError);
      return;
    }

    console.log(`✅ Found ${embeddings?.length || 0} embeddings`);
    if (embeddings && embeddings.length > 0) {
      console.log("Sample embeddings:");
      embeddings.forEach((emb, index) => {
        console.log(`   ${index + 1}. ${emb.scripture} (Page ${emb.page})`);
        console.log(`      Content: "${emb.content.substring(0, 100)}..."`);
      });
    }

    // Check total count
    const { count: totalCount } = await supabase
      .from("embeddings")
      .select("*", { count: "exact", head: true });

    console.log(`\n📊 Total embeddings in database: ${totalCount || 0}`);

    // Check unique scriptures
    const { data: scriptures } = await supabase
      .from("embeddings")
      .select("scripture")
      .limit(1000);

    if (scriptures) {
      const uniqueScriptures = Array.from(
        new Set(scriptures.map((s) => s.scripture))
      );
      console.log(`📚 Unique scriptures: ${uniqueScriptures.length}`);
      console.log("Scriptures:", uniqueScriptures);
    }
  } catch (error) {
    console.error("❌ Database check failed:", error);
  }
}

checkDatabase();
