import { NextRequest, NextResponse } from "next/server";
import {
  getPublicSettings,
  writeSetting,
  SETTING_KEYS,
} from "@/lib/settings";

export async function GET() {
  const settings = await getPublicSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { apiKey, textModel, imageModel } = body as {
    apiKey?: string;
    textModel?: string;
    imageModel?: string;
  };

  // Only overwrite the API key when a non-empty value is provided, so saving
  // model changes doesn't wipe an existing key (the UI sends it masked/blank).
  if (typeof apiKey === "string" && apiKey.trim() && !apiKey.includes("…")) {
    await writeSetting(SETTING_KEYS.apiKey, apiKey.trim());
  }
  if (typeof textModel === "string" && textModel.trim()) {
    await writeSetting(SETTING_KEYS.textModel, textModel.trim());
  }
  if (typeof imageModel === "string" && imageModel.trim()) {
    await writeSetting(SETTING_KEYS.imageModel, imageModel.trim());
  }

  const settings = await getPublicSettings();
  return NextResponse.json({ ok: true, ...settings });
}
