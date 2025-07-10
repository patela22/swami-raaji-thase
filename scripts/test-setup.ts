import { generateEmbedding } from "../lib/embeddings";
import { supabase } from "../lib/supabase";

async function testSetup() {
  console.log("🧪 Testing Swami Raaji Thase setup...\n");

  // Test 1: Environment variables
  console.log("1. Checking environment variables...");
  const requiredEnvVars = [
    "OPENAI_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ANON_KEY",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.log("❌ Missing environment variables:", missingVars.join(", "));
    console.log("Please set these in your .env.local file");
    return false;
  }
  console.log("✅ Environment variables configured\n");

  // Test 2: OpenAI API
  console.log("2. Testing OpenAI API...");
  try {
    const testEmbedding = await generateEmbedding("test");
    if (testEmbedding.length === 1536) {
      console.log("✅ OpenAI API working correctly");
    } else {
      console.log("❌ Unexpected embedding length:", testEmbedding.length);
      return false;
    }
  } catch (error) {
    console.log("❌ OpenAI API error:", error);
    return false;
  }
  console.log();

  // Test 3: Supabase connection
  console.log("3. Testing Supabase connection...");
  try {
    const { data, error } = await supabase
      .from("embeddings")
      .select("count")
      .limit(1);
    if (error) {
      console.log("❌ Supabase connection error:", error.message);
      console.log("Make sure your database is set up correctly");
      return false;
    }
    console.log("✅ Supabase connection working");
  } catch (error) {
    console.log("❌ Supabase connection error:", error);
    return false;
  }
  console.log();

  // Test 4: Database tables
  console.log("4. Checking database tables...");
  try {
    const { data: embeddingsCount } = await supabase
      .from("embeddings")
      .select("*", { count: "exact", head: true });

    const { data: logsCount } = await supabase
      .from("logs")
      .select("*", { count: "exact", head: true });

    console.log(`✅ Embeddings table: ${embeddingsCount?.length || 0} records`);
    console.log(`✅ Logs table: ${logsCount?.length || 0} records`);
  } catch (error) {
    console.log("❌ Database table check error:", error);
    return false;
  }
  console.log();

  console.log("🎉 All tests passed! Your setup is ready.");
  console.log("\nNext steps:");
  console.log("1. Add PDF files to the data/ directory");
  console.log("2. Run: pnpm ingest");
  console.log("3. Run: pnpm dev");
  console.log("4. Open http://localhost:3000");

  return true;
}

// Run the test
if (require.main === module) {
  testSetup().catch(console.error);
}
