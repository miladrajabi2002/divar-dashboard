import { buildCookieHeader } from "./auth";
import type { DivarSession } from "@/lib/db/schema";

const DIVAR_API = "https://api.divar.ir";

/** Error that preserves the Divar HTTP status and raw response body. */
export class DivarError extends Error {
  status: number;
  detail: string;
  path: string;
  constructor(status: number, path: string, detail: string) {
    super(`Divar API error ${status} for ${path}`);
    this.name = "DivarError";
    this.status = status;
    this.path = path;
    this.detail = detail;
  }
}

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
    "Authorization": `Bearer ${session.accessToken}`,
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
    const detail = await res.text().catch(() => "");
    throw new DivarError(res.status, path, detail);
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
    const detail = await res.text().catch(() => "");
    throw new DivarError(res.status, path, detail);
  }
  return res.json() as Promise<T>;
}
