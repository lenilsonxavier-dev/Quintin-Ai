import { BaseWord } from "../types";
import { GLOSSARY_DATA } from "../data/conhecimento";
import { memory } from "./memory";
import { CINEMA_GLOSSARY } from "../data/cinema_dict";
import { GENERAL_DICT } from "../data/general_dict";

// Elegant Portuguese / English vocabulary expansion maps to support dynamic offline lookups
export const DYNAMIC_EXTENDED_DICTIONARY: Record<string, { en: string; pt: string; emoji: string; example_en: string; example_pt: string }> = {
  "água": { en: "Water", pt: "Água", emoji: "💧", example_en: "Always drink clean cold water.", example_pt: "Beba sempre água fria e limpa." },
  "water": { en: "Water", pt: "Água", emoji: "💧", example_en: "Always drink clean cold water.", example_pt: "Beba sempre água fria e limpa." },
  
  "maçã": { en: "Apple", pt: "Maçã", emoji: "🍎", example_en: "I eat a sweet red apple.", example_pt: "Eu como uma maçã vermelha docinha." },
  "maca": { en: "Apple", pt: "Maçã", emoji: "🍎", example_en: "I eat a sweet red apple.", example_pt: "Eu como uma maçã vermelha docinha." },
  "apple": { en: "Apple", pt: "Maçã", emoji: "🍎", example_en: "I eat a sweet red apple.", example_pt: "Eu como uma maçã vermelha docinha." },

  "to be": { en: "To Be", pt: "Ser ou Estar", emoji: "⚡", example_en: "I am happy! (Eu estou feliz).", example_pt: "O verbo 'To Be' serve para falar quem somos ou como estamos!" },

  "casa": { en: "House", pt: "Casa", emoji: "🏠", example_en: "We live in a beautiful warm house.", example_pt: "Nós moramos em uma bela casa quentinha." },
  "house": { en: "House", pt: "Casa", emoji: "🏠", example_en: "We live in a beautiful warm house.", example_pt: "Nós moramos em uma bela casa quentinha." },
  
  "sol": { en: "Sun", pt: "Sol", emoji: "☀️", example_en: "The yellow sun shines brightly today.", example_pt: "O sol amarelo brilha forte hoje." },
  "sun": { en: "Sun", pt: "Sol", emoji: "☀️", example_en: "The yellow sun shines brightly today.", example_pt: "O sol amarelo brilha forte hoje." },
  
  "lua": { en: "Moon", pt: "Lua", emoji: "🌙", example_en: "The glowing white moon looks pretty in the sky.", example_pt: "A lua branca brilhante está linda no céu." },
  "moon": { en: "Moon", pt: "Lua", emoji: "🌙", example_en: "The glowing white moon looks pretty in the sky.", example_pt: "A lua branca brilhante está linda no céu." },
  
  "estrela": { en: "Star", pt: "Estrela", emoji: "⭐", example_en: "You are a shining little star!", example_pt: "Você é uma estrelinha brilhante!" },
  "star": { en: "Star", pt: "Estrela", emoji: "⭐", example_en: "You are a shining little star!", example_pt: "Você é uma estrelinha brilhante!" },
  
  "carro": { en: "Car", pt: "Carro", emoji: "🚗", example_en: "My family drives a fast blue car.", example_pt: "Minha família dirige um carro azul veloz." },
  "car": { en: "Car", pt: "Carro", emoji: "🚗", example_en: "My family drives a fast blue car.", example_pt: "Minha família dirige um carro azul veloz." },
  
  "escola": { en: "School", pt: "Escola", emoji: "🏫", example_en: "I meet my kind smart teachers at school.", example_pt: "Eu encontro meus professores bondosos e inteligentes na escola." },
  "school": { en: "School", pt: "Escola", emoji: "🏫", example_en: "I meet my kind smart teachers at school.", example_pt: "Eu encontro meus professores bondosos e inteligentes na escola." },
  
  "brinquedo": { en: "Toy", pt: "Brinquedo", emoji: "🧸", example_en: "Let's share our toys with classmates.", example_pt: "Vamos compartilhar nossos brinquedos com os colegas." },
  "toy": { en: "Toy", pt: "Brinquedo", emoji: "🧸", example_en: "Let's share our toys with classmates.", example_pt: "Vamos compartilhar nossos brinquedos com os colegas." },
  
  "feliz": { en: "Happy", pt: "Feliz", emoji: "😊", example_en: "I feel very happy when I learn clean terms.", example_pt: "Eu me sinto muito feliz quando aprendo termos limpos." },
  "happy": { en: "Happy", pt: "Feliz", emoji: "😊", example_en: "I feel very happy when I learn clean terms.", example_pt: "Eu me sinto muito feliz quando aprendo termos limpos." },
  
  "bola": { en: "Ball", pt: "Bola", emoji: "⚽", example_en: "Let's kick the round soccer ball.", example_pt: "Vamos chutar a bola de futebol redonda." },
  "ball": { en: "Ball", pt: "Bola", emoji: "⚽", example_en: "Let's kick the round soccer ball.", example_pt: "Vamos chutar a bola de futebol redonda." },
  
  "boneca": { en: "Doll", pt: "Boneca", emoji: "🪆", example_en: "The doll has long hair and beautiful eyes.", example_pt: "A boneca tem cabelos longos e olhos lindos." },
  "doll": { en: "Doll", pt: "Boneca", emoji: "🪆", example_en: "The doll has long hair and beautiful eyes.", example_pt: "A boneca tem cabelos longos e olhos lindos." },
  
  "leite": { en: "Milk", pt: "Leite", emoji: "🥛", example_en: "I drink a cup of sweet white milk.", example_pt: "Eu tomo um copo de leite branco docinho." },
  "milk": { en: "Milk", pt: "Leite", emoji: "🥛", example_en: "I drink a cup of sweet white milk.", example_pt: "Eu tomo um copo de leite branco docinho." },
  
  "biscoito": { en: "Cookie", pt: "Biscoito", emoji: "🍪", example_en: "Cookies taste so chocolatey and sweet.", example_pt: "Os biscoitos são tão saborosos, doces e cheios de chocolate." },
  "cookie": { en: "Cookie", pt: "Biscoito", emoji: "🍪", example_en: "Cookies taste so chocolatey and sweet.", example_pt: "Os biscoitos são tão saborosos, doces e cheios de chocolate." }
};

