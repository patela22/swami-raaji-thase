#!/usr/bin/env node

const testQueries = [
  "What is BAPS Satsang?",
  "What is the difference between BAPS and other Swaminarayan sects?",
  "Who is the current guru of BAPS?",
  "What are the core principles of BAPS?",
  "What is Akshar Purushottam philosophy?",
];

async function testQuery(query) {
  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: query }],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    let accumulatedContent = "";
    let citations = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content") {
              accumulatedContent += parsed.content;
            } else if (parsed.type === "citations") {
              citations = parsed.citations;
            }
          } catch (e) {
            // Continue streaming
          }
        }
      }
    }

    return { query, content: accumulatedContent, citations };
  } catch (error) {
    return { query, error: error.message };
  }
}

async function runTests() {
  console.log("🧪 Testing BAPS-specific responses...\n");

  for (const query of testQueries) {
    console.log(`📝 Testing: "${query}"`);
    const result = await testQuery(query);

    if (result.error) {
      console.log(`❌ Error: ${result.error}\n`);
    } else {
      console.log(`✅ Response: ${result.content.substring(0, 200)}...`);
      console.log(`📚 Citations: ${result.citations.length} sources\n`);
    }

    // Wait a bit between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("🎉 Testing complete!");
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testQuery, runTests };
