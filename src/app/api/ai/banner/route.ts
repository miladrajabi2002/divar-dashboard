import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiGenerations } from "@/lib/db/schema";
import { getSettings } from "@/lib/settings";

// Standard sizes supported by DALL-E 3 (and compatible models on OpenRouter).
// Landscape/portrait use 16:9-adjacent ratios available in the API.
export const BANNER_SIZES = {
  square:    { label: "مربع (فید دیوار)", w: 1024, h: 1024, size: "1024x1024" },
  landscape: { label: "افقی (پهن)",       w: 1792, h: 1024, size: "1792x1024" },
  portrait:  { label: "عمودی (بلند)",     w: 1024, h: 1792, size: "1024x1792" },
} as const;

type SizeKey = keyof typeof BANNER_SIZES;

export async function POST(req: NextRequest) {
  const { apiKey, imageModel } = await getSettings();

  if (!apiKey) {
    return NextResponse.json(
      { error: "کلید OpenRouter تنظیم نشده — از بخش تنظیمات وارد کنید" },
      { status: 503 }
    );
  }

  const { prompt, size, postToken } = (await req.json()) as {
    prompt?: string;
    size?: SizeKey;
    postToken?: string;
  };

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt الزامی است" }, { status: 400 });
  }

  const sizeCfg = BANNER_SIZES[size ?? "square"] ?? BANNER_SIZES.square;

  const fullPrompt = `Professional advertising banner for an Iranian classifieds listing (Divar). Subject: ${prompt.trim()}. Style: clean commercial product photography, bright even lighting, sharp focus, attractive composition, high quality, photorealistic. No text, watermarks, or logos in the image.`;

  const model = imageModel || "openai/dall-e-3";

  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/divar-dashboard",
        "X-Title": "Divar Dashboard",
      },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        n: 1,
        size: sizeCfg.size,
      }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: `خطا در اتصال به OpenRouter: ${String(e)}` },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let detail = text.slice(0, 400);
    try {
      const parsed = JSON.parse(text);
      detail = parsed?.error?.message ?? detail;
    } catch {
      // keep raw text
    }
    return NextResponse.json(
      { error: `OpenRouter ${res.status}: ${detail}` },
      { status: 502 }
    );
  }

  const data = await res.json();
  const imageUrl: string | undefined = data.data?.[0]?.url;

  if (!imageUrl) {
    return NextResponse.json(
      { error: "مدل انتخاب‌شده تصویری برنگرداند. لطفاً مدل دیگری انتخاب کنید." },
      { status: 502 }
    );
  }

  await db.insert(aiGenerations).values({
    postToken: postToken ?? null,
    type: "banner_image",
    inputPrompt: prompt.trim(),
    output: data.data?.[0]?.revised_prompt?.slice(0, 500) ?? "[image generated]",
    model,
  });

  return NextResponse.json({ image: imageUrl, size: sizeCfg, model });
}
