import { db } from "@/lib/db";
import { postStats, postStatsDaily, postsCache } from "@/lib/db/schema";
import { parsePersianDateLabel } from "@/lib/utils/persian";

export interface PostOverviewRow {
  postToken: string;
  title: string;
  priceText: string | null;
  imageUrl: string | null;
  status: string | null;
  impressions: number;
  views: number;
  contacts: number;
  bookmarks: number;
  chats: number;
  position: number | null;
  fetchedAt: number | null;
}

export interface OverviewSeriesPoint {
  label: string;
  impression: number;
  click: number;
  contact: number;
  chat: number;
}

export interface OverviewStats {
  totals: {
    impressions: number;
    views: number;
    contacts: number;
    bookmarks: number;
    chats: number;
  };
  series: OverviewSeriesPoint[];
  posts: PostOverviewRow[];
  postsWithData: number;
}

// Builds dashboard-wide stats from data already cached locally (post_stats / post_stats_daily),
// populated whenever the user has opened at least one post's stats page. Avoids an N-call
// fan-out to Divar (which would need a brandToken per post) just to render the overview.
export async function getOverviewStats(): Promise<OverviewStats> {
  const [allStats, allDaily, allCached] = await Promise.all([
    db.select().from(postStats),
    db.select().from(postStatsDaily),
    db.select().from(postsCache),
  ]);

  const latestByToken = new Map<string, (typeof allStats)[number]>();
  for (const row of allStats) {
    const existing = latestByToken.get(row.postToken);
    if (
      !existing ||
      (row.fetchedAt && existing.fetchedAt && row.fetchedAt > existing.fetchedAt)
    ) {
      latestByToken.set(row.postToken, row);
    }
  }

  const cacheByToken = new Map<string, (typeof allCached)[number]>();
  for (const row of allCached) {
    cacheByToken.set(row.postToken, row);
  }

  const posts: PostOverviewRow[] = Array.from(latestByToken.values()).map((s) => {
    const cache = cacheByToken.get(s.postToken);
    return {
      postToken: s.postToken,
      title: cache?.title ?? "آگهی بدون عنوان",
      priceText: cache?.priceText ?? null,
      imageUrl: cache?.imageUrl ?? null,
      status: cache?.status ?? null,
      impressions: s.impressions ?? 0,
      views: s.views ?? 0,
      contacts: s.contacts ?? 0,
      bookmarks: s.bookmarks ?? 0,
      chats: s.chats ?? 0,
      position: s.position ?? null,
      fetchedAt: s.fetchedAt ? s.fetchedAt.getTime() : null,
    };
  });

  const totals = posts.reduce(
    (acc, p) => {
      acc.impressions += p.impressions;
      acc.views += p.views;
      acc.contacts += p.contacts;
      acc.bookmarks += p.bookmarks;
      acc.chats += p.chats;
      return acc;
    },
    { impressions: 0, views: 0, contacts: 0, bookmarks: 0, chats: 0 }
  );

  const seriesMap = new Map<string, OverviewSeriesPoint>();
  for (const row of allDaily) {
    const point =
      seriesMap.get(row.dateLabel) ??
      { label: row.dateLabel, impression: 0, click: 0, contact: 0, chat: 0 };
    const value = row.value ?? 0;
    if (row.metric === "impression") point.impression += value;
    else if (row.metric === "click") point.click += value;
    else if (row.metric === "contact") point.contact += value;
    else if (row.metric === "chat") point.chat += value;
    seriesMap.set(row.dateLabel, point);
  }
  const series = Array.from(seriesMap.values()).sort(
    (a, b) => parsePersianDateLabel(a.label) - parsePersianDateLabel(b.label)
  );

  return {
    totals,
    series,
    posts: posts.sort((a, b) => b.impressions - a.impressions),
    postsWithData: posts.length,
  };
}
