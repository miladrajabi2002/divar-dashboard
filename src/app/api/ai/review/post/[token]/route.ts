import { NextRequest, NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { db } from "@/lib/db";
import { postStats, postsCache } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { streamAiReview } from "@/lib/ai/review-stream";
import { formatNumber } from "@/lib/utils/persian";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getActiveSession();
  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
  }

  const { token: manageToken } = await params;
  const postToken = manageToken.slice(0, 8);

  const body = await req.json().catch(() => ({}));
  const title: string = body.title ?? "";
  const priceText: string = body.priceText ?? "";
  const location: string = body.location ?? "";
  const imageCount: number = body.imageCount ?? 0;

  const [statsRow] = await db
    .select()
    .from(postStats)
    .where(eq(postStats.postToken, postToken))
    .orderBy(desc(postStats.fetchedAt))
    .limit(1);

  const [cacheRow] = await db
    .select()
    .from(postsCache)
    .where(eq(postsCache.postToken, postToken))
    .limit(1);

  const finalTitle = title || cacheRow?.title || "نامشخص";
  const finalPrice = priceText || cacheRow?.priceText || "نامشخص";
  const finalLocation = location || cacheRow?.location || "نامشخص";
  const finalImageCount = imageCount || cacheRow?.imageCount || 0;

  const statsText = statsRow
    ? `- نمایش: ${formatNumber(statsRow.impressions ?? 0)}\n- بازدید: ${formatNumber(statsRow.views ?? 0)}\n- تماس: ${formatNumber(statsRow.contacts ?? 0)}\n- چت: ${formatNumber(statsRow.chats ?? 0)}\n- نشان‌شده: ${formatNumber(statsRow.bookmarks ?? 0)}\n- جایگاه: ${statsRow.position ? formatNumber(statsRow.position) : "نامشخص"}`
    : "هنوز آماری برای این آگهی ثبت نشده — از داشبورد روی «بروزرسانی» بزنید.";

  const userPrompt = `اطلاعات این آگهی دیوار:
- عنوان: ${finalTitle}
- قیمت: ${finalPrice}
- موقعیت: ${finalLocation}
- تعداد عکس: ${formatNumber(finalImageCount)}

آمار آگهی:
${statsText}

بر اساس راهنمای رسمی دیوار، این آگهی را تحلیل کن: عنوان، قیمت و تعداد عکس چه مشکلی دارند؟ دقیقاً چه تغییری در عنوان/قیمت/تعداد عکس باعث افزایش بازدید، نمایش و تماس می‌شود؟ اگر آماری موجود است آن را هم در تحلیل لحاظ کن.`;

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
