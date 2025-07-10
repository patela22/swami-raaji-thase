import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

console.log("🔍 Testing Environment Variables...\n");

const requiredVars = [
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "DATABASE_URL",
];

let allGood = true;

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    allGood = false;
  } else if (value.includes("your_") || value.includes("here")) {
    console.log(`❌ ${varName}: Still has placeholder value`);
    allGood = false;
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
  }
}

console.log(
  "\n" +
    (allGood
      ? "🎉 All environment variables are properly configured!"
      : "⚠️  Please fix the missing/placeholder values above.")
);
