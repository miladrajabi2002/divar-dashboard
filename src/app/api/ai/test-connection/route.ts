import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const { apiKey } = await getSettings();

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: "no_key",
      message: "کلید API تنظیم نشده است",
    });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: "invalid_key",
        message: `کلید نامعتبر است (${res.status})`,
      });
    }

    const json = await res.json();
    const d = json.data ?? {};

    return NextResponse.json({
      ok: true,
      label: d.label ?? null,
      usage: typeof d.usage === "number" ? d.usage : null,
      limit: typeof d.limit === "number" ? d.limit : null,
      is_free_tier: d.is_free_tier ?? false,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: "network",
      message: `خطای شبکه: ${String(e)}`,
    });
  }
}
