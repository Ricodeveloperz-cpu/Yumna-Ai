import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'P-promptnya kosong... Yumna bingung (>_<)' },
        { status: 400 }
      );
    }

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `A stylized, neo-brutalist digital illustration of: ${prompt}. Bold outlines, high contrast, vibrant colors.`,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = response.data[0].url;

    const yumnaResponse = {
      role: 'assistant',
      type: 'image',
      content: imageUrl,
      yumna_prefix: "U-umm... e-eh?! (⁄ ⁄•⁄ω⁄•⁄ ⁄) O-oke!! A-aku coba buatkan ya... Ini dia!! Aku s-semangat banget nih buat nunjukin ke kamu!! ✨(>_<) ✨",
    };

    return NextResponse.json(yumnaResponse);
  } catch (error) {
    console.error('Image Generation Error:', error);
    return NextResponse.json(
      { error: 'A-aduh, Yumna gagal buat gambarnya... (⁄ ⁄•⁄ω⁄•⁄ ⁄)' },
      { status: 500 }
    );
  }
}
