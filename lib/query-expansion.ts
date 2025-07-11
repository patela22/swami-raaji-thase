export interface ExpandedQuery {
  original: string;
  expanded: string[];
  synonyms: string[];
  related: string[];
}

// BAPS Satsang specific terminology and synonyms
const SPIRITUAL_TERMS: Record<string, string[]> = {
  satsang: ["spiritual gathering", "holy assembly", "divine fellowship"],
  bhakti: ["devotion", "worship", "love for god"],
  guru: ["spiritual master", "teacher", "guide"],
  swami: ["holy person", "spiritual leader", "saint"],
  maharaj: ["great king", "spiritual king", "revered one"],
  bhagwan: ["god", "lord", "divine"],
  swaminarayan: ["lord swaminarayan", "bhagwan swaminarayan"],
  sadhu: ["saint", "holy person", "ascetic"],
  sant: ["saint", "holy person"],
  ashram: ["spiritual center", "monastery", "hermitage"],
  mandir: ["temple", "place of worship"],
  darshan: ["divine vision", "sight of god"],
  prasad: ["blessed food", "divine offering"],
  aarti: ["worship ceremony", "light ceremony"],
  kirtan: ["devotional singing", "holy music"],
  bhajan: ["devotional song", "holy song"],
  dharma: ["righteousness", "duty", "moral law"],
  karma: ["action", "deed", "work"],
  moksha: ["liberation", "salvation", "freedom"],
  maya: ["illusion", "worldly attachment"],
  atman: ["soul", "self", "spirit"],
  brahman: ["supreme reality", "absolute truth"],
  satsangi: ["devotee", "follower", "spiritual aspirant"],
  vachanamrut: ["divine words", "holy discourses"],
  shikshapatri: ["moral code", "spiritual guidelines"],
  nishkulanand: ["one who gives joy to all"],
  gunatitanand: ["one who transcends qualities"],
  pragji: ["pragji bhakta", "holy devotee"],
  shastriji: [
    "shastriji maharaj",
    "holy teacher",
    "founder of baps",
    "baps founder",
  ],
  yogiji: ["yogiji maharaj", "spiritual master"],
  pramukh: [
    "pramukh swami",
    "chief swami",
    "pramukh swami maharaj",
    "current baps guru",
    "baps spiritual head",
  ],
  mahant: [
    "mahant swami",
    "spiritual leader",
    "mahant swami maharaj",
    "current baps guru",
    "baps spiritual leader",
  ],
  bapa: ["father", "spiritual father", "guru", "swami", "maharaj"],
  bapuji: ["father", "spiritual father", "guru"],
  bapasri: ["father", "spiritual father", "guru"],
  bapashri: ["father", "spiritual father", "guru"],
  // BAPS-specific terms
  baps: [
    "bochasanwasi akshar purushottam swaminarayan sanstha",
    "baps organization",
    "baps sanstha",
  ],
  akshar: ["akshar purushottam", "eternal abode", "divine abode"],
  purushottam: ["supreme person", "highest being", "divine lord"],
  bochasan: ["bochasanwasi", "bochasan temple"],
  ghar: ["ghar sabha", "home assembly", "family gathering"],
  sabha: ["assembly", "gathering", "meeting"],
  seva: ["service", "selfless service", "community service"],
  sanskar: ["cultural values", "moral values", "spiritual values"],
  bal: ["bal sabha", "children's assembly", "youth program"],
  kishore: ["kishore sabha", "teen assembly", "youth gathering"],
  yuvak: ["yuvak sabha", "young men's assembly", "youth program"],
  mahila: ["mahila sabha", "women's assembly", "ladies gathering"],
  senani: ["senani sabha", "senior citizens assembly", "elderly gathering"],
};

