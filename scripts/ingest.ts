import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { generateEmbeddings } from "../lib/embeddings";
import { insertEmbeddings } from "../lib/retriever";
import { supabase } from "../lib/supabase";

interface Chunk {
  scripture: string;
  page: string;
  content: string;
  embedding: number[];
}

// Map filenames to cleaner scripture names
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
  chunkSize: number = 800, // Increased from 500 for better context
  chunkOverlap: number = 100 // Increased from 50 for better continuity
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: [
      "\n\n", // Paragraph breaks
      "\n", // Line breaks
      ". ", // Sentence breaks
      "? ", // Question marks
      "! ", // Exclamation marks
      "; ", // Semicolons
      ", ", // Commas
      " ", // Word breaks
      "", // Character breaks
    ],
  });

  const chunks = await splitter.splitText(text);

  // Enhanced filtering and processing
  const filteredChunks = chunks
    .map((chunk) => chunk.trim())
    .filter((chunk) => {
      const trimmed = chunk.trim();
      // More sophisticated filtering
      return (
        trimmed.length > 20 && // Minimum meaningful length
        trimmed.length < 2000 && // Maximum reasonable length
        !isHeaderOrFooter(trimmed) && // Remove headers/footers
        !isPageNumber(trimmed) && // Remove page numbers
        hasMeaningfulContent(trimmed) // Ensure meaningful content
      );
    })
    .map((chunk) => cleanChunk(chunk)); // Clean up the chunk

  return filteredChunks;
}

// Helper functions for better chunk processing
function isHeaderOrFooter(text: string): boolean {
  const headerFooterPatterns = [
    /^page\s+\d+/i,
    /^\d+\s*$/,
    /^chapter\s+\d+/i,
    /^section\s+\d+/i,
    /^©\s*\d{4}/i,
    /^all\s+rights\s+reserved/i,
    /^confidential/i,
    /^internal\s+use\s+only/i,
  ];

  return headerFooterPatterns.some((pattern) => pattern.test(text.trim()));
}

function isPageNumber(text: string): boolean {
  return /^\s*\d+\s*$/.test(text.trim());
}

function hasMeaningfulContent(text: string): boolean {
  // Check if text has meaningful words (not just numbers, symbols, etc.)
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const meaningfulWords = words.filter(
    (word) => /[a-zA-Z]/.test(word) && word.length > 2
  );

  return meaningfulWords.length >= 3; // At least 3 meaningful words
}

function cleanChunk(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n\s*\n/g, "\n") // Remove multiple line breaks
    .trim();
}

async function processPDF(filePath: string): Promise<Chunk[]> {
  console.log(`Processing: ${filePath}`);

  const fileName = path.basename(filePath, ".pdf");
  const scriptureName = getScriptureName(fileName);

  // DELETE existing chunks for this scripture before inserting new ones
  try {
    const { error: delError } = await supabase
      .from("embeddings")
      .delete()
      .eq("scripture", scriptureName);
    if (delError) {
      console.error(
        `Error deleting old chunks for ${scriptureName}:`,
        delError
      );
    } else {
      console.log(`Deleted old chunks for ${scriptureName}`);
    }
  } catch (err) {
    console.error(`Exception deleting old chunks for ${scriptureName}:`, err);
  }

  try {
    const text = await extractTextFromPDF(filePath);

    // Check if this is a scanned PDF
    if (isScannedPDF(text)) {
      console.log(
        `⚠️  Skipping scanned PDF: ${fileName} (no extractable text)`
      );
      return [];
    }

    // Split text into chunks
    const chunks = await splitTextIntoChunks(text);

    if (chunks.length === 0) {
      console.log(`No valid chunks generated for ${fileName}`);
      return [];
    }

    console.log(
      `Generated ${chunks.length} chunks for ${fileName} → "${scriptureName}"`
    );

    // Process chunks in smaller batches to avoid token limits
    const batchSize = 50; // Smaller batch size to stay under token limits
    const chunkObjects: Chunk[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      try {
        // Generate embeddings for this batch
        const embeddings = await generateEmbeddings(batch);

        // Validate embedding dimensions
        for (let j = 0; j < embeddings.length; j++) {
          const embedding = embeddings[j];
          if (embedding.length !== 1536) {
            console.error(
              `Invalid embedding dimension for chunk ${i + j}: ${
                embedding.length
              }`
            );
            continue; // Skip this chunk
          }

          chunkObjects.push({
            scripture: scriptureName,
            page: Math.floor((i + j) / 3).toString(), // Approximate page numbers
            content: batch[j],
            embedding: embedding,
          });
        }

        console.log(
          `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            chunks.length / batchSize
          )} for ${fileName}`
        );
      } catch (error) {
        console.error(`Error processing batch for ${fileName}:`, error);
        // Continue with next batch instead of failing entire file
      }
    }

    console.log(
      `Successfully processed ${chunkObjects.length} chunks for ${fileName} → "${scriptureName}"`
    );
    return chunkObjects;
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return [];
  }
}

async function main() {
  try {
    console.log("Starting PDF ingestion...");

    // Find all PDF files in the data directory
    const pdfFiles = await glob("./data/**/*.pdf");

    if (pdfFiles.length === 0) {
      console.log("No PDF files found in ./data directory");
      return;
    }

    console.log(`Found ${pdfFiles.length} PDF files`);

    let allChunks: Chunk[] = [];
    let processedFiles = 0;
    let skippedFiles = 0;

    // Process each PDF file
    for (const filePath of pdfFiles) {
      try {
        const chunks = await processPDF(filePath);
        if (chunks.length > 0) {
          allChunks.push(...chunks);
          processedFiles++;
        } else {
          skippedFiles++;
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        skippedFiles++;
      }
    }

    console.log(`\n📊 Processing Summary:`);
    console.log(`   - Total files: ${pdfFiles.length}`);
    console.log(`   - Successfully processed: ${processedFiles}`);
    console.log(`   - Skipped (scanned/empty): ${skippedFiles}`);
    console.log(`   - Total chunks generated: ${allChunks.length}`);

    if (allChunks.length === 0) {
      console.log("No chunks generated from PDF files");
      return;
    }

    console.log(`\nInserting ${allChunks.length} chunks into database...`);

    // Insert embeddings in smaller batches
    const batchSize = 50; // Smaller batch size for database insertion
    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      try {
        await insertEmbeddings(batch);
        console.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            allChunks.length / batchSize
          )}`
        );
      } catch (error) {
        console.error(
          `Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
          error
        );
        // Continue with next batch instead of failing entire process
      }
    }

    console.log("PDF ingestion completed successfully!");
  } catch (error) {
    console.error("Error during ingestion:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
