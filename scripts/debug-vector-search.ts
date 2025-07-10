import { generateEmbedding } from "../lib/embeddings";
import { supabase } from "../lib/supabase";

async function debugVectorSearch() {
  console.log("🔍 Debugging vector search step by step...\n");

  const testQuery = "What is BAPS Satsang?";

  try {
    // Step 1: Generate embedding for the query
    console.log("1. Generating query embedding...");
    const queryEmbedding = await generateEmbedding(testQuery);
    console.log(
      `   ✅ Query embedding generated: ${queryEmbedding.length} dimensions`
    );
    console.log(
      `   First 5 values: [${queryEmbedding.slice(0, 5).join(", ")}]`
    );

    // Step 2: Test the match_documents function directly
    console.log("\n2. Testing match_documents function...");
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5,
    });

    if (error) {
      console.error("   ❌ match_documents error:", error);
      return;
    }

    console.log(`   ✅ match_documents returned ${data?.length || 0} results`);

    if (data && data.length > 0) {
      console.log("   Sample results:");
      data.slice(0, 3).forEach((result, index) => {
        console.log(
          `   ${index + 1}. ${result.scripture} (Page ${
            result.page
          }) - Similarity: ${result.similarity}`
        );
        console.log(`      Content: "${result.content.substring(0, 100)}..."`);
      });
    } else {
      console.log("   ❌ No results found");
    }

    // Step 3: Test with a lower threshold
    console.log("\n3. Testing with lower threshold (0.1)...");
    const { data: data2, error: error2 } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.1,
        match_count: 5,
      }
    );

    if (error2) {
      console.error("   ❌ match_documents error:", error2);
    } else {
      console.log(
        `   ✅ Found ${data2?.length || 0} results with lower threshold`
      );
      if (data2 && data2.length > 0) {
        console.log("   Sample results:");
        data2.slice(0, 3).forEach((result, index) => {
          console.log(
            `   ${index + 1}. ${result.scripture} (Page ${
              result.page
            }) - Similarity: ${result.similarity}`
          );
        });
      }
    }

    // Step 4: Check if embeddings table has the right structure
    console.log("\n4. Checking embeddings table structure...");
    const { data: sampleEmbeddings, error: tableError } = await supabase
      .from("embeddings")
      .select("id, scripture, page, content")
      .limit(1);

    if (tableError) {
      console.error("   ❌ Error querying embeddings table:", tableError);
    } else {
      console.log("   ✅ Embeddings table accessible");
      if (sampleEmbeddings && sampleEmbeddings.length > 0) {
        console.log(
          `   Sample embedding: ${sampleEmbeddings[0].scripture} (Page ${sampleEmbeddings[0].page})`
        );
      }
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugVectorSearch();
