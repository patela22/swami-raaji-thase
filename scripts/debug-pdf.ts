import * as fs from "fs";
import pdf from "pdf-parse";
import * as path from "path";

async function debugPDF(filePath: string) {
  console.log(`\n🔍 Debugging: ${filePath}`);

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    console.log(`📄 PDF Info:`);
    console.log(`   - Pages: ${data.numpages}`);
    console.log(`   - Text length: ${data.text.length} characters`);
    console.log(`   - First 200 chars: "${data.text.substring(0, 200)}..."`);
    console.log(
      `   - Last 200 chars: "...${data.text.substring(data.text.length - 200)}"`
    );

    // Check if text is mostly empty or whitespace
    const trimmedText = data.text.trim();
    const nonWhitespaceChars = trimmedText.replace(/\s/g, "").length;
    const whitespaceRatio =
      (data.text.length - nonWhitespaceChars) / data.text.length;

    console.log(`   - Non-whitespace chars: ${nonWhitespaceChars}`);
    console.log(
      `   - Whitespace ratio: ${(whitespaceRatio * 100).toFixed(1)}%`
    );

    if (trimmedText.length < 100) {
      console.log(
        `❌ Text too short - likely a scanned PDF or extraction failed`
      );
    } else if (whitespaceRatio > 0.8) {
      console.log(`❌ Too much whitespace - likely layout issues`);
    } else {
      console.log(`✅ Text extraction looks good`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function main() {
  const problematicFiles = [
    "data/Jivan Charitras/Yogiji Maharaj Jivan Charitra Part 6.pdf",
    "data/Jivan Charitras/Yogiji Maharaj Jivan Charitra Part 5.pdf",
    "data/Jivan Charitras/Yogiji Maharaj Jivan Charitra Part 4.pdf",
    "data/Jivan Charitras/Yogiji Maharaj Jivan Charitra Part 3.pdf",
    "data/Jivan Charitras/Yogiji Maharaj Jivan Charitra Part 2.pdf",
    "data/Jivan Charitras/Yogiji Maharaj Jivan Charitra Part 1.pdf",
    "data/Jivan Charitras/Shastriji_Maharaj_Jivan_Charitra_Part_1.pdf",
    "data/Jivan Charitras/PSM_Jivan Charitra Part 5.pdf",
  ];

  for (const filePath of problematicFiles) {
    if (fs.existsSync(filePath)) {
      await debugPDF(filePath);
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  }
}

main();
