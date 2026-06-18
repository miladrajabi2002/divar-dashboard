import { NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { getOverviewStats } from "@/lib/divar/aggregate-stats";
import { db } from "@/lib/db";
import { statsSnapshots } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const session = await getActiveSession();
  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
  }

  const data = await getOverviewStats();

  // Latest 48 hourly snapshots (oldest → newest) for the hourly growth chart.
  const rows = await db
    .select()
    .from(statsSnapshots)
    .orderBy(desc(statsSnapshots.createdAt))
    .limit(48);

  const snapshots = rows
    .reverse()
    .map((s) => ({
      t: s.createdAt ? s.createdAt.getTime() : 0,
      impressions: s.impressions ?? 0,
      views: s.views ?? 0,
      contacts: s.contacts ?? 0,
      chats: s.chats ?? 0,
    }));

  return NextResponse.json({ ...data, snapshots });
}
