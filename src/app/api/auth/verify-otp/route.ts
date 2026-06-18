import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, getActiveSession } from "@/lib/divar/auth";
import { syncPosts, syncStats } from "@/lib/divar/sync";

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();

  if (!phone || !code) {
    return NextResponse.json(
      { error: "شماره و کد الزامی است" },
      { status: 400 }
    );
  }

  const result = await verifyOtp(phone, code);

  if (!result.success) {
    return NextResponse.json(
      { error: result.message ?? "کد اشتباه است" },
      { status: 401 }
    );
  }

  // Warm the cache right after login: fetch the post list now (fast), then let the
  // heavier per-post stats sync run in the background so login stays snappy.
  try {
    const session = await getActiveSession();
    if (session) {
      await syncPosts(session);
      void syncStats(session).catch(() => {});
    }
  } catch {
    // never block login on a sync failure
  }

  return NextResponse.json({
    ok: true,
    expiresAt: result.session?.expiresAt,
  });
}
