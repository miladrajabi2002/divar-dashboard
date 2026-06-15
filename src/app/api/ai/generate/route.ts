import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiGenerations } from "@/lib/db/schema";
import OpenAI from "openai";

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY ?? "placeholder",
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/divar-dashboard",
      "X-Title": "Divar Dashboard",
    },
  });
}

const MODEL = process.env.AI_MODEL ?? "anthropic/claude-sonnet-4-6";

const SYSTEM_PROMPTS: Record<string, string> = {
  title: `شما یک متخصص تبلیغات دیوار هستید. عنوان‌های جذاب، کوتاه و مؤثر برای آگهی‌های دیوار بنویسید.
عنوان‌ها باید:
- کوتاه و واضح باشند (حداکثر ۷ کلمه)
- کلمات کلیدی مهم را داشته باشند
- احساس فوریت یا ارزش ایجاد کنند
دقیقاً ۵ عنوان بنویسید، هر کدام در یک خط جداگانه.`,

  description: `شما یک کپی‌رایتر حرفه‌ای برای آگهی‌های دیوار هستید. متن آگهی جذاب و متقاعدکننده بنویسید.
متن باید:
- اطلاعات محصول را کامل توضیح دهد
- نقاط قوت را برجسته کند
- به سؤالات احتمالی خریدار پاسخ دهد
- لحن دوستانه و حرفه‌ای داشته باشد`,

  analysis: `شما یک تحلیلگر عملکرد آگهی دیوار هستید. بر اساس آمار ارائه شده، بینش‌های عملی و پیشنهادات بهبود ارائه دهید.`,

  image_prompt: `شما یک متخصص تبلیغات بصری هستید. بر اساس توضیحات محصول، یک پرامپت حرفه‌ای برای تولید تصویر با AI بنویسید.
پرامپت باید به انگلیسی باشد و جزئیات دقیق بصری، نور، و ترکیب‌بندی را توضیح دهد.`,
};

export async function POST(req: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY تنظیم نشده" },
      { status: 503 }
    );
  }

  const { type, prompt, postToken } = await req.json();

  if (!type || !prompt) {
    return NextResponse.json({ error: "type و prompt الزامی است" }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[type] ?? SYSTEM_PROMPTS.description;

  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: 1000,
  });

  const output = completion.choices[0]?.message?.content ?? "";

  await db.insert(aiGenerations).values({
    postToken: postToken ?? null,
    type,
    inputPrompt: prompt,
    output,
    model: MODEL,
  });

  return NextResponse.json({ output });
}