export function expandQuery(query: string): ExpandedQuery {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);

  const synonyms: string[] = [];
  const related: string[] = [];

  // Find synonyms for spiritual terms
  words.forEach((word) => {
    const cleanWord = word.replace(/[^\w]/g, "");
    if (cleanWord in SPIRITUAL_TERMS) {
      synonyms.push(...SPIRITUAL_TERMS[cleanWord]);
    }
  });

  // Generate related queries
  const relatedQueries = generateRelatedQueries(query);

  return {
    original: query,
    expanded: [query, ...synonyms, ...relatedQueries],
    synonyms,
    related: relatedQueries,
  };
}

function generateRelatedQueries(query: string): string[] {
  const related: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Add question variations
  if (lowerQuery.includes("what is")) {
    related.push(query.replace(/what is/i, "tell me about"));
    related.push(query.replace(/what is/i, "explain"));
  }

  if (lowerQuery.includes("how to")) {
    related.push(query.replace(/how to/i, "what is the way to"));
    related.push(query.replace(/how to/i, "steps for"));
  }

  if (lowerQuery.includes("why")) {
    related.push(query.replace(/why/i, "what is the reason for"));
    related.push(query.replace(/why/i, "explain why"));
  }

  // Add "who is" variations
  if (lowerQuery.includes("who is")) {
    const person = query.replace(/who is/i, "").trim();
    related.push(`tell me about ${person}`);
    related.push(`explain ${person}`);
    related.push(`${person} in BAPS`);
    related.push(`${person} spiritual leader`);
    related.push(`${person} guru`);
  }

  // Add context-specific variations
  if (lowerQuery.includes("satsang")) {
    related.push(query + " in BAPS");
    related.push(query + " spiritual practice");
  }

  if (lowerQuery.includes("scripture") || lowerQuery.includes("vachanamrut")) {
    related.push(query + " teachings");
    related.push(query + " wisdom");
  }

  if (lowerQuery.includes("guru") || lowerQuery.includes("swami")) {
    related.push(query + " spiritual master");
    related.push(query + " guidance");
  }

  // Add BAPS-specific variations for common terms
  if (lowerQuery.includes("bapa") || lowerQuery.includes("bapuji")) {
    related.push("spiritual father BAPS");
    related.push("guru BAPS");
    related.push("swami BAPS");
  }

  // BAPS-specific query expansions
  if (lowerQuery.includes("baps")) {
    related.push("Bochasanwasi Akshar Purushottam Swaminarayan Sanstha");
    related.push("BAPS organization");
    related.push("BAPS sanstha");
  }

  if (lowerQuery.includes("akshar")) {
    related.push("Akshar Purushottam philosophy");
    related.push("eternal abode");
    related.push("divine abode");
  }

  if (lowerQuery.includes("shastriji")) {
    related.push("Shastriji Maharaj BAPS founder");
    related.push("BAPS founder");
    related.push("BAPS establishment");
  }

  if (lowerQuery.includes("pramukh")) {
    related.push("Pramukh Swami Maharaj");
    related.push("current BAPS guru");
    related.push("BAPS spiritual head");
  }

  if (lowerQuery.includes("mahant")) {
    related.push("Mahant Swami Maharaj");
    related.push("current BAPS guru");
    related.push("BAPS spiritual leader");
  }

  if (lowerQuery.includes("ghar sabha")) {
    related.push("home assembly BAPS");
    related.push("family gathering BAPS");
    related.push("family satsang");
  }

  if (lowerQuery.includes("seva")) {
    related.push("community service BAPS");
    related.push("selfless service");
    related.push("BAPS humanitarian work");
  }

  return related.slice(0, 5); // Limit to 5 related queries
}

export function createQueryVariations(query: string): string[] {
  const expanded = expandQuery(query);
  return expanded.expanded;
}

// Enhanced query processing for better retrieval
export function processQueryForRetrieval(query: string): string {
  // Remove common stop words but keep spiritual terms
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
  ]);

  const words = query.split(/\s+/);
  const filteredWords = words.filter((word) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
    return !stopWords.has(cleanWord) || cleanWord in SPIRITUAL_TERMS;
  });

  return filteredWords.join(" ");
}
