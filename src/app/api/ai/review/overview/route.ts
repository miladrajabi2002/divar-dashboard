import { NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { getOverviewStats } from "@/lib/divar/aggregate-stats";
import { streamAiReview } from "@/lib/ai/review-stream";
import { formatNumber } from "@/lib/utils/persian";

export async function POST() {
  const session = await getActiveSession();
  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
  }

  const overview = await getOverviewStats();

  if (overview.postsWithData === 0) {
    return NextResponse.json(
      { error: "هنوز آماری ثبت نشده — برای شروع، آمار حداقل یکی از آگهی‌هایتان را یک‌بار مشاهده کنید" },
      { status: 400 }
    );
  }

  const postsList = overview.posts
    .slice(0, 25)
    .map(
      (p, i) =>
        `${i + 1}. «${p.title}» — قیمت: ${p.priceText ?? "نامشخص"} | نمایش: ${formatNumber(p.impressions)} | بازدید: ${formatNumber(p.views)} | تماس: ${formatNumber(p.contacts)} | چت: ${formatNumber(p.chats)} | جایگاه: ${p.position ? formatNumber(p.position) : "-"}`
    )
    .join("\n");

  const userPrompt = `آمار کلی همه آگهی‌های فعال من در دیوار:
- تعداد آگهی‌های دارای آمار: ${formatNumber(overview.postsWithData)}
- مجموع نمایش: ${formatNumber(overview.totals.impressions)}
- مجموع بازدید: ${formatNumber(overview.totals.views)}
- مجموع تماس: ${formatNumber(overview.totals.contacts)}
- مجموع چت: ${formatNumber(overview.totals.chats)}
- مجموع نشان‌شده: ${formatNumber(overview.totals.bookmarks)}

فهرست آگهی‌ها به همراه آمار هرکدام:
${postsList}

یک گزارش جامع بده: کدام آگهی‌ها ضعیف عمل کرده‌اند و چرا (بر اساس راهنمای دیوار)، چه اقدام مشخصی برای هرکدام پیشنهاد می‌کنی، و چه روند کلی در عملکرد همه آگهی‌ها می‌بینی.`;

  try {
    const stream = await streamAiReview(userPrompt);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e).replace("Error: ", "") }, { status: 503 });
  }
}
