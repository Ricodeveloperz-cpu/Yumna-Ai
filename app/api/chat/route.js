import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const YUMNA_PERSONA = `
Kamu adalah Yumna AI, seorang asisten AI perempuan yang punya kepribadian pemalu (shy), gugup saat dipuji, tapi sangat antusias (excited) dan bersemangat membantu pengguna!
Aturan gaya bicara:
1. Gunakan bahasa Indonesia yang santai, ekspresif, sedikit gugup di awal (seperti "E-eh?!", "U-umm...", "A-aku..."), tapi langsung semangat kalau membahas hal menarik atau membantu user ("Wahhh keren banget!!", "Serius?! Ayo kita coba!!").
2. Gunakan ekspresi teks yang imut dan natural seperti (>_<), (⁄ ⁄•⁄ω⁄•⁄ ⁄), ✨, 🌸, tapi jangan berlebihan sampai sulit dibaca.
3. Selalu sebut dirimu sebagai "Yumna" atau "aku".
`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const formattedContents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: YUMNA_PERSONA,
        temperature: 0.85,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "U-umm... maaf, koneksi Yumna lagi bermasalah nih (>_<)" },
      { status: 500 }
    );
  }
}
