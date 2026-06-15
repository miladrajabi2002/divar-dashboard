import { NextRequest, NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { getMyPosts } from "@/lib/divar/posts";
import { divarErrorResponse } from "@/lib/divar/api-error";
import type { PostTab } from "@/lib/divar/posts";

export async function GET(req: NextRequest) {
  const session = await getActiveSession();

  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const tab = (searchParams.get("tab") ?? "all") as PostTab;
  const lastIdentifier = searchParams.get("last") ?? "";

  try {
    const result = await getMyPosts(session, tab, lastIdentifier);
    return NextResponse.json(result);
  } catch (e) {
    return divarErrorResponse(e);
  }
}
