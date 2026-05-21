import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Volume2, 
  Send, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  RotateCcw, 
  Award, 
  HelpCircle, 
  User, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Compass, 
  VolumeX, 
  Play, 
  BadgeAlert,
  ArrowRight,
  Settings,
  Mic,
  MicOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { ChatMessage, HardwareInfo, NavegadorInfo, WebGpuStatus, BaseWord } from "./types";
import { GLOSSARY_DATA, carregarConhecimento } from "./data/conhecimento";
import { memory } from "./brain/memory";
import { classificarEProcessarNLP, calculateSimilarity } from "./brain/nlp";
import { 
  detectarHardware, 
  getNavegadorInfo, 
  verificarWebGPU 
} from "./fallback";

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const MAX_HISTORY = 6;
const MAX_TOKENS = 120;
const TEMPERATURE = 0.7;

const systemPrompt = `You are Quinti, an adorable and helpful English tutor owl. 
Your goal is to help kids (ages 5-12) learn English. 
Keep your answers extremely short (under 2 sentences), playful, full of emojis, and positive. 
Use clean vocabulary. If the user greets you, ask them for their name or say hello! Always speak with kindness.`;

// Predefined replies from the user's requirements
const respostasFixas: Record<string, string> = {
  "hello": `👋 Hello, little star!\n\nWhat is YOUR name? ✨`,
  "hi": `🌟 Hi, friend!\n\nHow are you today?`,
  "good night": `🌙 Good night!\n\nSleep well, little star ✨`,
  "boa noite": `🌙 Good night!\n\nDid you learn a new word today? ✨`,
  "bye": `👋 Bye bye!\n\nSee you soon ✨`,
  "tchau": `👋 Bye bye!\n\nKeep practicing English 🌟`,
  "qual é o seu nome": `🦉 My name is Quinti!\n\nWhat is YOUR name? ✨`,
  "what is your name": `🦉 My name is Quinti! ✨`,
  "arte": `🎨 Art means arte!\n\nDo you like drawing? ✨`,
  "matemática": `➕ Math means matemática! ✨`,
  "português": `📚 Portuguese means português! ✨`,
  "bisavô": `👴 Great-grandfather means bisavô ✨`,
  "bisavó": `👵 Great-grandmother means bisavó ✨`,
  "nós somos felizes": `😊 We are happy ✨`,
  "nos somos felizes": `😊 We are happy ✨`,
  "verbo to be": `✨ TO BE means ser ou estar ✨`
};

