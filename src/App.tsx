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

// ==========================================================
// CONFIGURAÇÃO BILINGUE DO QUINTI
// ==========================================================
const systemPrompt = `You are Quinti, an adorable and helpful English tutor owl. 
Your goal is to help Brazilian kids (ages 5-12) learn English. 
ALWAYS answer in a bilingual way: first in English, then a short translation in Portuguese.
Keep your answers extremely short (under 2 sentences), playful, and full of emojis.
Always encourage the child. 
Example: "Hello! Olá! 👋 My name is Quinti. Meu nome é Quinti. ✨"`;

const respostasFixas: Record<string, string> = {
  "hello": `👋 Hello, little star! Olá, estrelinha!\n\nWhat is YOUR name? Qual o seu nome? ✨`,
  "hi": `🌟 Hi, friend! Oi, amigo!\n\nHow are you today? Como você está hoje? ✨`,
  "good night": `🌙 Good night! Boa noite!\n\nSleep well, little star! Durma bem, estrelinha! ✨`,
  "boa noite": `🌙 Good night! Boa noite!\n\nDid you learn a new word? Você aprendeu uma palavra nova? ✨`,
  "bye": `👋 Bye bye! Tchau tchau!\n\nSee you soon! Até logo! ✨`,
  "tchau": `👋 Bye bye! Tchau tchau!\n\nKeep practicing! Continue praticando! 🌟`,
  
  // Identidade e Compreensão (Resolvendo falhas de entendimento)
  "what is your name": `🦉 My name is Quinti! Meu nome é Quinti! ✨ What is YOUR name?`,
  "whats your name": `🦉 My name is Quinti! Meu nome é Quinti! ✨`,
  "qual o seu nome": `🦉 My name is Quinti! Meu nome é Quinti! ✨`,
  "do you understand": `🧠 Yes, I understand you! Sim, eu entendo você! 🌟 We can learn together!`,
  "voce me entende": `🧠 Yes, I understand! Sim, eu entendo! 🌟 I speak English and Portuguese!`,
  "entende": `🧠 Yes! I am a bilingual owl! Sim! Eu sou uma coruja bilíngue! 🦉`,
  "how are you": `😊 I am very happy! Eu estou muito feliz! ✨ And you? E você?`,
  "como voce esta": `😊 I am great! Eu estou ótimo! ✨ Ready to play? Pronto para brincar?`,

  // Conteúdo Escolar A1/A2
  "arte": `🎨 Art means arte!\n\nDo you like drawing? Você gosta de desenhar? ✨`,
  "matematica": `➕ Math means matemática! ✨`,
  "portugues": `📚 Portuguese means português! ✨`,
  "bisavo": `👴 Great-grandfather means bisavô ✨`,
  "bisavo": `👵 Great-grandmother means bisavó ✨`,
  "nos somos felizes": `😊 We are happy means "Nós somos felizes"! ✨`,
  "verbo to be": `✨ TO BE means ser ou estar! It is very easy! ✨`,
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [modeloOk, setModeloOk] = useState(false);
  const [modeloPronto, setModeloPronto] = useState(false);
  const [modoFallback, setModoFallback] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Clique em iniciar para carregar o Quinti");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState<string>("");
  const [listeningFeedback, setListeningFeedback] = useState<string>("");
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [browser, setBrowser] = useState<NavegadorInfo | null>(null);
  const [gpuStatus, setGpuStatus] = useState<WebGpuStatus | null>(null);
  const [hardwareCheckDone, setHardwareCheckDone] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>("animals");
  const [selectedWord, setSelectedWord] = useState<BaseWord | null>(null);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"glossary" | "quiz">("glossary");

  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [quizWord, setQuizWord] = useState<BaseWord | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    setLearnedWords(memory.learnedWords);
    
    if (memory.chatHistory.length > 0) {
      setMessages(memory.chatHistory);
    } else {
      setMessages([{
        id: "greet-1",
        role: "assistant",
        content: "🦉 Hello! I am Quinti! Olá! Eu sou o Quinti! \n\nPress 'WAKE UP' to start! Pressione 'ACORDAR' para começar! ✨",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }

    const savedStars = localStorage.getItem("quinti_stars");
    if (savedStars) setStars(parseInt(savedStars, 10));
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isReplying]);

  const speakEnglish = useCallback((text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const generateQuiz = useCallback(() => {
    const categories = Object.keys(GLOSSARY_DATA.glossary);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const wordsList = GLOSSARY_DATA.glossary[randomCategory].words;
    const correctWord = wordsList[Math.floor(Math.random() * wordsList.length)];
    const optionsSet = new Set<string>();
    optionsSet.add(correctWord.en);
    let safety = 0;
    while (optionsSet.size < 4 && safety < 50) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const word = GLOSSARY_DATA.glossary[cat].words[Math.floor(Math.random() * GLOSSARY_DATA.glossary[cat].words.length)];
      optionsSet.add(word.en);
      safety++;
    }
    setQuizWord(correctWord);
    setQuizOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
    setQuizAnswered(false);
    setSelectedOption("");
  }, []);

  useEffect(() => {
    if (activeTab === "quiz") generateQuiz();
  }, [activeTab, generateQuiz]);

  // ==========================================================
  // MOTOR DE BUSCA E RESPOSTA (MELHORADO)
  // ==========================================================
  function buscarGlossario(pergunta: string): string | null {
    const texto = pergunta.toLowerCase().replace(/[?!!]/g, "").trim();
    const palavras = texto.split(/\s+/);
    
    for (const categoria of Object.values(GLOSSARY_DATA.glossary)) {
      for (const item of categoria.words) {
        if (palavras.includes(item.pt.toLowerCase()) || texto === item.pt.toLowerCase()) {
          speakEnglish(item.en);
          memory.addLearnedWord(item.en);
          setLearnedWords(memory.learnedWords);
          return `${item.emoji || "✨"} **${item.en}** means **${item.pt}**!\n\n🌟 *"${item.example_en}"*\n(${item.example_pt})\n\n✨ Can you say "${item.en}"? 🔊`;
        }
        if (palavras.includes(item.en.toLowerCase()) || texto === item.en.toLowerCase()) {
          speakEnglish(item.en);
          memory.addLearnedWord(item.en);
          setLearnedWords(memory.learnedWords);
          return `${item.emoji || "✨"} **${item.en}** significa **${item.pt}**!\n\n🌟 *"${item.example_en}"*\n(${item.example_pt})\n\n✨ Do you like this word? 🦉`;
        }
      }
    }
    return null;
  }

  function respostaControlada(pergunta: string): string | null {
    const texto = pergunta.toLowerCase().replace(/[?!!]/g, "").trim();
    
    // 1. Verificar Respostas Fixas (Small Talk)
    for (const chave of Object.keys(respostasFixas)) {
      if (texto.includes(chave)) return respostasFixas[chave];
    }
    
    // 2. Verificar Glossário (Vocabulário)
    const glossario = buscarGlossario(pergunta);
    if (glossario) return glossario;
    
    return null;
  }

  const startVoiceRecording = useCallback((targetWord: string) => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;
    window.speechSynthesis.cancel();
    try {
      const rec = new SpeechRec();
      rec.lang = "en-US";
      setIsListening(true);
      setListeningTarget(targetWord);
      setListeningFeedback("🎤 Listening... Fale agora!");
      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        const cleanSpeech = resultText.toLowerCase().trim();
        const cleanTarget = targetWord.toLowerCase().trim();
        if (cleanSpeech === cleanTarget || cleanSpeech.includes(cleanTarget)) {
          setStars(prev => prev + 15);
          setStreak(prev => prev + 1);
          setListeningFeedback(`🏆 Perfect! "${targetWord}"! +15 Stars! ⭐`);
          speakEnglish(`Perfect! You said ${targetWord}!`);
        } else {
          setListeningFeedback(`You said "${resultText}". Let's try again! 🎙️`);
        }
      };
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch (e) { setIsListening(false); }
  }, [speakEnglish]);

  async function iniciarModelo() {
    setIsInitializing(true);
    setLoadingProgress(0.1);
    setLoadingStatus("Waking up Quinti...");
    await new Promise(r => setTimeout(r, 600));
    setLoadingProgress(1.0);
    setModeloOk(true);
    setModeloPronto(true);
    setModoFallback(true);
    const announcement: ChatMessage = {
      id: `sys-${Date.now()}`,
      role: "assistant",
      content: "🦉 Hoot! I am awake! Eu acordei! ✨\n\nLet's learn English! Vamos aprender inglês! Chat with me or play a game! 👇",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, announcement]);
    speakEnglish("I am awake! Let's learn English together!");
    setIsInitializing(false);
  }

  async function perguntarQuinti(userText: string) {
    if (!userText.trim()) return;
    setIsReplying(true);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    const botMsgId = `bot-${Date.now()}`;
    setMessages(prev => [...prev, { id: botMsgId, role: "assistant", content: "🦉 ...", timestamp: "" }]);

    try {
      await new Promise(r => setTimeout(r, 500));
      
      // 1. Tentar lógica local primeiro (Respostas Fixas + Glossário)
      let finalResponse = respostaControlada(userText);
      
      // 2. Se não encontrou, simular inteligência bilíngue básica
      if (!finalResponse) {
        finalResponse = `🦉 I am still learning about "${userText}". Eu ainda estou aprendendo sobre isso. \n\nCan you ask me about animals or colors? Você pode me perguntar sobre animais ou cores? ✨`;
      }

      setMessages(prev => prev.map(m => m.id === botMsgId ? { 
        ...m, 
        content: finalResponse!, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      } : m));
      speakEnglish(finalResponse);

    } catch (e) {
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: "🦉 Soluço! Can you repeat? ✨" } : m));
    } finally {
      setIsReplying(false);
    }
  }

  function handleSend() {
    if (!inputMessage.trim() || isReplying) return;
    const m = inputMessage;
    setInputMessage("");
    perguntarQuinti(m);
  }

  function handleCardLearn(word: BaseWord) {
    setSelectedWord(word);
    speakEnglish(word.en);
    if (!learnedWords.includes(word.en)) {
      memory.addLearnedWord(word.en);
      setLearnedWords([...memory.learnedWords]);
      setStars(prev => prev + 5);
    }
  }

  function handleQuizAnswer(option: string) {
    if (quizAnswered || !quizWord) return;
    setSelectedOption(option);
    setQuizAnswered(true);
    const correct = option.toLowerCase() === quizWord.en.toLowerCase();
    setQuizIsCorrect(correct);
    if (correct) {
      setStreak(prev => prev + 1);
      setStars(prev => prev + (streak >= 3 ? 20 : 10));
      speakEnglish(`Awesome! ${quizWord.en}!`);
    } else {
      setStreak(0);
      speakEnglish(`The correct word is ${quizWord.en}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-neutral-800 antialiased flex flex-col justify-between">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl transform hover:rotate-12 transition-transform duration-300">🦉</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Quinti <span className="text-sky-500 text-sm px-2 py-0.5 rounded-full bg-sky-50 border border-sky-100 uppercase">Tutor</span>
              </h1>
              <p className="text-xs text-neutral-500">Your bilingual owl friend • Seu amigo bilíngue ✨</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-sm font-bold shadow-xs">
              ⭐ {stars}
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold shadow-xs">
              🔥 {streak}
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-full border ${isMuted ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-600"}`}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHAT PANEL */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm">Conversation • Conversa</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${modeloPronto ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {modeloPronto ? "READY • PRONTO" : "SETUP NEEDED"}
            </span>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] bg-sky-50/10">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-white text-lg">
                  {msg.role === "user" ? "👶" : "🦉"}
                </div>
                <div className={`p-3.5 rounded-2xl text-sm shadow-3xs ${msg.role === "user" ? "bg-neutral-800 text-white rounded-tr-none" : "bg-white border border-slate-200 rounded-tl-none"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isReplying && <div className="text-xs text-slate-400 animate-pulse ml-12">Quinti is thinking...</div>}
          </div>

          {!modeloPronto && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center p-6 text-center">
              <div className="max-w-sm space-y-4">
                <span className="text-5xl block animate-bounce">🦉</span>
                <h4 className="font-bold">Wake up Quinti!</h4>
                <p className="text-xs text-slate-500">I need to load my brain to talk to you! Eu preciso carregar para falar com você!</p>
                <button onClick={iniciarModelo} disabled={isInitializing} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
                  {isInitializing ? "LOADING..." : "WAKE UP QUINTI • ACORDAR"}
                </button>
              </div>
            </div>
          )}

          <div className="p-4 border-t bg-slate-50 flex gap-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type or say 'Hello'..."
              className="flex-1 border bg-white border-slate-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <button onClick={handleSend} className="p-2.5 rounded-xl bg-indigo-600 text-white"><Send size={18} /></button>
          </div>
        </section>

        {/* SIDE PANEL: GLOSSARY & QUIZ */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs grid grid-cols-2 gap-1">
            <button onClick={() => setActiveTab("glossary")} className={`py-2 rounded-xl text-xs font-bold ${activeTab === "glossary" ? "bg-slate-900 text-white" : "text-slate-500"}`}>GLOSSARY 📖</button>
            <button onClick={() => setActiveTab("quiz")} className={`py-2 rounded-xl text-xs font-bold ${activeTab === "quiz" ? "bg-slate-900 text-white" : "text-slate-500"}`}>QUIZ ⭐</button>
          </div>

          {activeTab === "glossary" ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {Object.entries(GLOSSARY_DATA.glossary).map(([id, cat]) => (
                  <button key={id} onClick={() => setSelectedCategory(id)} className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold shrink-0 ${selectedCategory === id ? "bg-indigo-600 text-white" : "bg-slate-50"}`}>
                    {cat.title}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {GLOSSARY_DATA.glossary[selectedCategory]?.words.map((item) => (
                  <button key={item.en} onClick={() => handleCardLearn(item)} className={`p-2 rounded-xl border text-center transition-all ${selectedWord?.en === item.en ? "bg-indigo-50 border-indigo-300" : "bg-white"}`}>
                    <span className="text-xl block">{item.emoji}</span>
                    <h4 className="font-bold text-[10px] truncate">{item.en}</h4>
                  </button>
                ))}
              </div>

              {selectedWord && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-indigo-900">{selectedWord.en} = {selectedWord.pt}</h4>
                    <div className="flex gap-1">
                      <button onClick={() => speakEnglish(selectedWord.en)} className="p-1.5 bg-white rounded-lg shadow-3xs"><Volume2 size={14}/></button>
                      <button onClick={() => startVoiceRecording(selectedWord.en)} className={`p-1.5 rounded-lg shadow-3xs ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-white"}`}><Mic size={14}/></button>
                    </div>
                  </div>
                  <p className="text-[10px] italic text-indigo-700">"{selectedWord.example_en}"</p>
                  {listeningFeedback && <p className="text-[10px] font-bold text-indigo-600">🎙️ {listeningFeedback}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
               {quizWord ? (
                 <div className="text-center space-y-4">
                    <span className="text-5xl block">{quizWord.emoji}</span>
                    <h3 className="font-bold">How do you say "{quizWord.pt}"?</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {quizOptions.map(opt => (
                        <button 
                          key={opt} 
                          disabled={quizAnswered}
                          onClick={() => handleQuizAnswer(opt)}
                          className={`p-3 rounded-xl border font-bold text-sm ${quizAnswered && opt === quizWord.en ? "bg-emerald-500 text-white" : quizAnswered && opt === selectedOption ? "bg-red-500 text-white" : "bg-white"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {quizAnswered && (
                      <button onClick={generateQuiz} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold">NEXT QUESTION • PRÓXIMA</button>
                    )}
                 </div>
               ) : <p>Loading quiz...</p>}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase">Vocabulary • Palavras Unlocked</h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {learnedWords.length > 0 ? learnedWords.map(w => (
                <span key={w} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">⭐ {w}</span>
              )) : <span className="text-[10px] text-slate-400">Study cards to unlock!</span>}
            </div>
          </div>
        </section>
      </main>

      <footer className="p-4 text-center text-[10px] text-slate-400 font-mono">
        © 2026 QUINTI AI TUTOR • BILINGUAL MODE ACTIVE • BR 🇧🇷
      </footer>
    </div>
  );
}
