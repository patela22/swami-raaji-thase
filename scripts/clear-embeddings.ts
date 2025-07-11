import { supabase } from "../lib/supabase";

async function clearEmbeddings() {
  console.log("🗑️  Deleting all embeddings from the database in batches...");
  let totalDeleted = 0;
  while (true) {
    const { data, error } = await supabase
      .from("embeddings")
      .select("id", { head: false })
      .limit(1000);
    if (error) {
      console.error("❌ Error fetching embeddings:", error);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    const ids = data.map((row: any) => row.id);
    const { error: delError } = await supabase
      .from("embeddings")
      .delete()
      .in("id", ids);
    if (delError) {
      console.error("❌ Error deleting batch:", delError);
      process.exit(1);
    }
    totalDeleted += ids.length;
    console.log(
      `   Deleted batch of ${ids.length} embeddings (total: ${totalDeleted})`
    );
  }
  console.log(`✅ All embeddings deleted. Total deleted: ${totalDeleted}`);
}

clearEmbeddings();
