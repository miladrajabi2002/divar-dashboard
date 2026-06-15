import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiGenerations } from "@/lib/db/schema";
import { getSettings } from "@/lib/settings";

// Divar feed thumbnails are displayed square; the listing gallery supports
// landscape and portrait too. We generate at common ad sizes and steer the
// model toward the chosen aspect ratio via the prompt (OpenRouter image models
// don't accept an explicit width/height parameter).
export const BANNER_SIZES = {
  square: { label: "مربع (فید دیوار)", w: 1080, h: 1080, ratio: "1:1" },
  landscape: { label: "افقی", w: 1080, h: 810, ratio: "4:3" },
  portrait: { label: "عمودی", w: 1080, h: 1350, ratio: "4:5" },
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

  const fullPrompt = `Create a professional, eye-catching advertising banner image for a Divar (Iranian classifieds) listing.
Product / subject: ${prompt.trim()}
Style: clean commercial product photography, bright even lighting, sharp focus, attractive composition, high quality, photorealistic.
Aspect ratio: ${sizeCfg.ratio} (target ${sizeCfg.w}x${sizeCfg.h} pixels).
Do not add any text, watermark, or logo to the image.`;

  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/divar-dashboard",
        "X-Title": "Divar Dashboard",
      },
      body: JSON.stringify({
        model: imageModel,
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
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
    return NextResponse.json(
      { error: `OpenRouter ${res.status}: ${text.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message ?? {};

  // OpenRouter returns generated images on message.images[].image_url.url
  const images: string[] = (message.images ?? [])
    .map((img: { image_url?: { url?: string } }) => img.image_url?.url)
    .filter(Boolean);

  if (images.length === 0) {
    return NextResponse.json(
      {
        error:
          "مدل انتخاب‌شده تصویری برنگرداند. مطمئن شوید مدل از تولید تصویر پشتیبانی می‌کند (مثلاً google/gemini-2.5-flash-image-preview).",
      },
      { status: 502 }
    );
  }

  await db.insert(aiGenerations).values({
    postToken: postToken ?? null,
    type: "banner_image",
    inputPrompt: prompt.trim(),
    output: message.content?.slice(0, 500) || "[image generated]",
    model: imageModel,
  });

  return NextResponse.json({
    image: images[0],
    size: sizeCfg,
    model: imageModel,
  });
}
