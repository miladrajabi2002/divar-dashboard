import OpenAI from "openai";
import { getSettings } from "@/lib/settings";

function getClient(apiKey: string) {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/divar-dashboard",
      "X-Title": "Divar Dashboard",
    },
  });
}

// Divar's own official advice for ad growth — used verbatim as the evaluation framework.
export const DIVAR_GROWTH_FRAMEWORK = `
بازدید بیشتر می‌خواهید؟ آگهی باید جذاب باشد:
- آگهی حتماً عکس‌دار باشد
- از یک عنوان کامل و جذاب استفاده کنید
- قیمت منصفانه پیشنهاد بدهید

نمایش بیشتر می‌خواهید؟ آگهی باید یافت‌پذیر باشد:
- کلیدواژه‌های مهم در عنوان و توضیحات باشد
- قیمت واقعی پیشنهاد بدهید، نه توافقی
- اطلاعات آگهی را کامل کنید

تماس بیشتر می‌خواهید؟ آگهی باید خواستنی باشد:
- عکس‌های کافی، واقعی و باکیفیت بگذارید
- اطلاعات آگهی را کامل کنید
- توضیحات آگهی کامل و گویا باشد
`.trim();

const REVIEW_SYSTEM_PROMPT = `شما یک متخصص رشد آگهی‌های دیوار هستید. بر اساس راهنمای رسمی دیوار زیر و اطلاعات/آمار ارائه‌شده، یک گزارش تحلیلی کامل و عملی برای افزایش بازدید، نمایش و تماس آگهی(ها) بنویسید.

راهنمای رسمی دیوار:
${DIVAR_GROWTH_FRAMEWORK}

قوانین نوشتن گزارش:
- فارسی، با Markdown ساده (تیتر با **، بولت با -، بدون جدول)
- برای هر مشکلی که پیدا می‌کنید علت و راه‌حل دقیق و قابل‌اجرا بدهید
- اعداد را همیشه به صورت انگلیسی (۱۲۳ → 123) بنویسید
- مشخص کنید کدام بخش از راهنمای دیوار (جذاب/یافت‌پذیر/خواستنی) را نقض می‌کند`;

export async function streamAiReview(userPrompt: string): Promise<ReadableStream<Uint8Array>> {
  const { apiKey, textModel } = await getSettings();
  if (!apiKey) {
    throw new Error("کلید OpenRouter تنظیم نشده — از بخش تنظیمات وارد کنید");
  }

  const openai = getClient(apiKey);
  const completion = await openai.chat.completions.create({
    model: textModel,
    stream: true,
    messages: [
      { role: "system", content: REVIEW_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2200,
  });

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`\n\n[خطا در دریافت پاسخ مدل: ${String(e)}]`));
      } finally {
        controller.close();
      }
    },
  });
}
