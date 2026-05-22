import { HardwareInfo, NavegadorInfo, WebGpuStatus, ChatMessage } from "./types";

let usandoFallbackState = false;

// 1. Detectar Telemetria de Hardware
export async function detectarHardware(): Promise<HardwareInfo> {
  const ram = (navigator as any).deviceMemory || 4; // Default to 4GB if undetected
  const cores = navigator.hardwareConcurrency || 4;
  const platform = navigator.platform || "Unknown";
  
  // Basic WebGPU adapter verification
  let gpuDetected = false;
  if ("gpu" in navigator) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) {
        gpuDetected = true;
      }
    } catch (e) {
      gpuDetected = false;
    }
  }

  return {
    memory: ram,
    cores: cores,
    gpuDetected,
    platform
  };
}

// 2. Verificar suporte real a WebGPU
export async function verificarWebGPU(): Promise<WebGpuStatus> {
  if (!("gpu" in navigator)) {
    return {
      disponivel: false,
      detalhes: "Your browser doesn't have WebGPU built-in. (Need Chrome 113+, Edge 113+, or Safari 18+)"
    };
  }

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      return {
        disponivel: false,
        detalhes: "No compatible GPU found or WebGPU is blocked in settings."
      };
    }
    
    // Check adapter info if possible
    const info = await adapter.requestAdapterInfo?.();
    const gpuName = info?.device || "Compatible WebGPU Device";
    
    return {
      disponivel: true,
      detalhes: `GPU found: ${gpuName}`
    };
  } catch (err: any) {
    return {
      disponivel: false,
      detalhes: `WebGPU error: ${err?.message || err}`
    };
  }
}

// 3. Obter dados do navegador
export function getNavegadorInfo(): NavegadorInfo {
  const ua = navigator.userAgent;
  let nome = "Unknown Browser";
  let versao = "0";

  if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) {
    nome = "Google Chrome";
    const match = ua.match(/Chrome\/([0-9.]+)/);
    if (match) versao = match[1];
  } else if (ua.includes("Edg")) {
    nome = "Microsoft Edge";
    const match = ua.match(/Edg\/([0-9.]+)/);
    if (match) versao = match[1];
  } else if (ua.includes("Firefox")) {
    nome = "Mozilla Firefox";
    const match = ua.match(/Firefox\/([0-9.]+)/);
    if (match) versao = match[1];
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    nome = "Apple Safari";
    const match = ua.match(/Version\/([0-9.]+)/);
    if (match) versao = match[1];
  }

  const vMajor = parseInt(versao.split(".")[0], 10);
  let isCompatible = false;

  if (nome === "Google Chrome" && vMajor >= 113) isCompatible = true;
  if (nome === "Microsoft Edge" && vMajor >= 113) isCompatible = true;
  if (nome === "Apple Safari" && vMajor >= 18) isCompatible = true;

  return { nome, versao, isCompatible };
}

// 4. Sugerir melhorias/dicas para WebGPU
export function sugerirAcao(navInfo: NavegadorInfo, webGpu: WebGpuStatus): string | null {
  if (webGpu.disponivel) return null;

  if (navInfo.nome === "Mozilla Firefox") {
    return "💡 Firefox has experimental WebGPU. You can enable it by going to 'about:config' and setting 'dom.webgpu.enabled' to true!";
  }
  
  if (!navInfo.isCompatible) {
    return `💡 For a faster visual experience, we recommend updating to the latest Google Chrome, Microsoft Edge, or Safari 18+!`;
  }

  return "💡 Parents: If your GPU is compatible, make sure your operating system graphics drivers are updated!";
}

// 5. Verificar se está usando Fallback
export function isUsandoFallback(): boolean {
  return usandoFallbackState;
}

// 6. Iniciar modo de Fallback (WASM/CPU/Smart Offline Assistant)
export async function iniciarFallback(progressCallback: (prog: { text: string; progress: number }) => void): Promise<boolean> {
  usandoFallbackState = true;
  
  const steps = [
    { text: "🔌 Checking offline dictionary...", progress: 0.2 },
    { text: "📖 Activating spelling games...", progress: 0.5 },
    { text: "🧠 Spinning up companion vocabulary guide...", progress: 0.8 },
    { text: "🦉 Quinti is fully awake!", progress: 1.0 }
  ];

  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    progressCallback(step);
  }

  return true;
}

// List of kid-friendly educational English templates for Fallback Mode
const FALLBACK_PATTERNS = [
  "Wow! Let's practice more English terms! In Portuguese we say `{pt}`, and in English it's `{en}`! ✨ Can you speak it aloud?",
  "That's so interesting! Did you know that `{en}` starts with the letter '{first_letter}'? How do you spell it? Let's spell together: `{spelling}`! 🦉",
  "Aha! `{en}` means `{pt}`! Here is a super cool phrase of the day:\n🌟 \"{example}\"\nTry to repeat it after me! ✨",
  "Lovely! I love `{en}`! Do you have a favorite `{category}`? Tell me in English! 🍎🐶"
];

const GREETINGS_BOT = [
  "Hello, little star! Welcome to Quinti English! Type any word to learn, or let's practice with the game cards below! 🦉✨",
  "Hi! I am Quinti, your little owl companion! What wonderful things should we learn in English today? 🌟",
  "Hello friend! Let's have fun and learn together! What's your name? 😊"
];

// 7. Responder no Fallback (WASM/CPU ou Simulador inteligente)
export async function perguntarFallback(
  messages: ChatMessage[],
  tokenCallback: (token: string) => void
): Promise<string> {
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";
  const query = lastUserMsg.toLowerCase().trim();
  
  // Wait to simulate thought latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  let finalResponse = "";

  // Dynamic responder parsing keywords
  if (query.includes("name") || query.includes("nome")) {
    finalResponse = "🦉 My name is Quinti! I am a friendly learning owl. What is yours? ✨";
  } else if (query.includes("hello") || query.includes("oi") || query.includes("hi") || query.includes("ola") || query.includes("olá")) {
    finalResponse = GREETINGS_BOT[Math.floor(Math.random() * GREETINGS_BOT.length)];
  } else if (query.includes("game") || query.includes("jogo") || query.includes("play") || query.includes("brincar")) {
    finalResponse = "🎮 Horray! Click on any word from the categories below to hear its pronunciation, learn its meaning, and see its custom illustration card! 🦉✨";
  } else if (query.includes("help") || query.includes("ajuda")) {
    finalResponse = "🦉 Tell me any object, animal, or color, and I will translate it! Or tell me your name, and I'll say hello! ✨";
  } else {
    // Generate context-aware child encouragement
    const genericEncouragements = [
      "I love learning new words with you! ✨ Can you tell me: what is your favorite animal in English? Is it a 'Dog' 🐶 or a 'Cat' 🐱?",
      "That is wonderful! Let's practice spelling. Type a word you see in the cards below to unlock stars! ⭐",
      "Excellent! You are doing fantastic! Let's read some more english words together! 🦉📖"
    ];
    finalResponse = genericEncouragements[Math.floor(Math.random() * genericEncouragements.length)];
  }

  // Stream character by character back
  const tokens = finalResponse.split(" ");
  let accumulated = "";
  for (let i = 0; i < tokens.length; i++) {
    const space = i > 0 ? " " : "";
    accumulated += space + tokens[i];
    tokenCallback(accumulated);
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  return finalResponse;
}
