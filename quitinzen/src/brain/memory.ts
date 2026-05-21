import { ChatMessage } from "../types";

export interface MemoryType {
  chatHistory: ChatMessage[];
  learnedWords: string[];
  userName: string;
}

const STORAGE_KEY = "quinti_memory_v1";

const defaultMemory: MemoryType = {
  chatHistory: [],
  learnedWords: [],
  userName: ""
};

function getLocalMemory(): MemoryType {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        chatHistory: parsed.chatHistory || [],
        learnedWords: parsed.learnedWords || [],
        userName: parsed.userName || ""
      };
    }
  } catch (e) {
    console.error("Erro ao carregar a memória local:", e);
  }
  return { ...defaultMemory };
}

function saveLocalMemory(m: MemoryType) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch (e) {
    console.error("Erro ao salvar memória local:", e);
  }
}

export const memory = {
  get chatHistory(): ChatMessage[] {
    return getLocalMemory().chatHistory;
  },
  
  set chatHistory(val: ChatMessage[]) {
    const m = getLocalMemory();
    m.chatHistory = val;
    saveLocalMemory(m);
  },

  get learnedWords(): string[] {
    return getLocalMemory().learnedWords;
  },

  set learnedWords(val: string[]) {
    const m = getLocalMemory();
    m.learnedWords = val;
    saveLocalMemory(m);
  },

  get userName(): string {
    return getLocalMemory().userName;
  },

  set userName(val: string) {
    const m = getLocalMemory();
    m.userName = val;
    saveLocalMemory(m);
  },

  addLearnedWord(word: string) {
    const m = getLocalMemory();
    const cleanWord = word.trim();
    if (cleanWord && !m.learnedWords.includes(cleanWord)) {
      m.learnedWords.push(cleanWord);
      saveLocalMemory(m);
    }
  },

  reset() {
    saveLocalMemory({ ...defaultMemory });
  }
};
