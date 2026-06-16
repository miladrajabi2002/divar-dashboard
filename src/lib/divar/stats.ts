import { divarPost } from "./client";
import { faToNumber } from "@/lib/utils/persian";
import type { DivarSession } from "@/lib/db/schema";
import type {
  PostStatsData,
  MetricData,
  ChartPoint,
  StatsResponse,
  DivarWidget,
} from "./types";

export type StatTab = "overview" | "click" | "impression" | "contact" | "chat";

const SCORE_TITLE_MAP: Record<string, keyof PostStatsData> = {
  "کل نمایش‌ها": "impressions",
  "کل بازدیدها": "views",
  "کل تماس‌ها": "contacts",
  "کل نشان‌کردن‌ها": "bookmarks",
  "کل چت‌ها": "chats",
};

function parseOverviewWidgets(widgets: DivarWidget[]): Omit<PostStatsData, "series"> {
  const stats: Omit<PostStatsData, "series"> = {
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

      const field = SCORE_TITLE_MAP[title];
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

function parseMetricWidgets(widgets: DivarWidget[]): MetricData {
  let today = 0;
  let total = 0;
  const series: ChartPoint[] = [];

  for (const w of widgets) {
    if (w.widget_type === "UNEXPANDABLE_ROW") {
      const d = w.data as Record<string, unknown>;
      const title = (d.title as string) ?? "";
      const rawVal = (d.value as string) ?? "0";
      const value = faToNumber(rawVal);
      if (title.includes("امروز")) today = value;
      else if (title.includes("کل")) total = value;
    }

    if (w.widget_type === "LINE_CHART_ROW") {
      const d = w.data as Record<string, unknown>;
      const points = (d.points as Array<{ label: string; y: number; tooltip?: string }>) ?? [];
      for (const p of points) {
        series.push({ label: p.label, value: p.y });
      }
    }
  }

  return { today, total, series };
}

/** Fetches all stats tabs in one API call and returns complete data with daily series. */
export async function getFullPostStats(
  session: DivarSession,
  brandToken: string,
  postToken: string
): Promise<PostStatsData> {
  const data = await divarPost<StatsResponse>(
    session,
    `/v8/post-stats/insight/detail/${brandToken}/${postToken}`,
    { brand_token: brandToken, tab: "overview" }
  );

  const overviewWidgets =
    data.pages?.overview?.widget_list ?? data.page?.widget_list ?? [];

  const totals = parseOverviewWidgets(overviewWidgets);

  const series = {
    impression: parseMetricWidgets(data.pages?.impression?.widget_list ?? []),
    click:      parseMetricWidgets(data.pages?.click?.widget_list ?? []),
    contact:    parseMetricWidgets(data.pages?.contact?.widget_list ?? []),
    chat:       parseMetricWidgets(data.pages?.chat?.widget_list ?? []),
  };

  // Fill totals from series if SCORE_ROW was empty (overview tab sometimes lags)
  if (!totals.impressions && series.impression.total)
    totals.impressions = series.impression.total;
  if (!totals.views && series.click.total)
    totals.views = series.click.total;
  if (!totals.contacts && series.contact.total)
    totals.contacts = series.contact.total;
  if (!totals.chats && series.chat.total)
    totals.chats = series.chat.total;

  return { ...totals, series };
}

/** Legacy single-tab fetch kept for backwards compatibility. */
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

  return { ...parseOverviewWidgets(widgets) };
}
