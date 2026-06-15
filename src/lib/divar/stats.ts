import { divarPost } from "./client";
import { faToNumber } from "@/lib/utils/persian";
import type { DivarSession } from "@/lib/db/schema";
import type { PostStatsData, StatsResponse } from "./types";

export type StatTab = "overview" | "click" | "impression" | "contact" | "chat";

const STAT_TITLE_MAP: Record<string, keyof PostStatsData> = {
  "کل نمایش‌ها": "impressions",
  "کل بازدیدها": "views",
  "کل تماس‌ها": "contacts",
  "کل نشان‌کردن‌ها": "bookmarks",
  "کل چت‌ها": "chats",
};

export async function getPostStats(
  session: DivarSession,
  brandToken: string,
  postToken: string,
  tab: StatTab = "overview"
): Promise<PostStatsData> {
  const data = await divarPost<StatsResponse>(
    session,
    `/v8/post-stats/insight/detail/${brandToken}/${postToken}`,
    { brand_token: brandToken, tab }
  );

  const widgets =
    (data.pages?.[tab]?.widget_list ?? data.page?.widget_list) ?? [];

  const stats: PostStatsData = {
    impressions: 0,
    views: 0,
    contacts: 0,
    bookmarks: 0,
    chats: 0,
    position: null,
    category: null,
    city: null,
  };

  for (const w of widgets) {
    if (w.widget_type === "SCORE_ROW") {
      const d = w.data as Record<string, unknown>;
      const title = d.title as string;
      const score = d.descriptive_score as string;

      const field = STAT_TITLE_MAP[title];
      if (field && score) {
        (stats as unknown as Record<string, unknown>)[field] = faToNumber(score);
      }

      if (title?.includes("جایگاه")) {
        const match = score?.match(/[\d۰-۹]+/);
        if (match) stats.position = faToNumber(match[0]);
      }
    }

    if (w.widget_type === "TAG_LIST_ROW") {
      const d = w.data as Record<string, unknown>;
      const tags = d.tags as Array<{ text: string }> | undefined;
      if (tags) {
        for (const tag of tags) {
          if (tag.text && !stats.city && !tag.text.includes("بندی")) {
            stats.city = tag.text;
          } else if (tag.text) {
            stats.category = tag.text;
          }
        }
      }
    }
  }

  return stats;
}
