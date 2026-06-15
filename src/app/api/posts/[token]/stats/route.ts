import { NextRequest, NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { getPostStats } from "@/lib/divar/stats";
import { divarErrorResponse } from "@/lib/divar/api-error";
import { db } from "@/lib/db";
import { postStats } from "@/lib/db/schema";
import type { StatTab } from "@/lib/divar/stats";

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
  const tab = (searchParams.get("tab") ?? "overview") as StatTab;
  const postToken = manageToken.slice(0, 8);

  if (!brandToken) {
    return NextResponse.json(
      { error: "brand token is required" },
      { status: 400 }
    );
  }

  try {
    const data = await getPostStats(session, brandToken, postToken, tab);

    // persist snapshot for trend charts
    if (tab === "overview") {
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
    }

    return NextResponse.json(data);
  } catch (e) {
    return divarErrorResponse(e);
  }
}
