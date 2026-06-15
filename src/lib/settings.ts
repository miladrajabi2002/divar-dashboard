import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Application settings are stored in the `app_settings` key/value table so they
 * can be edited from the dashboard at runtime. Environment variables act as a
 * fallback default when a key has not been set in the database yet.
 */

export const SETTING_KEYS = {
  apiKey: "openrouter_api_key",
  textModel: "text_model",
  imageModel: "image_model",
} as const;

export const DEFAULT_TEXT_MODEL = "anthropic/claude-sonnet-4-6";
export const DEFAULT_IMAGE_MODEL = "openai/dall-e-3";

export type AppSettings = {
  apiKey: string;
  textModel: string;
  imageModel: string;
};

async function readRaw(key: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);
  return rows[0]?.value ?? null;
}

export async function writeSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

/** Resolved settings with env fallback. Used by server-side AI routes. */
export async function getSettings(): Promise<AppSettings> {
  const [apiKey, textModel, imageModel] = await Promise.all([
    readRaw(SETTING_KEYS.apiKey),
    readRaw(SETTING_KEYS.textModel),
    readRaw(SETTING_KEYS.imageModel),
  ]);

  return {
    apiKey: apiKey || process.env.OPENROUTER_API_KEY || "",
    textModel: textModel || process.env.AI_MODEL || DEFAULT_TEXT_MODEL,
    imageModel:
      imageModel || process.env.AI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
  };
}

/** Settings safe to send to the browser (never expose the full API key). */
export async function getPublicSettings(): Promise<{
  hasApiKey: boolean;
  apiKeyMasked: string;
  textModel: string;
  imageModel: string;
}> {
  const s = await getSettings();
  const masked = s.apiKey
    ? `${s.apiKey.slice(0, 8)}…${s.apiKey.slice(-4)}`
    : "";
  return {
    hasApiKey: Boolean(s.apiKey),
    apiKeyMasked: masked,
    textModel: s.textModel,
    imageModel: s.imageModel,
  };
}
