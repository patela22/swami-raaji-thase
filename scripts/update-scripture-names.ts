import { supabase } from "../lib/supabase";

// Map old scripture names to new ones (same as in ingest.ts)
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

async function updateScriptureNames() {
  console.log("🔄 Updating scripture names in database...\n");

  try {
    // Get all unique scripture names from database
    const { data: scriptures, error } = await supabase
      .from("embeddings")
      .select("scripture")
      .limit(1000);

    if (error) {
      console.error("❌ Error fetching scriptures:", error);
      return;
    }

    if (!scriptures || scriptures.length === 0) {
      console.log("❌ No scriptures found in database");
      return;
    }

    // Get unique scripture names
    const uniqueScriptures = [...new Set(scriptures.map((s) => s.scripture))];
    console.log(
      `📚 Found ${uniqueScriptures.length} unique scriptures in database`
    );

    let updatedCount = 0;
    let skippedCount = 0;

    // Update each scripture name
    for (const oldName of uniqueScriptures) {
      const newName = getScriptureName(oldName);

      if (newName !== oldName) {
        console.log(`🔄 Updating: "${oldName}" → "${newName}"`);

        const { error: updateError } = await supabase
          .from("embeddings")
          .update({ scripture: newName })
          .eq("scripture", oldName);

        if (updateError) {
          console.error(`❌ Error updating "${oldName}":`, updateError);
        } else {
          updatedCount++;
        }
      } else {
        console.log(`⏭️  Skipping: "${oldName}" (no change needed)`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Update complete!`);
    console.log(`   - Updated: ${updatedCount} scriptures`);
    console.log(`   - Skipped: ${skippedCount} scriptures`);
    console.log(`   - Total: ${uniqueScriptures.length} scriptures`);
  } catch (error) {
    console.error("❌ Error during update:", error);
  }
}

// Run the update
updateScriptureNames()
  .then(() => {
    console.log("\n🎉 Scripture name update completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
