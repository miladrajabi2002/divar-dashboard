import { divarGet, divarPost } from "./client";
import { faToNumber } from "@/lib/utils/persian";
import type { DivarSession } from "@/lib/db/schema";
import type {
  PostRowData,
  ManagementPageData,
  MyPostsResponse,
  ManagementPageResponse,
  DivarWidget,
} from "./types";

export type PostTab = "all" | "ongoing" | "waiting" | "retired";

export async function getMyPosts(
  session: DivarSession,
  tab: PostTab = "all",
  lastItemIdentifier = ""
): Promise<{ posts: PostRowData[]; nextIdentifier: string }> {
  const data = await divarPost<MyPostsResponse>(
    session,
    "/v8/my-posts/w/list",
    {
      filter_tab_identifier: tab,
      last_item_identifier: lastItemIdentifier,
    }
  );

  const widgets = data.page?.widget_list ?? [];
  const posts: PostRowData[] = [];

  for (const w of widgets) {
    if (w.widget_type !== "POST_ROW") continue;
    const d = w.data as Record<string, unknown>;
    const payload = (d.action as Record<string, unknown>)?.payload as Record<string, unknown>;
    const manageToken = (payload?.manage_token as string) ?? "";
    if (!manageToken) continue;

    posts.push({
      manageToken,
      title: (d.title as string) ?? "",
      priceText: (d.middle_description_text as string) ?? "",
      location: (d.bottom_description_text as string) ?? "",
      imageUrl: (d.image_url as string) ?? "",
      imageCount: ((d.image_count as number) ?? 0),
      label: (d.label as string) ?? "",
      labelColor: (d.standard_label_color as string) ?? "",
      hasChat: (d.has_chat as boolean) ?? false,
    });
  }

  const nextIdentifier =
    data.page?.infinite_scroll_response?.last_item_identifier ?? "";

  return { posts, nextIdentifier };
}

export async function getManagementPage(
  session: DivarSession,
  manageToken: string
): Promise<ManagementPageData> {
  const data = await divarGet<ManagementPageResponse>(
    session,
    `/v8/post-management/page/${manageToken}`
  );

  const widgets = data.page?.widget_list ?? [];

  let brandToken = "";
  let postToken = manageToken.slice(0, 8);
  let status = "";
  let publishedAt = "";
  let expiresAt = "";

  // extract brand_token + post_token from action_log entries
  for (const w of widgets) {
    const info = w.action_log?.server_side_info?.info as Record<string, unknown> | undefined;
    if (info?.brand_token) brandToken = info.brand_token as string;
    if (info?.post_token) postToken = info.post_token as string;
  }

  // extract status + dates from TITLE_ROW and UNEXPANDABLE_ROW
  for (const w of widgets) {
    const d = w.data as Record<string, unknown>;
    if (w.widget_type === "TITLE_ROW" && d.text_color === "SUCCESS_PRIMARY") {
      status = (d.text as string) ?? status;
    }
    if (w.widget_type === "UNEXPANDABLE_ROW") {
      if ((d.title as string)?.includes("انتشار") && !publishedAt) {
        publishedAt = (d.value as string) ?? "";
      }
      if ((d.title as string)?.includes("انقضاء")) {
        expiresAt = (d.value as string) ?? "";
      }
    }
  }

  // extract available actions from SELECTOR_ROW widgets
  const actions = widgets
    .filter((w: DivarWidget) => w.widget_type === "SELECTOR_ROW")
    .map((w: DivarWidget) => (w.data as Record<string, unknown>).title as string)
    .filter(Boolean);

  return { postToken, brandToken, status, publishedAt, expiresAt, actions };
}

export async function deletePost(
  session: DivarSession,
  manageToken: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await divarPost(session, "/v8/post-management/delete", {
      manage_token: manageToken,
      delete_post: true,
    });
    return { success: true };
  } catch (e) {
    return { success: false, message: String(e) };
  }
}