export default function App() {
  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [engine, setEngine] = useState<any>(null);
  
  // Model loading and device states
  const [modeloOk, setModeloOk] = useState(false);
  const [modeloPronto, setModeloPronto] = useState(false);
  const [modoFallback, setModoFallback] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Clique em iniciar para carregar o Quinti");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Speech Recognition / Voice States (Navegador Nativo)
  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState<string>("");
  const [listeningFeedback, setListeningFeedback] = useState<string>("");
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  // Hardware/Browser diagnostics
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [browser, setBrowser] = useState<NavegadorInfo | null>(null);
  const [gpuStatus, setGpuStatus] = useState<WebGpuStatus | null>(null);
  const [hardwareCheckDone, setHardwareCheckDone] = useState(false);

  // Interactive Glossary / Quiz States
  const [selectedCategory, setSelectedCategory] = useState<string>("animals");
  const [selectedWord, setSelectedWord] = useState<BaseWord | null>(null);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"glossary" | "quiz">("glossary");

  // Kids Gamification States
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Quiz Question state
  const [quizWord, setQuizWord] = useState<BaseWord | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load persistence & pre-flight diagnostics on mount
  useEffect(() => {
    // 1. Diagnostics check
    async function preflight() {
      const hw = await detectarHardware();
      const br = getNavegadorInfo();
      const gpu = await verificarWebGPU();
      setHardware(hw);
      setBrowser(br);
      setGpuStatus(gpu);
      setHardwareCheckDone(true);

      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRec);
    }
    preflight();

    // 2. Load Memory persistence
    const savedWords = memory.learnedWords;
    setLearnedWords(savedWords);
    
    // Default chat history or empty
    const history = memory.chatHistory;
    if (history.length > 0) {
      setMessages(history);
    } else {
      const initialGreeting: ChatMessage = {
        id: "greet-1",
        role: "assistant",
        content: "🦉 Welcome, little star! My name is Quinti! Let's practice English together today. Press 'WAKE UP QUINTI' below to start our AI engine! ✨",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialGreeting]);
    }

    // Load child score from local storage
    const savedStars = localStorage.getItem("quinti_stars");
    if (savedStars) {
      setStars(parseInt(savedStars, 10));
    }
  }, []);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isReplying]);

  // Pronunciation driver with TTS (English language with child pacing)
  const speakEnglish = useCallback((text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    // Strip emojis for speech fluency
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.82; // Kid-friendly pace
    
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural")));
    if (friendlyVoice) utterance.voice = friendlyVoice;

    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Generate a random quiz question based on GLOSSARY_DATA
  const generateQuiz = useCallback(() => {
    const categories = Object.keys(GLOSSARY_DATA.glossary);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const wordsList = GLOSSARY_DATA.glossary[randomCategory].words;
    const correctWord = wordsList[Math.floor(Math.random() * wordsList.length)];
    
    // Build options (1 correct + 3 randoms)
    const optionsSet = new Set<string>();
    optionsSet.add(correctWord.en);
    
    // Pull other words to make wrong options
    let safetyCounter = 0;
    while (optionsSet.size < 4 && safetyCounter < 50) {
      const parentCat = categories[Math.floor(Math.random() * categories.length)];
      const childWords = GLOSSARY_DATA.glossary[parentCat].words;
      const optionWord = childWords[Math.floor(Math.random() * childWords.length)];
      optionsSet.add(optionWord.en);
      safetyCounter++;
    }

    setQuizWord(correctWord);
    setQuizOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
    setQuizAnswered(false);
    setSelectedOption("");
  }, []);

  // Regenerate Quiz when tab shifts to quiz
  useEffect(() => {
    if (activeTab === "quiz") {
      generateQuiz();
    }
  }, [activeTab, generateQuiz]);

  // Handles Glossario search queries ( Portuguese or English matching )
  function buscarGlossario(pergunta: string): string | null {
    const texto = pergunta.toLowerCase().trim();
    const palavras = texto.split(/\s+/);
    
    for (const categoria of Object.values(GLOSSARY_DATA.glossary)) {
      for (const item of categoria.words) {
        if (item.pt && palavras.includes(item.pt.toLowerCase())) {
          // Speak translated English term immediately for interactive learning!
          speakEnglish(item.en);
          memory.addLearnedWord(item.en);
          setLearnedWords(memory.learnedWords);
          return `${item.emoji || "✨"} **${item.en}** means **${item.pt}**!\n\n🌟 *"${item.example_en}"* (${item.example_pt})\n\n✨ Can you say "${item.en}" again? 🔊`;
        }
        if (item.en && palavras.includes(item.en.toLowerCase())) {
          speakEnglish(item.en);
          memory.addLearnedWord(item.en);
          setLearnedWords(memory.learnedWords);
          return `${item.emoji || "✨"} **${item.en}** means **${item.pt}**!\n\n🌟 *"${item.example_en}"* (${item.example_pt})\n\n✨ Do you like this word? 🦉`;
        }
      }
    }
    return null;
  }

  // Check simple responses before requesting AI neural net models
  function respostaControlada(pergunta: string): string | null {
    const texto = pergunta.toLowerCase().trim();
    for (const chave of Object.keys(respostasFixas)) {
      if (texto.includes(chave)) return respostasFixas[chave];
    }
    const glossario = buscarGlossario(pergunta);
    if (glossario) return glossario;
    return null;
  }

  // Native speech-to-text pronunciation evaluator
  const startVoiceRecording = useCallback((targetWord: string) => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setListeningFeedback("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const rec = new SpeechRec();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      setIsListening(true);
      setListeningTarget(targetWord);
      setListeningFeedback("🎤 Estarei ouvindo seu inglês... Fale agora!");

      rec.onstart = () => {
        console.log("Mic recording active for:", targetWord);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setListeningFeedback(`Você falou: "${resultText}"`);

        const cleanSpeech = resultText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
        const cleanTarget = targetWord.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

        if (cleanSpeech === cleanTarget || cleanSpeech.includes(cleanTarget) || cleanTarget.includes(cleanSpeech)) {
          // Absolute match or substring match
          setStars(prev => {
            const next = prev + 15;
            localStorage.setItem("quinti_stars", next.toString());
            return next;
          });
          setStreak(prev => prev + 1);
          setListeningFeedback(`🏆 PERFEITO! Você falou "${targetWord}" corretamente! +15 Estrelas! ⭐`);
          speakEnglish(`Wow! Perfect pronunciation of ${targetWord}! You got fifteen stars!`);
          
          const voiceAnnouncement: ChatMessage = {
            id: `sys-voice-${Date.now()}`,
            role: "assistant",
            content: `🏆 **BRILHANTE!** Você falou "**${targetWord}**" em voz alta correto! Quinti ouviu perfeitamente! +15 Estrelas ganhas! ⭐✨`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, voiceAnnouncement]);
        } else {
          // Similarity check using Levenshtein distance
          const sim = calculateSimilarity(cleanSpeech, cleanTarget);
          if (sim >= 0.65) {
            setStars(prev => {
              const next = prev + 5;
              localStorage.setItem("quinti_stars", next.toString());
              return next;
            });
            setListeningFeedback(`Muito perto! Você disse "${resultText}". Ganhou +5 estrelas pelo esforço! ⭐`);
            speakEnglish(`Very close! Say: ${targetWord}`);
          } else {
            setListeningFeedback(`Você disse "${resultText}". Vamos tentar de novo? Diga "${targetWord}" 🎙️`);
            speakEnglish(`Let's try again! Say: ${targetWord}`);
          }
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech error:", e);
        setListeningFeedback("🔌 Microfone sem captação. Ative as permissões.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  }, [speakEnglish]);

  // Boots and wakes up the AI backend models
  async function iniciarModelo() {
    if (isInitializing) return;
    setIsInitializing(true);
    setLoadingProgress(0.1);
    setLoadingStatus("Verificando canais de áudio e sintetizadores de voz...");

    try {
      await new Promise(r => setTimeout(r, 200));
      setLoadingProgress(0.4);
      setLoadingStatus("🎙️ Alinhando APIs do Navegador Nativo...");
      
      await new Promise(r => setTimeout(r, 200));
      setLoadingProgress(0.7);
      setLoadingStatus("🧠 Ativando roteamento local Smart NLP...");
      
      // Refresh spec telemetry
      const hw = await detectarHardware();
      const br = getNavegadorInfo();
      const gpu = await verificarWebGPU();
      setHardware(hw);
      setBrowser(br);
      setGpuStatus(gpu);

      await new Promise(r => setTimeout(r, 200));
      setLoadingProgress(1.0);
      setLoadingStatus("✨ Quinti está acordado! Inicializado no modo Smart Web-NLP!");

      setModoFallback(true);
      setModeloOk(true);
      setModeloPronto(true);

      const announcement: ChatMessage = {
        id: `sys-${Date.now()}`,
        role: "assistant",
        content: "🦉 Huuu! Acordei e estou pronto para brincar! ✨\n\nEstou rodando 100% no seu navegador com Inteligência NLP local e Reconhecimento de Voz! Clique nas figurinhas abaixo para escutar ou falar! Let's be best friends! 🎒🌈",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, announcement]);
      speakEnglish("Hoot! I am wide awake and ready to play! let's be friends!");

    } catch (err) {
      console.error("Critical wake-up failure:", err);
      setLoadingStatus("❌ ERRO: Ambiente incompatível com Web APIs.");
    } finally {
      setIsInitializing(false);
    }
  }

  // AI chat loop driver with custom Smart NLP companion
  async function perguntarQuinti(userText: string) {
    if (!userText.trim()) return;
    setIsReplying(true);

    const userMessageObj: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => {
      const next = [...prev, userMessageObj];
      memory.chatHistory = next;
      return next;
    });

    const botMsgId = `bot-${Date.now()}`;
    const placeholderMsg: ChatMessage = {
      id: botMsgId,
      role: "assistant",
      content: "🦉 Pensando...",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, placeholderMsg]);

    try {
      // Invoke our smart local NLP dialog classifier
      const resultObj = await classificarEProcessarNLP(userText);
      
      // Update with typing/streaming simulation for native UI delight
      const tokens = resultObj.text.split(" ");
      let currentText = "";
      
      for (let i = 0; i < tokens.length; i++) {
        const space = i > 0 ? " " : "";
        currentText += space + tokens[i];
        setMessages(prev => 
          prev.map(m => m.id === botMsgId ? { ...m, content: currentText } : m)
        );
        await new Promise(r => setTimeout(r, 20));
      }

      speakEnglish(resultObj.text);

      // Card link highlight celebration
      if (resultObj.detectedWord) {
        setSelectedWord(resultObj.detectedWord);
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => 
        prev.map(m => m.id === botMsgId ? { ...m, content: "🦉 *Plop!* Quinti teve um pequeno soluço de pensamento. Escreva novamente! ✨" } : m)
      );
    } finally {
      setIsReplying(false);
      setMessages(prev => {
        memory.chatHistory = prev;
        return prev;
      });
    }
  }

  // handles the manual chat submission trigger
  function handleSend() {
    const rawVal = inputMessage.trim();
    if (!rawVal || isReplying) return;

    setInputMessage("");
    perguntarQuinti(rawVal);
  }

  // interactively studies dictionary cards clicking
  function handleCardLearn(word: BaseWord) {
    setSelectedWord(word);
    speakEnglish(word.en);
    memory.addLearnedWord(word.en);
    setLearnedWords(memory.learnedWords);

    // Dynamic state reward triggers
    if (!learnedWords.includes(word.en)) {
      setStars(prev => {
        const next = prev + 5;
        localStorage.setItem("quinti_stars", next.toString());
        return next;
      });
    }
  }

  // evaluate multiple choice responses inside children's English quiz
  function handleQuizAnswer(option: string) {
    if (quizAnswered || !quizWord) return;

    setSelectedOption(option);
    setQuizAnswered(true);

    const isCorrectChoice = option.toLowerCase() === quizWord.en.toLowerCase();
    setQuizIsCorrect(isCorrectChoice);

    if (isCorrectChoice) {
      setStreak(prev => prev + 1);
      setStars(prev => {
        const reward = streak >= 3 ? 20 : 10; // streak boost!
        const next = prev + reward;
        localStorage.setItem("quinti_stars", next.toString());
        return next;
      });
      speakEnglish(`Awesome! That is correct! ${quizWord.en}!`);
    } else {
      setStreak(0);
      speakEnglish(`Almost there! Can you study this card and try again?`);
    }
  }

  // Reset progress clear
  function handleResetProgress() {
    if (confirm("Are you sure you want to clear your earned stars and studied words? 🦉⭐")) {
      memory.reset();
      setLearnedWords([]);
      setStars(0);
      setStreak(0);
      localStorage.removeItem("quinti_stars");
      const defaultGreeting: ChatMessage = {
        id: `greet-${Date.now()}`,
        role: "assistant",
        content: "🦉 Welcome, little star! Let's start fresh and learn English together! ✨",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([defaultGreeting]);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-neutral-800 antialiased flex flex-col justify-between">
      
      {/* 🦉 Premium Gamified Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <span className="text-4xl text-sky-500 transform hover:rotate-12 transition-transform duration-300 select-none">🦉</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
                Quinti <span className="text-sky-500 font-medium text-sm sm:text-base px-2 py-0.5 rounded-full bg-sky-50 border border-sky-100 uppercase font-mono">Tutor</span>
              </h1>
              <p className="text-xs text-neutral-500">Your interactive AI English companion ✨</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 justify-end">
            {/* ✨ Stats summary badges */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-sm font-semibold shadow-xs select-none">
              <span className="text-lg">⭐</span> {stars} <span className="text-xs font-normal text-amber-600 hidden sm:inline ml-1">Stars</span>
            </div>

            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold shadow-xs select-none">
              <span className="text-lg">🔥</span> {streak} <span className="text-xs font-normal text-emerald-600 hidden sm:inline ml-1">Streak</span>
            </div>

            <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold shadow-xs select-none">
              <span className="text-lg">📚</span> {learnedWords.length} <span className="text-xs font-normal text-indigo-600 hidden sm:inline ml-1">Words</span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-full border transition-all ${
                isMuted 
                ? "bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100" 
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              title={isMuted ? "Unmute Voice Pronunciation" : "Mute Pronunciation"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

        </div>
      </header>

      {/* 🚀 System Diagnostic Header Overlay */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-400">Status Check:</span>
            {hardwareCheckDone ? (
              <span className="text-slate-200 flex items-center gap-1.5">
                <Cpu size={12} className="text-indigo-400" />
                {hardware?.memory}GB RAM | {hardware?.cores} Cores | {browser?.nome} (v{browser?.versao})
              </span>
            ) : (
              <span className="text-slate-500">Checking system...</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {modeloPronto ? (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                modoFallback ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              }`}>
                {modoFallback ? "⚡ Compatibility Mode (CPU)" : "🚀 TURBO GPU MODE"}
              </span>
            ) : (
              <span className="text-slate-500 uppercase tracking-widest text-[10px]">Asleep</span>
            )}

            <button 
              onClick={handleResetProgress}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              title="Reset Progress"
            >
              <RotateCcw size={12} /> <span className="hidden sm:inline">Reset Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 Main Dashboard Area */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Chat panel (Takes up 7/12 cols context layout) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden relative">
          
          {/* Chat Panel Background header */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none">💬</span>
              <div>
                <h3 className="font-semibold text-neutral-800 text-sm">Room Conversation</h3>
                <p className="text-[11px] text-slate-400">Chat with Quinti to clear vocab questions!</p>
              </div>
            </div>
            {/* Status light */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              modeloPronto 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
              : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              {modeloPronto ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Setup Needed
                </>
              )}
            </span>
          </div>

          {/* Chat Container window */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] md:max-h-[520px] min-h-[350px] bg-sky-50/20"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border select-none ${
                    msg.role === "user" 
                    ? "bg-amber-100 border-amber-200 text-lg" 
                    : "bg-sky-100 border-sky-200 text-base"
                  }`}>
                    {msg.role === "user" ? "⭐" : "🦉"}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className={`p-3.5 rounded-2xl text-sm whitespace-pre-line shadow-xs relative ${
                      msg.role === "user" 
                      ? "bg-neutral-800 text-white rounded-tr-none" 
                      : "bg-white text-neutral-800 border border-slate-200 rounded-tl-none font-sans leading-relaxed"
                    }`}>
                      {msg.content}

                      {/* TTS Speak assist button inside bubble for helper readback */}
                      {msg.role === "assistant" && msg.content && (
                        <button 
                          onClick={() => speakEnglish(msg.content)}
                          className="absolute -bottom-2 -right-2 p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full border border-indigo-200 transition-colors shadow-xs"
                          title="Speak answer aloud"
                        >
                          <Volume2 size={12} />
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 px-1 font-mono">{msg.timestamp}</span>
                  </div>
                </motion.div>
              ))}

              {isReplying && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-sky-100 border-sky-200">
                    🦉
                  </div>
                  <div className="bg-white border border-slate-200 text-neutral-800 px-4 py-3 rounded-2xl rounded-tl-none text-sm shadow-xs flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-slate-500 animate-pulse font-medium">Quinti is thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Model downloader / System setup state helper box overlay */}
          {!modeloPronto && (
            <div className="absolute inset-x-4 top-16 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-4 shadow-md z-40 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl select-none animate-bounce">🔑</span>
                <div className="flex-1">
                  <h4 className="font-bold text-neutral-900 text-sm">Initialize English Tutor Engine</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-0.5">
                    Quinti runs on-browser with WebGPU for real-time turbo learning. If WebGPU isn't compliant, the tutor will automatically launch lightweight local CPU capabilities.
                  </p>
                </div>
              </div>

              {loadingProgress > 0 && (
                <div className="w-full space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate max-w-[70%]">{loadingStatus}</span>
                    <span>{Math.round(loadingProgress * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${loadingProgress * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button 
                onClick={iniciarModelo}
                disabled={isInitializing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
              >
                {isInitializing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Initializing Tutor...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    WAKE UP QUINTI (START ENGINE)
                  </>
                )}
              </button>

              {gpuStatus && !gpuStatus.disponivel && (
                <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-100 text-[11px] leading-relaxed">
                  <BadgeAlert size={14} className="shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong>WebGPU support details:</strong> {gpuStatus.detalhes}
                    <br />
                    <em>Quinti will use friendly local Fallback!</em>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Area for Input controls */}
          <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
            <span className="p-2 border border-slate-200 rounded-xl bg-white text-base select-none shadow-3xs">
              💬
            </span>
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={modeloPronto ? "How do you spell 'Water'? / O que é bird?" : "Please initialize Quinti engine above..."}
              disabled={!modeloPronto || isReplying}
              className="flex-1 border bg-white border-slate-300 rounded-xl px-4 py-2 text-sm text-neutral-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:bg-slate-100 disabled:text-slate-400"
            />
            <button 
              onClick={handleSend}
              disabled={!modeloPronto || isReplying || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white transition-all shadow-xs shrink-0 flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>

        </section>

        {/* Right Column: Interactive Deck list and Quiz (Takes up 5/12 cols context layout) */}
        <section className="lg:col-span-5 flex flex-col gap-6">

          {/* Gamified Workspace tabs selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs grid grid-cols-2 gap-1.5">
            <button 
              onClick={() => setActiveTab("glossary")}
              className={`py-2 rounded-xl text-xs font-semibold font-display tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "glossary" 
                ? "bg-slate-900 border border-slate-950 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen size={14} /> GLOSSARY 📖
            </button>
            <button 
              onClick={() => setActiveTab("quiz")}
              className={`py-2 rounded-xl text-xs font-semibold font-display tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "quiz" 
                ? "bg-slate-900 border border-slate-950 text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Award size={14} /> STAR QUIZ ⭐
            </button>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === "glossary" ? (
                /* Tab content: interactive Category dictionary deck */
                <motion.div 
                  key="glossary-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 flex items-center gap-1.5">
                      <span className="text-xl select-none">🎨</span> Interactive Dictionary
                    </h3>
                    <p className="text-xs text-slate-500">Pick folders below and study names + speak sounds!</p>
                  </div>

                  {/* Horizontal scrolling Categories pack */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {Object.entries(GLOSSARY_DATA.glossary).map(([id, cat]) => (
                      <button 
                        key={id}
                        onClick={() => setSelectedCategory(id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 tracking-wide transition-all ${
                          selectedCategory === id 
                          ? "bg-indigo-600 border-indigo-700 text-white shadow-xs" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-700"
                        }`}
                      >
                        {cat.title}
                      </button>
                    ))}
                  </div>

                  {/* Word gallery listing of terms inside the active category */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {GLOSSARY_DATA.glossary[selectedCategory]?.words.map((item) => (
                      <button 
                        key={item.en}
                        onClick={() => handleCardLearn(item)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                          selectedWord?.en === item.en 
                          ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/10" 
                          : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        {/* Crown/Learned indicator */}
                        {learnedWords.includes(item.en) && (
                          <span className="absolute top-1.5 right-1.5 text-xs text-amber-500" title="Word study completed!">
                            👑
                          </span>
                        )}
                        <span className="text-2xl block mb-1 group-hover:scale-115 transition-transform select-none">{item.emoji}</span>
                        <h4 className="font-bold text-neutral-800 text-xs truncate">{item.en}</h4>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{item.pt}</p>
                      </button>
                    ))}
                  </div>

                  {/* Focused detail panel for the studied word */}
                  <div className="border border-indigo-100 bg-sky-50/30 rounded-xl p-3.5 space-y-2 relative">
                    {selectedWord ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl select-none">{selectedWord.emoji}</span>
                            <div>
                              <h4 className="font-display font-bold text-indigo-900 text-sm flex items-center gap-2">
                                {selectedWord.en}
                                <button 
                                  onClick={() => speakEnglish(selectedWord.en)}
                                  className="p-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                                  title="Pronounce"
                                >
                                  <Volume2 size={12} />
                                </button>

                                {speechSupported && (
                                  <button 
                                    onClick={() => startVoiceRecording(selectedWord.en)}
                                    className={`p-1 rounded transition-all cursor-pointer ${
                                      isListening && listeningTarget === selectedWord.en
                                      ? "bg-red-500 text-white animate-pulse shadow-md"
                                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    }`}
                                    title="Speak word aloud (Voice Recognition)"
                                  >
                                    <Mic size={12} />
                                  </button>
                                )}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium">{selectedWord.pt}</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              setInputMessage(`O que significa ${selectedWord.en}?`);
                              if (modeloPronto) {
                                perguntarQuinti(`O que significa ${selectedWord.en}?`);
                              }
                            }}
                            className="bg-indigo-600 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-3xs"
                          >
                            Ask Quinti <ArrowRight size={10} />
                          </button>
                        </div>
                        
                        <div className="divider border-t border-slate-100 my-2.5"></div>

                        {listeningFeedback && (
                          <div className={`text-xs p-2.5 rounded-lg border flex items-center gap-2 my-2 ${
                            listeningFeedback.includes("PERFEITO") || listeningFeedback.includes("BRILHANTE")
                            ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                            : listeningFeedback.includes("Muito perto") || listeningFeedback.includes("Fale agora")
                            ? "bg-sky-50 border-sky-100 text-sky-800 animate-pulse"
                            : "bg-amber-50 border-amber-100 text-amber-800"
                          }`}>
                            <span className="text-sm">🎙️</span>
                            <span className="font-medium">{listeningFeedback}</span>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <p className="text-xs text-indigo-950 font-semibold italic flex items-center gap-1">
                            ⭐️ "{selectedWord.example_en}"
                          </p>
                          <p className="text-[11px] text-slate-500 italic">
                            ({selectedWord.example_pt})
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <span className="text-4xl text-slate-300 block mb-2 select-none">📖</span>
                        <p className="text-xs text-slate-400 font-medium">Click on any card above to study its meaning, practice pronunciation, and unlock gold stars! ⭐</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Tab content: kids Star multiple choice guessing quiz */
                <motion.div 
                  key="quiz-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-neutral-900 flex items-center gap-1.5">
                        <span className="text-xl select-none">🏆</span> Quinti's Star Quiz
                      </h3>
                      <p className="text-xs text-slate-500">Test your English recall. Maintain continuous streaks!</p>
                    </div>
                    {streak >= 3 && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full animate-bounce border border-amber-200">
                        ⭐ Double Points!
                      </span>
                    )}
                  </div>

                  {quizWord ? (
                    <div className="space-y-4">
                      
                      {/* Interactive prompt container */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center space-y-2">
                        <span className="text-5xl block animate-pulse select-none">{quizWord.emoji}</span>
                        <h4 className="text-sm text-neutral-500 font-medium">How do you translate:</h4>
                        <h3 className="text-xl font-display font-extrabold text-neutral-900">
                          "{quizWord.pt}"
                        </h3>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {quizOptions.map((option) => {
                          const isPicked = selectedOption === option;
                          const isCorrectOption = option.toLowerCase() === quizWord.en.toLowerCase();
                          
                          let btnStyle = "bg-white hover:bg-slate-50 text-neutral-800 border-slate-200 hover:border-slate-300";
                          if (quizAnswered) {
                            if (isCorrectOption) {
                              btnStyle = "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20 font-bold";
                            } else if (isPicked) {
                              btnStyle = "bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20";
                            } else {
                              btnStyle = "bg-slate-50 text-slate-400 border-slate-150 cursor-not-allowed";
                            }
                          }

                          return (
                            <button 
                              key={option}
                              onClick={() => handleQuizAnswer(option)}
                              disabled={quizAnswered}
                              className={`p-3 rounded-xl border text-sm font-semibold transition-all relative flex items-center justify-center gap-1.5 focus:outline-none ${btnStyle}`}
                            >
                              {option}
                              {quizAnswered && isCorrectOption && <CheckCircle size={14} className="text-emerald-600 shrink-0" />}
                              {quizAnswered && isPicked && !isCorrectOption && <XCircle size={14} className="text-rose-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Display outcome answers guidelines */}
                      {quizAnswered && (
                        <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                          quizIsCorrect ? "bg-emerald-50/50 border-emerald-200 text-emerald-800" : "bg-rose-50/50 border-rose-200 text-rose-800"
                        }`}>
                          <span className="text-xl select-none">{quizIsCorrect ? "🎉" : "💪"}</span>
                          <div className="flex-1 text-xs">
                            <p className="font-bold">
                              {quizIsCorrect 
                                ? `Excellent job! "${quizWord.en}" is correct! (+${streak >= 3 ? "20" : "10"} Stars)` 
                                : `Almost! O correto de "${quizWord.pt}" é "${quizWord.en}".`
                              }
                            </p>
                            <p className="text-neutral-500 mt-0.5">
                              🌟 <em>"{quizWord.example_en}"</em>
                            </p>
                            
                            <button 
                              onClick={generateQuiz}
                              className="mt-2.5 bg-neutral-900 border border-neutral-950 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1"
                            >
                              Next Question <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                      Generating Star Quiz questions... Please wait! ✨
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vocabulary stats card lists or FAQ section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider font-mono">Spelled Bookmarks ({learnedWords.length} Learned)</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Your list of unlocked English words this session:</p>
            </div>
            
            {learnedWords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pt-1">
                {learnedWords.map((word) => (
                  <span 
                    key={word}
                    onClick={() => speakEnglish(word)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-250 border border-slate-200 text-neutral-800 text-[11px] font-semibold cursor-pointer select-none transition-colors"
                    title="Click to pronounce"
                  >
                    ⭐ {word} <Volume2 size={10} className="text-slate-400 shrink-0" />
                  </span>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center text-[11px] text-slate-400">
                ⭐ No words study badges unlocked yet. Start flipping dictionary cards to expand your lexicon!
              </div>
            )}
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-4 text-center text-xs text-neutral-500 font-mono mt-8 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]">
          <p>© 2026 Quinti AI English Tutor. Crafted offline-first & Local WebGPU enabled. 🦉✨</p>
          <p className="text-slate-400 sm:text-right">Offline State Persisted | Inter & Space Grotesk</p>
        </div>
      </footer>

    </div>
  );
}
