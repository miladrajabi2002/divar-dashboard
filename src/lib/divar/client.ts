import { buildCookieHeader } from "./auth";
import type { DivarSession } from "@/lib/db/schema";

const DIVAR_API = "https://api.divar.ir";

export async function divarFetch(
  session: DivarSession,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const cookieHeader = buildCookieHeader({
    accessToken: session.accessToken,
    frontToken: session.frontToken,
    csid: session.csid,
    did: session.did,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json-divar-filled, application/json, text/plain, */*",
    "Cookie": cookieHeader,
    "Origin": "https://divar.ir",
    "Referer": "https://divar.ir/",
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36",
    "x-api-version": "8129",
    "x-standard-divar-error": "true",
    ...(options.headers as Record<string, string> | undefined),
  };

  const url = path.startsWith("http") ? path : `${DIVAR_API}${path}`;

  return fetch(url, { ...options, headers });
}

export async function divarGet<T>(session: DivarSession, path: string): Promise<T> {
  const res = await divarFetch(session, path, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Divar API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function divarPost<T>(
  session: DivarSession,
  path: string,
  body: unknown
): Promise<T> {
  const res = await divarFetch(session, path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Divar API error ${res.status} for POST ${path}`);
  }
  return res.json() as Promise<T>;
}
