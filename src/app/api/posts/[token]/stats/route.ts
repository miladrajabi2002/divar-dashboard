import { NextRequest, NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { getFullPostStats } from "@/lib/divar/stats";
import { divarErrorResponse } from "@/lib/divar/api-error";
import { db } from "@/lib/db";
import { postStats, postStatsDaily } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await getActiveSession();
  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
  }

  const { token: manageToken } = await params;
  const { searchParams } = req.nextUrl;
  const brandToken = searchParams.get("brand") ?? "";
  const postToken = manageToken.slice(0, 8);

  if (!brandToken) {
    return NextResponse.json({ error: "brand token is required" }, { status: 400 });
  }

  try {
    const data = await getFullPostStats(session, brandToken, postToken);

    // Persist aggregate snapshot
    await db.insert(postStats).values({
      postToken,
      brandToken,
      impressions: data.impressions,
      views: data.views,
      contacts: data.contacts,
      bookmarks: data.bookmarks,
      chats: data.chats,
      position: data.position ?? undefined,
      category: data.category ?? undefined,
      city: data.city ?? undefined,
    });

    // Persist daily series (replace existing rows for this post so values stay fresh)
    if (data.series) {
      for (const [metric, metricData] of Object.entries(data.series)) {
        // Remove stale rows for this metric
        await db
          .delete(postStatsDaily)
          .where(
            and(
              eq(postStatsDaily.postToken, postToken),
              eq(postStatsDaily.metric, metric)
            )
          );

        // Insert fresh rows
        if (metricData.series.length > 0) {
          await db.insert(postStatsDaily).values(
            metricData.series.map((pt) => ({
              postToken,
              brandToken,
              metric,
              dateLabel: pt.label,
              value: pt.value,
              todayTotal: metricData.today,
              grandTotal: metricData.total,
            }))
          );
        }
      }
    }

    return NextResponse.json(data);
  } catch (e) {
    return divarErrorResponse(e);
  }
}
