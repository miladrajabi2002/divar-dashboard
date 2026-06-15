import { db } from "@/lib/db";
import { divarSessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { parseJwtExpiry } from "@/lib/utils/persian";
import type { DivarSessionCookies } from "./types";

const DIVAR_API = "https://api.divar.ir";

function buildHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    "Origin": "https://divar.ir",
    "Referer": "https://divar.ir/",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36",
    "x-api-version": "8129",
    ...extra,
  };
}

export async function sendOtp(phone: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${DIVAR_API}/v5/auth/authenticate`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ phone }),
  });

  if (res.ok || res.status === 201) {
    return { success: true };
  }

  const text = await res.text().catch(() => "");
  return { success: false, message: text || `خطا: ${res.status}` };
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ success: boolean; session?: DivarSessionCookies; message?: string }> {
  const res = await fetch(`${DIVAR_API}/v5/auth/confirm`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ phone, code }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { success: false, message: text || "کد اشتباه است" };
  }

  const setCookies = res.headers.getSetCookie?.() ?? [];
  const cookieHeader = res.headers.get("set-cookie") ?? "";
  const allCookies = setCookies.length > 0 ? setCookies : [cookieHeader];

  const parseCookie = (name: string): string => {
    for (const c of allCookies) {
      const match = c.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      if (match) return match[1];
    }
    return "";
  };

  let accessToken = parseCookie("sAccessToken");
  let frontToken = parseCookie("sFrontToken");
  let csid = parseCookie("csid");
  let did = parseCookie("did");

  // fallback: parse from JSON body if cookies not set
  if (!accessToken) {
    try {
      const body = await res.clone().json();
      accessToken = body.token ?? body.sAccessToken ?? "";
    } catch {
      // ignore
    }
  }

  if (!accessToken) {
    return { success: false, message: "توکن دریافت نشد — لطفاً دوباره تلاش کنید" };
  }

  const expiresAt = parseJwtExpiry(accessToken);

  const session: DivarSessionCookies = { accessToken, frontToken, did, csid, expiresAt };

  // deactivate old sessions for this phone
  await db
    .update(divarSessions)
    .set({ isActive: false })
    .where(eq(divarSessions.phone, phone));

  // store new session
  await db.insert(divarSessions).values({
    phone,
    accessToken,
    frontToken: frontToken || null,
    did: did || null,
    csid: csid || null,
    expiresAt,
    isActive: true,
  });

  return { success: true, session };
}

export async function getActiveSession() {
  const sessions = await db
    .select()
    .from(divarSessions)
    .where(eq(divarSessions.isActive, true))
    .orderBy(desc(divarSessions.createdAt))
    .limit(1);

  return sessions[0] ?? null;
}

export function isSessionExpired(session: { expiresAt: Date | null }): boolean {
  if (!session.expiresAt) return true;
  return session.expiresAt.getTime() < Date.now() + 5 * 60 * 1000; // 5min buffer
}

export function buildCookieHeader(session: {
  accessToken: string;
  frontToken: string | null;
  csid: string | null;
  did: string | null;
}): string {
  const parts = [`sAccessToken=${session.accessToken}`];
  if (session.frontToken) parts.push(`sFrontToken=${session.frontToken}`);
  if (session.csid) parts.push(`csid=${session.csid}`);
  if (session.did) parts.push(`did=${session.did}`);
  return parts.join("; ");
}
