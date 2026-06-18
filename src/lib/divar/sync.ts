import { db } from "@/lib/db";
import {
  postsCache,
  postStats,
  postStatsDaily,
  statsSnapshots,
} from "@/lib/db/schema";
import type { DivarSession } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveSession, isSessionExpired } from "./auth";
import { getMyPosts, getManagementPage } from "./posts";
import { getFullPostStats } from "./stats";
import { getOverviewStats } from "./aggregate-stats";
import { writeSetting } from "@/lib/settings";
import type { PostRowData } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Prevent overlapping stats syncs (login trigger + cron could collide).
let statsSyncRunning = false;

/**
 * Fetch the full post list from Divar (all pages) and upsert it into posts_cache.
 * Fast — list endpoint only. Returns number of posts cached.
 */
export async function syncPosts(session: DivarSession): Promise<number> {
  const all: PostRowData[] = [];
  let last = "";
  for (let page = 0; page < 25; page++) {
    const { posts, nextIdentifier } = await getMyPosts(session, "all", last);
    all.push(...posts);
    if (!nextIdentifier || posts.length === 0) break;
    last = nextIdentifier;
  }

  for (const p of all) {
    const postToken = p.manageToken.slice(0, 8);
    const existing = await db
      .select()
      .from(postsCache)
      .where(eq(postsCache.manageToken, p.manageToken))
      .limit(1);

    const values = {
      sessionId: session.id,
      postToken,
      manageToken: p.manageToken,
      title: p.title,
      priceText: p.priceText,
      status: p.label,
      labelColor: p.labelColor,
      imageUrl: p.imageUrl,
      imageCount: p.imageCount,
      location: p.location,
      updatedAt: new Date(),
    };

    if (existing[0]) {
      await db.update(postsCache).set(values).where(eq(postsCache.id, existing[0].id));
    } else {
      await db.insert(postsCache).values(values);
    }
  }

  await writeSetting("last_posts_sync", String(Date.now()));
  return all.length;
}

/**
 * For every cached post, fetch its management page (for brand_token) then its full
 * stats, and persist into post_stats + post_stats_daily. Also records an aggregate
 * snapshot for the hourly growth chart. Heavy (2 Divar calls per post) — runs in the
 * background on login and hourly via cron.
 */
export async function syncStats(session: DivarSession): Promise<number> {
  if (statsSyncRunning) return 0;
  statsSyncRunning = true;
  let synced = 0;

  try {
    const cached = await db.select().from(postsCache);

    for (const post of cached) {
      if (!post.manageToken) continue;
      // Only bother with active ads — retired/half-done posts have no useful stats.
      if (post.labelColor && post.labelColor !== "SUCCESS_PRIMARY") continue;

      try {
        const mgmt = await getManagementPage(session, post.manageToken);
        const brandToken = mgmt.brandToken;
        if (!brandToken) continue;
        const postToken = post.postToken;

        const data = await getFullPostStats(session, brandToken, postToken);

        await db.insert(postStats).values({
          postToken,
          brandToken,
          impressions: data.impressions,
          views: data.views,
          contacts: data.contacts,
          bookmarks: data.bookmarks,
          chats: data.chats,
          position: data.position ?? undefined,
          category: data.category ?? undefined,
          city: data.city ?? undefined,
        });

        // Keep the brand token on the cache row so the post page can link to stats directly.
        await db
          .update(postsCache)
          .set({ brandToken })
          .where(eq(postsCache.id, post.id));

        if (data.series) {
          for (const [metric, metricData] of Object.entries(data.series)) {
            await db
              .delete(postStatsDaily)
              .where(
                and(
                  eq(postStatsDaily.postToken, postToken),
                  eq(postStatsDaily.metric, metric)
                )
              );
            if (metricData.series.length > 0) {
              await db.insert(postStatsDaily).values(
                metricData.series.map((pt) => ({
                  postToken,
                  brandToken,
                  metric,
                  dateLabel: pt.label,
                  value: pt.value,
                  todayTotal: metricData.today,
                  grandTotal: metricData.total,
                }))
              );
            }
          }
        }

        synced++;
        await sleep(350); // be gentle with Divar's API
      } catch {
        // Skip a single failing post; keep syncing the rest.
      }
    }

    // Capture an aggregate snapshot for the hourly trend chart.
    const overview = await getOverviewStats();
    await db.insert(statsSnapshots).values({
      impressions: overview.totals.impressions,
      views: overview.totals.views,
      contacts: overview.totals.contacts,
      bookmarks: overview.totals.bookmarks,
      chats: overview.totals.chats,
      postCount: overview.postsWithData,
    });

    await writeSetting("last_stats_sync", String(Date.now()));
  } finally {
    statsSyncRunning = false;
  }

  return synced;
}

/** Called by the hourly cron (instrumentation.ts). Syncs posts then stats if a valid session exists. */
export async function runScheduledSync(): Promise<void> {
  const session = await getActiveSession();
  if (!session || isSessionExpired(session)) return;
  try {
    await syncPosts(session);
    await syncStats(session);
  } catch {
    // swallow — next hour will retry
  }
}