const KID_ENCOURAGEMENTS = [
  "You are doing amazing, {name}! 🌟 Você está indo muito bem! O que mais quer aprender?",
  "That is so clever, {name}! Quinti está orgulhoso! Tente clicar nas pastinhas de categorias!",
  "Splendid! 🚀 Aprender inglês é como achar um tesouro! ⭐ Shall we check our stats or start a Quiz?",
  "You are a superstar, {name}! 🌈 Vamos ler e falar juntos! Pergunte 'O que significa' ou 'Como se diz'!"
];

// Simple Levenshtein distance parser to check similarity
export function calculateSimilarity(s1: string, s2: string): number {
  const norm1 = s1.toLowerCase().trim();
  const norm2 = s2.toLowerCase().trim();
  
  if (norm1 === norm2) return 1.0;
  if (norm1.length === 0 || norm2.length === 0) return 0.0;
  
  const temp = Array(norm2.length + 1).fill(null).map(() => Array(norm1.length + 1).fill(null));
  
  for (let i = 0; i <= norm1.length; i++) temp[0][i] = i;
  for (let j = 0; j <= norm2.length; j++) temp[j][0] = j;
  
  for (let j = 1; j <= norm2.length; j++) {
    for (let i = 1; i <= norm1.length; i++) {
      const substitutionCost = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
      temp[j][i] = Math.min(
        temp[j][i - 1] + 1, // deletion
        temp[j - 1][i] + 1, // insertion
        temp[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  const distance = temp[norm2.length][norm1.length];
  const maxLength = Math.max(norm1.length, norm2.length);
  return (maxLength - distance) / maxLength;
}

/**
 * Smart Client-Side NLP Classifier & Dialog Synthesizer
 */
export async function classificarEProcessarNLP(userText: string): Promise<{ text: string; detectedWord?: BaseWord }> {
  const text = userText.toLowerCase().trim().replace(/[?.,!]/g, "");
  const rawName = memory.userName || "friend";
  
  // Simulate tiny thinking process
  await new Promise((resolve) => setTimeout(resolve, 450));

  // 1. Intent Detection: Name Registration
  const namePatterns = [
    /(?:meu nome é|me chamo|i am|my name is|soy|sou|meu nome e)\s+([a-zA-Záéíóúâêîôûãõç\s]{2,15})/i,
    /meu nome\s+([a-zA-Záéíóúâêîôûãõç\s]{2,15})/i
  ];
  
  for (const pattern of namePatterns) {
    const match = userText.match(pattern);
    if (match && match[1]) {
      const discoveredName = match[1].trim();
      memory.userName = discoveredName;
      return {
        text: `Oh, hello **${discoveredName}**! 🌟 Que nome lindo e brilhante! Prazer em te conhecer!\n\nEu sou o Quinti, seu corujinha de estudos. Salvei seu nome nas minhas estrelas! ⭐ Vamos praticar inglês? Clique abaixo ou diga "hello"!`
      };
    }
  }

  // 2. Intent Detection: Dynamic Translation / Dictionary Lookups
  let targetLookup = "";
  
  const lookupPatterns = [
    /o que (?:é|e|significa|quer dizer)\s+(.+)/i,
    /como (?:se diz|fala)\s+(.+?)(?:\s+em ingl(?:ê|e)s)?$/i,
    /meaning of\s+(.+)/i,
    /translate\s+(.+)/i,
    /diga\s+(?:em português\s+)?(.+)/i,
    /fale\s+(?:em português\s+)?(.+)/i
  ];

  for (const pattern of lookupPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      targetLookup = match[1].trim()
        .replace(/\s+em ingl(?:ê|e)s/gi, "")
        .replace(/\s+em portugu(?:ê|e)s/gi, "")
        .replace(/o verbo/gi, "")
        .replace(/verb/gi, "")
        .trim();
      break;
    }
  }

  // If no pattern matched, check if it's just a single/double word from dictionaries
  if (!targetLookup) {
    const words = text.split(/\s+/);
    if (words.length <= 3) {
      targetLookup = text;
    }
  }

  if (targetLookup) {
    // A. Check GLOSSARY DATA
    for (const [catName, category] of Object.entries(GLOSSARY_DATA.glossary)) {
      const match = category.words.find(
        w => w.pt.toLowerCase() === targetLookup || 
             w.en.toLowerCase() === targetLookup ||
             calculateSimilarity(w.pt, targetLookup) > 0.85 ||
             calculateSimilarity(w.en, targetLookup) > 0.85
      );
      if (match) {
        memory.addLearnedWord(match.en);
        return {
          text: `${match.emoji} **${match.en}** significa **${match.pt}**!\n\n🌟 *"${match.example_en}"*\n(${match.example_pt})\n\nCan you pronounce "**${match.en}**"? 🔊`,
          detectedWord: match
        };
      }
    }

    // B. Check Extended Dictionary
    // Fuzzy matching for dynamic dictionary too
    for (const key in DYNAMIC_EXTENDED_DICTIONARY) {
      if (key === targetLookup || calculateSimilarity(key, targetLookup) > 0.85) {
        const match = DYNAMIC_EXTENDED_DICTIONARY[key];
        memory.addLearnedWord(match.en);
        return {
          text: `${match.emoji} **${match.en}** significa **${match.pt}**!\n\n🌟 *"${match.example_en}"*\n(${match.example_pt})\n\nWant to practice spelling? ⭐`,
          detectedWord: { ...match } as any
        };
      }
    }

    // C. Check Cinema/Media Extended Glossary (Frequency-based from Gist)
    for (const key in CINEMA_GLOSSARY) {
      const match = CINEMA_GLOSSARY[key];
      if (key === targetLookup || 
          match.en.toLowerCase() === targetLookup || 
          match.pt.toLowerCase() === targetLookup ||
          calculateSimilarity(key, targetLookup) > 0.85) {
        memory.addLearnedWord(match.en);
        return {
          text: `${match.emoji} **${match.en}** significa **${match.pt}**!\n\n🌟 *"${match.example_en}"*\n(${match.example_pt})`,
          detectedWord: match
        };
      }
    }

    // D. Check General Dictionary (Frequency-based from Kindle/GitHub)
    for (const key in GENERAL_DICT) {
      const match = GENERAL_DICT[key];
      if (key === targetLookup || 
          match.en.toLowerCase() === targetLookup || 
          match.pt.toLowerCase() === targetLookup ||
          calculateSimilarity(key, targetLookup) > 0.85) {
        memory.addLearnedWord(match.en);
        return {
          text: `${match.emoji} **${match.en}** significa **${match.pt}**!\n\n🌟 *"${match.example_en}"*\n(${match.example_pt})`,
          detectedWord: match
        };
      }
    }
  }

  // 3. Intent Detection: Spelling Assistant
  if (text.includes("escreve") || text.includes("escrever") || text.includes("how to spell") || text.includes("soletre")) {
    const spellTarget = text
      .replace(/como escreve|como se escreve|how to spell|soletre|como se escrever|como escrever/g, "")
      .trim();

    if (spellTarget) {
      let englishWord = spellTarget;
      let emoji = "✏️";
      
      for (const category of Object.values(GLOSSARY_DATA.glossary)) {
        const found = category.words.find(w => w.pt.toLowerCase() === spellTarget || w.en.toLowerCase() === spellTarget);
        if (found) { englishWord = found.en; emoji = found.emoji; break; }
      }
      if (DYNAMIC_EXTENDED_DICTIONARY[spellTarget]) {
        englishWord = DYNAMIC_EXTENDED_DICTIONARY[spellTarget].en;
        emoji = DYNAMIC_EXTENDED_DICTIONARY[spellTarget].emoji;
      }

      const letterJoin = englishWord.toUpperCase().split("").join(" - ");
      return {
        text: `Spelling time! ✏️ Vamos escrever **${englishWord}** ${emoji}:\n\n✨ **${letterJoin}** ✨\n\nTake your pencil and copy this! Pegue seu lápis e copie essa palavra! 💖`
      };
    }
  }

  // 4. Empathetic Sentiment Check ("triste", "sad", "cansado", "desanimado")
  if (text.includes("triste") || text.includes("sad") || text.includes("cansado") || text.includes("chorando")) {
    return {
      text: `🧸 Oh, dear **${rawName}**... Sending you a giant cozy owl virtual hug! 🦉🩹\n\nRemember that you are extremely brave, smart, and loved! Let's play a simple category matching game to smile. We are together! ✨`
    };
  }

  // 5. General greetings / chat triggers
  if (text.includes("hello") || text.includes("hi") || text.includes("oi") || text.includes("olá") || text.includes("ola")) {
    const timeOfDay = new Date().getHours();
    let greetTime = "beautiful day";
    if (timeOfDay < 12) greetTime = "sunny morning";
    else if (timeOfDay < 18) greetTime = "lovely afternoon";
    else greetTime = "starry night";

    return {
      text: `👋 Hi! Hello **${rawName}**! ✨ Wishing you a ${greetTime}!\n\nI am Quinti! Type a Portuguese word or press a directory folder below to unlock new language stars! 🌟`
    };
  }

  // 6. Compliments ("good owl", "gosto de você", "te amo", "legal")
  if (text.includes("gosto de voce") || text.includes("gosto de você") || text.includes("te amo") || text.includes("love you") || text.includes("legal") || text.includes("cool") || text.includes("engraçado")) {
    return {
      text: `Oh, thank you! My little heart is fluttering like an owl's wings! 💖 You are the most fantastic learning partner on Earth! Let's keep practicing! ✨`
    };
  }

  // 7. Fallback smart generic encouragement with stateful name injection
  const randomEnc = KID_ENCOURAGEMENTS[Math.floor(Math.random() * KID_ENCOURAGEMENTS.length)];
  return {
    text: randomEnc.replace(/{name}/g, rawName)
  };
}
