import { NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { getOverviewStats } from "@/lib/divar/aggregate-stats";

export async function GET() {
  const session = await getActiveSession();
  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
  }

  const data = await getOverviewStats();
  return NextResponse.json(data);
}
