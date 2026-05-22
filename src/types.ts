export interface BaseWord {
  en: string;
  pt: string;
  emoji: string;
  example_en: string;
  example_pt: string;
}

export interface GlossaryCategory {
  title: string;
  words: BaseWord[];
}

export type Glossary = Record<string, GlossaryCategory>;

export interface ConhecimentoGlobal {
  glossary: Glossary;
}

export interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface HardwareInfo {
  memory: number; // GB of RAM
  cores: number; // Number of CPU cores
  gpuDetected: boolean;
  platform: string;
}

export interface WebGpuStatus {
  disponivel: boolean;
  detalhes: string;
}

export interface NavegadorInfo {
  nome: string;
  versao: string;
  isCompatible: boolean;
}
