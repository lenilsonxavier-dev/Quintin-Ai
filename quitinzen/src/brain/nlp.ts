import { BaseWord } from "../types";
import { GLOSSARY_DATA } from "../data/conhecimento";
import { memory } from "./memory";

// Elegant Portuguese / English vocabulary expansion maps to support dynamic offline lookups
export const DYNAMIC_EXTENDED_DICTIONARY: Record<string, { en: string; pt: string; emoji: string; example_en: string; example_pt: string }> = {
  "água": { en: "Water", pt: "Água", emoji: "💧", example_en: "Always drink clean cold water.", example_pt: "Beba sempre água fria e limpa." },
  "water": { en: "Water", pt: "Água", emoji: "💧", example_en: "Always drink clean cold water.", example_pt: "Beba sempre água fria e limpa." },
  
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
  
  "amigo": { en: "Friend", pt: "Amigo", emoji: "🤝", example_en: "My best friend plays puzzle games with me.", example_pt: "Meu melhor amigo joga quebra-cabeças comigo." },
  "friend": { en: "Friend", pt: "Amigo", emoji: "🤝", example_en: "My best friend plays puzzle games with me.", example_pt: "Meu melhor amigo joga quebra-cabeças comigo." },
  
  "amor": { en: "Love", pt: "Amor", emoji: "💖", example_en: "We love our wonderful family.", example_pt: "Nós amamos nossa maravilhosa família." },
  "love": { en: "Love", pt: "Amor", emoji: "💖", example_en: "We love our wonderful family.", example_pt: "Nós amamos nossa maravilhosa família." },
  
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
  "You are doing amazing, {name}! 🌟 What cool English words do you want to play with now?",
  "That is so clever, {name}! 🦉 Quinti is so proud of you! Try clicking one of our category folders below to study!",
  "Splendid! 🚀 Learning English is like finding hidden treasure stars! ⭐ Shall we check our stats or start a Quiz?",
  "You are a superstar! 🌈 Let's read and speak out loud together! Type 'O que significa' and any word!"
];

// Simple Levenshtein distance parser to check similarity for child spellchecking feedback
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
  const text = userText.toLowerCase().trim();
  const rawName = memory.userName || "friend";
  
  // Simulate tiny intellectual thinking process
  await new Promise((resolve) => setTimeout(resolve, 450));

  // 1. Intent Detection: Name Registration ("Meu nome é ... / Me chamo ... / I am ...")
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
        text: `🦉 Oh, hello **${discoveredName}**! 🌟 What a beautiful and bright name! Nice to meet you!\n\nI am Quinti, your little learning owl companion. I've saved your name in my stars registry! ⭐ Let's practice some English terms today? Double-click below or say "hello"!`
      };
    }
  }

  // 2. Intent Detection: Dynamic Translation / Dictionary Lookups ("O que é ...", "Como se diz ...")
  let targetLookup = "";
  if (text.startsWith("o que é") || text.startsWith("o que e")) {
    targetLookup = text.replace(/o que é|o que e/g, "").replace(/[?.,!]/g, "").trim();
  } else if (text.includes("como se diz") || text.includes("como falar")) {
    targetLookup = text.replace(/como se diz|como falar/g, "").replace(/em inglês|em ingles/g, "").replace(/[?.,!]/g, "").trim();
  } else if (text.includes("meaning of") || text.includes("translate")) {
    targetLookup = text.replace(/meaning of|translate/g, "").replace(/[?.,!]/g, "").trim();
  } else {
    // Check if the whole text is simply a single word present in dictionaries
    const simpleClean = text.replace(/[?.,!]/g, "").trim();
    if (simpleClean.split(/\s+/).length === 1) {
      targetLookup = simpleClean;
    }
  }

  if (targetLookup) {
    // A. Check GLOSSARY DATA first
    for (const [catName, category] of Object.entries(GLOSSARY_DATA.glossary)) {
      const match = category.words.find(
        w => w.pt.toLowerCase() === targetLookup || w.en.toLowerCase() === targetLookup
      );
      if (match) {
        memory.addLearnedWord(match.en);
        return {
          text: `🦉 Look! I found it inside my **${category.title}** folder:\n\n${match.emoji} **${match.en}** means **${match.pt}**!\n\n🌟 *"${match.example_en}"*\n(${match.example_pt})\n\nCan you practice pronouncing "**${match.en}**" clearly? 🔊`,
          detectedWord: match
        };
      }
    }

    // B. Check Extended Dictionary second
    if (DYNAMIC_EXTENDED_DICTIONARY[targetLookup]) {
      const match = DYNAMIC_EXTENDED_DICTIONARY[targetLookup];
      memory.addLearnedWord(match.en);
      return {
        text: `🦉 Aha! I found this wonderful word:\n\n${match.emoji} **${match.en}** means **${match.pt}**!\n\n🌟 *"${match.example_en}"*\n(${match.example_pt})\n\nWould you like me to spelling-guide you? ⭐`,
        detectedWord: match
      };
    }
  }

  // 3. Intent Detection: Spelling Assistant ("Como se escreve ...", "Deletrear ...")
  if (text.includes("como escreve") || text.includes("como se escreve") || text.includes("how to spell") || text.includes("soletre")) {
    const spellTarget = text
      .replace(/como escreve|como se escreve|how to spell|soletre/g, "")
      .replace(/[?.,!]/g, "")
      .trim();

    if (spellTarget) {
      // Find English term
      let englishWord = spellTarget;
      let emoji = "✏️";
      
      // Look up if they used a Portuguese word to spell
      for (const category of Object.values(GLOSSARY_DATA.glossary)) {
        const found = category.words.find(w => w.pt.toLowerCase() === spellTarget || w.en.toLowerCase() === spellTarget);
        if (found) {
          englishWord = found.en;
          emoji = found.emoji;
          break;
        }
      }
      if (DYNAMIC_EXTENDED_DICTIONARY[spellTarget]) {
        englishWord = DYNAMIC_EXTENDED_DICTIONARY[spellTarget].en;
        emoji = DYNAMIC_EXTENDED_DICTIONARY[spellTarget].emoji;
      }

      const letterJoin = englishWord.toUpperCase().split("").join(" - ");
      return {
        text: `🦉 Spelling time! ✏️ Let's write down **${englishWord}** ${emoji}:\n\n✨ **${letterJoin}** ✨\n\nTake your school pencil and copy this beautiful word! Great job, **${rawName}**! 💖`
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
      text: `🦉 Oh, thank you! My little heart is fluttering like an owl's wings! 🦉💖 You are the most fantastic learning partner on Earth! Let's keep practicing! ✨`
    };
  }

  // 7. Fallback smart generic encouragement with stateful name injection
  const randomEnc = KID_ENCOURAGEMENTS[Math.floor(Math.random() * KID_ENCOURAGEMENTS.length)];
  return {
    text: randomEnc.replace(/{name}/g, rawName)
  };
}
