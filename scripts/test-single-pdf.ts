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

// List of scripture names that need reversal
const REVERSED_SCRIPTURES = [
  "Satsangi Jivan",
  // Add more names here if needed
];

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function splitTextIntoChunks(
  text: string,
  chunkSize: number = 1500,
  chunkOverlap: number = 300
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""],
  });
  const chunks = await splitter.splitText(text);
  // Only keep non-empty, reasonable-length chunks
  return chunks
    .map((c) => c.trim())
    .filter((c) => c.length > 20 && c.length < 2000);
}

async function testSinglePDF() {
  const filePath = "./data/Gunatitanand Swami Ni Vato English.pdf";
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const fileName = path.basename(filePath, ".pdf");
  const scriptureName = fileName
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  console.log(`Processing: ${filePath}`);
  const text = await extractTextFromPDF(filePath);
  const chunks = await splitTextIntoChunks(text);
  if (chunks.length === 0) {
    console.error("No valid chunks found.");
    return;
  }
  // Only use the first chunk for this test
  const testChunks = chunks.slice(0, 1);
  const embeddings = await generateEmbeddings(testChunks);
  const chunkObjects: Chunk[] = testChunks.map((chunk, idx) => ({
    scripture: scriptureName,
    page: "1",
    content: REVERSED_SCRIPTURES.includes(scriptureName)
      ? chunk.split("").reverse().join("")
      : chunk,
    embedding: embeddings[idx],
  }));
  await insertEmbeddings(chunkObjects);
  console.log(
    "✅ Successfully inserted first chunk of Gunatitanand Swami Ni Vato English into Pinecone."
  );
}

testSinglePDF().catch(console.error);
