"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Sparkles,
  Trash2,
  Camera,
  Download,
  Volume2,
  VolumeX,
  Palette,
  MessageSquare,
} from "lucide-react";

// Web Audio API untuk efek suara interaksi
const playSound = (type, muted) => {
  if (muted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "send") {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "success") {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {}
};

const THEMES = [
  { name: "Classic Yellow", bg: "#FFEB3B", accent: "#FF6B9E", sidebar: "#4ECDC4" },
  { name: "Cyberpunk Neon", bg: "#00FFCC", accent: "#FF007F", sidebar: "#FFE600" },
  { name: "Sunset Pink", bg: "#FF9999", accent: "#9900FF", sidebar: "#FFCC00" },
  { name: "Mint Fresh", bg: "#A8E6CF", accent: "#DCEDC1", sidebar: "#FFD3B6" },
];

export default function YumnaStudio() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "text",
      content:
        "E-eh?! Halo!! (⁄ ⁄•⁄ω⁄•⁄ ⁄) A-aku **Yumna AI**! Senang banget kamu mampir ke studio aku!! ✨\n\nSekarang aku bisa ngobrol dan **buatkan gambar** juga lho! Mau coba ketik sesuatu atau pilih menu di samping? (>_<)[span_2](start_span)[span_2](end_span)",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState("SHY (>_<)");
  const [shyness, setShyness] = useState(40);
  const [excitement, setExcitement] = useState(70);
  const [muted, setMuted] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);

  const currentTheme = THEMES[themeIndex];
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleDownloadImage = async (url) => {
    playSound("click", muted);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `yumna-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert("U-umm... gagal mendownload gambarnya! (>_<)");
    }
  };

  const handleAction = async (textPrompt, mode = "text") => {
    const text = textPrompt || input;
    if (!text.trim() || isLoading) return;

    playSound("send", muted);
    const userMsg = { role: "user", type: "text", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setMood("THINKING (・_・;)");

    if (mode === "text") {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, userMsg] }),
        });
        const data = await res.json();

        if (data.reply) {
          setMessages((prev) => [...prev, { role: "assistant", type: "text", content: data.reply }]);
          setMood("EXCITED! ✨(^◡^✿)");
          setShyness(Math.max(10, shyness - 5));
          setExcitement(Math.min(100, excitement + 10));
          playSound("success", muted);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setMood("SHY (>_<)");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", type: "text", content: "A-aduh, koneksi Yumna terputus... (>_<)" },
        ]);
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "image") {
      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        const data = await res.json();

        if (data.type === "image") {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", type: "text", content: data.yumna_prefix },
            { role: "assistant", type: "image", content: data.content },
          ]);
          setMood("EXCITED! ✨(^◡^✿)");
          setExcitement(100);
          playSound("success", muted);
        } else {
          throw new Error();
        }
      } catch (err) {
        setMood("SHY (>_<)");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", type: "text", content: "U-umm... Yumna gagal buat gambarnya... (⁄ ⁄•⁄ω⁄•⁄ ⁄)" },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-2 sm:p-4 font-sans text-black">
      <div
        className="w-full max-w-4xl neo-box flex flex-col h-[92vh] overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: currentTheme.bg }}
      >
        {/* Title Bar */}
        <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between border-b-[3px] border-black">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] inline-block border border-black" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] inline-block border border-black" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] inline-block border border-black" />
            <span className="ml-2 font-bold text-xs sm:text-sm tracking-wider uppercase">
              Yumna AI Studio v2.5[span_3](start_span)[span_3](end_span)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSound("click", muted);
                setThemeIndex((prev) => (prev + 1) % THEMES.length);
              }}
              className="bg-white text-black px-2 py-0.5 text-xs font-black neo-button flex items-center gap-1 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" /> Tema
            </button>
            <button
              onClick={() => setMuted(!muted)}
              className="bg-white text-black p-1 neo-button cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div
            className="w-full md:w-64 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black p-4 flex flex-col gap-4 overflow-y-auto shrink-0"
            style={{ backgroundColor: currentTheme.sidebar }}
          >
            <div className="bg-white neo-box-sm p-3 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#FF6B9E] neo-box-sm flex items-center justify-center mb-2 font-black text-3xl">
                🌸
              </div>
              <div className="bg-black text-white px-3 py-1 font-bold text-xs uppercase neo-box-sm mb-2 w-full truncate">
                {mood}
              </div>

              <div className="w-full text-left text-xs font-bold space-y-2 mt-1">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>SHYNESS</span>
                    <span>{shyness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 neo-box-sm overflow-hidden p-0.5">
                    <div className="bg-[#FF6B9E] h-full transition-all duration-300" style={{ width: `${shyness}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span>EXCITEMENT</span>
                    <span>{excitement}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 neo-box-sm overflow-hidden p-0.5">
                    <div className="bg-[#A3E635] h-full transition-all duration-300" style={{ width: `${excitement}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-wide">⚡ Quick Actions</span>
              <button
                onClick={() => handleAction("Hai Yumna, kenalan dong! ✨", "text")}
                className="bg-white hover:bg-[#FFF9C4] p-2 text-xs font-bold text-left neo-button flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" /> Kenalan & Ngobrol
              </button>
              <button
                onClick={() => handleAction("Seekor anak kucing imut bermain benang di taman", "image")}
                className="bg-white hover:bg-[#FFF9C4] p-2 text-xs font-bold text-left neo-button flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 shrink-0 text-[#FF6B9E]" /> Buat Gambar Kucing Imut
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-[#FFFDF7] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div key={idx} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <span className="text-xs font-black uppercase mb-1 px-1">
                      {isUser ? "Kamu" : "🌸 Yumna AI"}
                    </span>

                    {msg.type === "text" ? (
                      <div
                        className={`max-w-[85%] p-3.5 neo-box-sm text-sm sm:text-base leading-relaxed ${
                          isUser ? "bg-[#A3E635] text-black" : "bg-[#C4B5FD] text-black"
                        }`}
                      >
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="neo-box-sm p-2 bg-white flex flex-col gap-2 max-w-[280px]">
                        <img src={msg.content} alt="Generated" className="w-full h-auto border-2 border-black" />
                        <button
                          onClick={() => handleDownloadImage(msg.content)}
                          className="bg-[#4ECDC4] hover:bg-[#3dbdb4] text-black font-black text-xs py-2 px-3 neo-button flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Download Gambar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <span className="text-xs font-black uppercase mb-1 px-1">🌸 Yumna AI</span>
                  <div className="bg-[#C4B5FD] p-3.5 neo-box-sm font-bold text-sm animate-pulse">
                    E-eh sebentar ya, Yumna lagi proses... (⁄ ⁄•⁄ω⁄•⁄ ⁄)
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div
              className="p-3.5 border-t-[3px] border-black flex gap-2 items-center"
              style={{ backgroundColor: currentTheme.sidebar }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction(null, "text")}
                placeholder="Ketik pesan atau instruksi gambar..."
                disabled={isLoading}
                className="flex-1 bg-white neo-box-sm px-3.5 py-3 font-bold text-sm sm:text-base focus:outline-none focus:bg-[#FFF9C4]"
              />
              <button
                onClick={() => handleAction(null, "text")}
                disabled={isLoading || !input.trim()}
                className="bg-[#FF6B9E] px-4 py-3 neo-button font-black uppercase text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <span className="hidden sm:inline">Kirim</span>
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => handleAction(null, "image")}
                disabled={isLoading || !input.trim()}
                className="bg-[#4ECDC4] px-4 py-3 neo-button font-black uppercase text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Gambar</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="bg-black text-white text-[11px] font-bold px-4 py-1.5 flex justify-between items-center border-t-[3px] border-black">
          <span>✨ Neobrutalism AI Chat Studio</span>
          <span>Powered by Gemini & Vercel</span>
        </footer>
      </div>
    </main>
  );
}
