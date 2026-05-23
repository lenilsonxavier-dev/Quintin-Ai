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

export function searchExternalDict(word: string): BaseWord | null {
  const cleanWord = word.trim().toLowerCase();
  
  // 1. Direct English Lookup
  if (externalDictEnToPt.has(cleanWord)) {
    const ptTranslation = externalDictEnToPt.get(cleanWord)!;
    const enWordCap = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
    
    // Find matching emoji dynamically to make it cute!
    const emoji = getCuteAnimalEmoji(cleanWord);
    
    return {
      en: enWordCap,
      pt: ptTranslation,
      emoji,
      example_en: `The ${cleanWord} is amazing!`,
      example_pt: `O ${ptTranslation.toLowerCase()} é incrível!`
    };
  }

  // 2. Direct Portuguese Lookup
  if (externalDictPtToEn.has(cleanWord)) {
    const enWord = externalDictPtToEn.get(cleanWord)!;
    const enWordCap = enWord.charAt(0).toUpperCase() + enWord.slice(1);
    const ptTranslation = externalDictEnToPt.get(enWord.toLowerCase())!;
    const emoji = getCuteAnimalEmoji(enWord.toLowerCase());
    
    return {
      en: enWordCap,
      pt: ptTranslation,
      emoji,
      example_en: `Look at that beautiful ${enWord.toLowerCase()}!`,
      example_pt: `Olhe para aquele lindo ${ptTranslation.toLowerCase()}!`
    };
  }

  // 3. Fast substring search fallback for sub-words
  for (const [en, pt] of externalDictEnToPt.entries()) {
    if (pt.toLowerCase() === cleanWord || pt.toLowerCase().includes(cleanWord)) {
      const enWordCap = en.charAt(0).toUpperCase() + en.slice(1);
      const emoji = getCuteAnimalEmoji(en);
      return {
        en: enWordCap,
        pt,
        emoji,
        example_en: `Learning about the ${en} is fun!`,
        example_pt: `Aprender sobre o ${en} é divertido!`
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
  
  // Default cute sparkle for generic dictionary terms
  return "✨";
}
