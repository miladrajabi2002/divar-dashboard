import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { divarSessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  await db
    .update(divarSessions)
    .set({ isActive: false })
    .where(eq(divarSessions.isActive, true));

  return NextResponse.json({ ok: true });
}
