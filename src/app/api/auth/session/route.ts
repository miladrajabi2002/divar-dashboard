import { NextResponse } from "next/server";
import { getActiveSession, isSessionExpired } from "@/lib/divar/auth";

// Lets the browser ask the server whether a valid Divar session exists.
// The real session lives in SQLite, so this is the source of truth for the UI.
export async function GET() {
  const session = await getActiveSession();

  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }

  return NextResponse.json({
    loggedIn: !isSessionExpired(session),
    phone: session.phone,
    expiresAt: session.expiresAt,
  });
}
