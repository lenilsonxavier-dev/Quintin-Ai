import { BaseWord } from "../types";

export interface DictionaryItem {
  en: string;
  pt: string;
}

const externalDictEnToPt: Map<string, string> = new Map();
const externalDictPtToEn: Map<string, string> = new Map();
let isLoaded = false;
let isLoading = false;

// Triggers async loading of the 20,000+ words amferraz English-Portuguese dictionary
export async function loadExternalDict() {
  if (isLoaded || isLoading) return;
  isLoading = true;
  try {
    const response = await fetch("https://raw.githubusercontent.com/amferraz/kindle-dict-en-pt/master/English-Portuguese.tab");
    if (!response.ok) throw new Error("Failed to load dictionary.");
    const text = await response.text();
    const lines = text.split("\n");
    for (const line of lines) {
      const parts = line.split("\t");
      if (parts.length >= 2) {
        const en = parts[0].trim();
        const pt = parts[1].trim();
        if (en && pt) {
          const enLower = en.toLowerCase();
          const ptLower = pt.toLowerCase();
          externalDictEnToPt.set(enLower, pt);
          externalDictPtToEn.set(ptLower, en);
        }
      }
    }
    isLoaded = true;
    console.log(`📚 External dictionary loaded with ${externalDictEnToPt.size} definitions successfully!`);
  } catch (err) {
    console.error("⚠️ Failed to load external dictionary from GitHub:", err);
  } finally {
    isLoading = false;
  }
}

// Normalizes a string by stripping HTML, removing accents/diacritics, and converting to lowercase
function normalizeStr(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Strip accents
    .replace(/<\/?[^>]+(>|$)/g, " ") // Strip HTML tags
    .toLowerCase()
    .trim();
}

// Cleans up a search query by removing common Portuguese prepositions/articles so phrase matching is seamless
function cleanQuery(word: string): string {
  let cleaned = normalizeStr(word);
  // Strip common Portuguese/English leading prepositions and articles
  cleaned = cleaned.replace(/^(em |de |do |da |o |a |os |as |um |uma |para |no |na |in the |the |a )\s*/gi, "").trim();
  // Strip trailing punctuation
  cleaned = cleaned.replace(/[.:,;()?!]+/g, "").trim();
  return cleaned;
}

// Cleans up raw dictionary HTML output to make it super cute, clean, and professional for kids
export function cleanPtDefinitionForDisplay(rawPt: string): string {
  let cleaned = rawPt.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML
  cleaned = cleaned.replace(/\s+/g, " ").trim(); // Coalesce whitespaces
  return cleaned;
}

// Extracts the very first noun or meaning from Portuguese definition to use inside example phrases
function cleanFirstPtWord(rawPt: string): string {
  let cleaned = rawPt.replace(/<\/?[^>]+(>|$)/g, " ");
  // Remove part-of-speech markers and lists
  cleaned = cleaned.replace(/\b(n|adj|vt|vi|adv|prep|conj|v|interj|pron|pej|coll|sl|vulg|fig|Geom|Math|Phys|Med|Ichth|Ornith|Bot|Astr)\b\s*([0-9]+)?/gi, " ");
  // Remove leading numbers, periods or punctuation
  cleaned = cleaned.replace(/^[0-9.:,;()'\s]+/g, "");
  const match = cleaned.split(/[,;\.]/)[0];
  return (match || cleaned).trim() || "coisa";
}

export function searchExternalDict(word: string): BaseWord | null {
  const q = cleanQuery(word);
  if (!q) return null;
  
  // 1. Direct English Lookup
  if (externalDictEnToPt.has(q)) {
    const ptTranslation = externalDictEnToPt.get(q)!;
    const enWordCap = q.charAt(0).toUpperCase() + q.slice(1);
    const emoji = getCuteAnimalEmoji(q);
    
    return {
      en: enWordCap,
      pt: cleanPtDefinitionForDisplay(ptTranslation),
      emoji,
      example_en: `The ${q} is amazing!`,
      example_pt: `O ${cleanFirstPtWord(ptTranslation).toLowerCase()} é incrível!`
    };
  }

  // 2. Direct Portuguese Lookup (exact matches in mapped keys)
  if (externalDictPtToEn.has(q)) {
    const enWord = externalDictPtToEn.get(q)!;
    const enWordCap = enWord.charAt(0).toUpperCase() + enWord.slice(1);
    const ptTranslation = externalDictEnToPt.get(enWord.toLowerCase())!;
    const emoji = getCuteAnimalEmoji(enWord.toLowerCase());
    
    return {
      en: enWordCap,
      pt: cleanPtDefinitionForDisplay(ptTranslation),
      emoji,
      example_en: `Look at that beautiful ${enWord.toLowerCase()}!`,
      example_pt: `Olhe para aquele lindo ${cleanFirstPtWord(ptTranslation).toLowerCase()}!`
    };
  }

  // 3. Fast accent and HTML-immune lookup fallback
  for (const [en, pt] of externalDictEnToPt.entries()) {
    const normPt = normalizeStr(pt);
    
    // Check with word boundaries to avoid matching sub-words like "ar" in "lar"
    const regex = new RegExp(`\\b${q}\\b`, 'i');
    if (regex.test(normPt)) {
      const enWordCap = en.charAt(0).toUpperCase() + en.slice(1);
      const emoji = getCuteAnimalEmoji(en);
      return {
        en: enWordCap,
        pt: cleanPtDefinitionForDisplay(pt),
        emoji,
        example_en: `Learning about the ${en} is fun!`,
        example_pt: `Aprender sobre o ${cleanFirstPtWord(pt).toLowerCase()} é divertido!`
      };
    }
  }

  return null;
}

export function isDictCurrentlyLoaded(): boolean {
  return isLoaded;
}

// Map some common English word categories to emojis to make the custom dictionary extremely visual & interactive
function getCuteAnimalEmoji(enWord: string): string {
  const word = enWord.toLowerCase();
  if (word === "tiger") return "🐅";
  if (word === "lion") return "🦁";
  if (word === "pig") return "🐷";
  if (word === "cow") return "🐮";
  if (word === "zebra") return "🦓";
  if (word === "cat") return "🐱";
  if (word === "dog") return "🐶";
  if (word === "elephant") return "🐘";
  if (word === "monkey") return "🐒";
  if (word === "duck") return "🦆";
  if (word === "bear") return "🐻";
  if (word === "frog") return "🐸";
  if (word === "snake") return "🐍";
  if (word === "chicken" || word === "hen") return "🐔";
  if (word === "horse") return "🐴";
  if (word === "bee") return "🐝";
  if (word === "ant") return "🐜";
  if (word === "fish") return "🐟";
  if (word === "whale") return "🐳";
  if (word === "shark") return "🦈";
  if (word === "mouse") return "🐭";
  if (word === "spider") return "🕷️";
  if (word === "apple") return "🍎";
  if (word === "banana") return "🍌";
  if (word === "orange") return "🍊";
  if (word === "milk") return "🥛";
  if (word === "water") return "💧";
  if (word === "school") return "🏫";
  if (word === "house") return "🏠";
  if (word === "star") return "⭐";
  if (word === "sun") return "☀️";
  if (word === "moon") return "🌙";
  if (word === "dinosaur") return "🦖";
  if (word === "asteroid" || word === "meteor") return "☄️";
  if (word === "background") return "🖼️";
  
  // Default cute sparkle for generic dictionary terms
  return "✨";
}
