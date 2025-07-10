import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testEmbeddingModels() {
  console.log("🧪 Testing different embedding models...\n");

  const models = [
    "text-embedding-3-small",
    "text-embedding-3-large",
    "text-embedding-ada-002",
  ];

  for (const model of models) {
    try {
      console.log(`Testing model: ${model}`);
      const response = await openai.embeddings.create({
        model: model,
        input: "Test text for embedding.",
        encoding_format: "float",
      });

      const dimension = response.data[0].embedding.length;
      console.log(`✅ ${model}: ${dimension} dimensions\n`);
    } catch (error) {
      console.log(`❌ ${model}: Error - ${error}\n`);
    }
  }
}

testEmbeddingModels();
