import { NextResponse } from "next/server";
import { DivarError } from "./client";

/**
 * Turn any thrown error from a Divar call into a JSON response the browser can
 * always parse. Returns HTTP 200 with an `error` field (and the raw Divar
 * `detail`/`status` for debugging) so client `res.json()` never crashes on an
 * empty/HTML error body.
 */
export function divarErrorResponse(e: unknown) {
  if (e instanceof DivarError) {
    return NextResponse.json(
      {
        error: "DIVAR_ERROR",
        status: e.status,
        path: e.path,
        detail: e.detail?.slice(0, 1000) || "",
      },
      { status: 200 }
    );
  }
  return NextResponse.json(
    { error: "REQUEST_FAILED", detail: String(e).slice(0, 1000) },
    { status: 200 }
  );
}
