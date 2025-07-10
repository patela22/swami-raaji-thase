import * as fs from "fs";
import * as path from "path";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateEmbeddings } from "../lib/embeddings";
import { insertEmbeddings } from "../lib/retriever";

interface Chunk {
  scripture: string;
  page: string;
  content: string;
  embedding: number[];
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function isScannedPDF(text: string): boolean {
  const trimmedText = text.trim();
  const nonWhitespaceChars = trimmedText.replace(/\s/g, "").length;
  const whitespaceRatio = (text.length - nonWhitespaceChars) / text.length;

  // If more than 90% is whitespace or less than 100 chars of actual text
  return whitespaceRatio > 0.9 || nonWhitespaceChars < 100;
}

async function splitTextIntoChunks(
  text: string,
  chunkSize: number = 500
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 50,
    separators: ["\n\n", "\n", " ", ""],
  });

  const chunks = await splitter.splitText(text);

  // Filter out empty or very large chunks
  const filteredChunks = chunks.filter((chunk) => {
    const trimmed = chunk.trim();
    return trimmed.length > 10 && trimmed.length < 4000;
  });

  return filteredChunks;
}

async function testSinglePDF(filePath: string) {
  console.log(`🧪 Testing single PDF: ${filePath}\n`);

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    const fileName = path.basename(filePath, ".pdf");
    console.log(`📄 Processing: ${fileName}`);

    // Extract text
    console.log("1. Extracting text from PDF...");
    const text = await extractTextFromPDF(filePath);
    console.log(`   - Text length: ${text.length} characters`);

    // Check if scanned
    if (isScannedPDF(text)) {
      console.log(`❌ This is a scanned PDF - no extractable text`);
      return;
    }
    console.log(`✅ Text extraction successful`);

    // Split into chunks
    console.log("\n2. Splitting text into chunks...");
    const chunks = await splitTextIntoChunks(text);
    console.log(`   - Generated ${chunks.length} chunks`);

    if (chunks.length === 0) {
      console.log(`❌ No valid chunks generated`);
      return;
    }

    // Show sample chunks
    console.log("\n3. Sample chunks:");
    chunks.slice(0, 2).forEach((chunk, index) => {
      console.log(`   Chunk ${index + 1}: "${chunk.substring(0, 100)}..."`);
    });

    // Generate embeddings for first few chunks only (for testing)
    console.log("\n4. Generating embeddings (testing with first 3 chunks)...");
    const testChunks = chunks.slice(0, 3);
    const embeddings = await generateEmbeddings(testChunks);
    console.log(`   - Generated ${embeddings.length} embeddings`);
    console.log(
      `   - Embedding dimension: ${embeddings[0]?.length || "undefined"}`
    );

    // Create chunk objects
    console.log("\n5. Creating chunk objects...");
    const chunkObjects: Chunk[] = testChunks.map((chunk, index) => ({
      scripture: fileName,
      page: Math.floor(index / 3).toString(),
      content: chunk,
      embedding: embeddings[index],
    }));

    // Test database insertion
    console.log("\n6. Testing database insertion...");
    await insertEmbeddings(chunkObjects);
    console.log(
      `✅ Successfully inserted ${chunkObjects.length} embeddings into database`
    );

    console.log("\n🎉 Test completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - File: ${fileName}`);
    console.log(`   - Total chunks: ${chunks.length}`);
    console.log(`   - Tested chunks: ${testChunks.length}`);
    console.log(`   - Embedding dimension: ${embeddings[0]?.length}`);
    console.log(`   - Database insertion: ✅ Success`);
  } catch (error) {
    console.error(`❌ Test failed:`, error);
  }
}

// Test with a specific PDF file
const testFile = "data/vachnamrut.pdf"; // Change this to test different files
testSinglePDF(testFile);
