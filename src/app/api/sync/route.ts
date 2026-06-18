import { NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";
import { syncPosts, syncStats } from "@/lib/divar/sync";

// Manual "refresh now" — pulls the post list and all stats, then returns fresh.
export async function POST() {
  const session = await getActiveSession();
  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "SESSION_EXPIRED" }, { status: 401 });
  }

  try {
    const posts = await syncPosts(session);
    const synced = await syncStats(session);
    return NextResponse.json({ ok: true, posts, synced, lastSync: Date.now() });
  } catch (e) {
    return NextResponse.json(
      { error: String(e).replace("Error: ", "") },
      { status: 502 }
    );
  }
}
