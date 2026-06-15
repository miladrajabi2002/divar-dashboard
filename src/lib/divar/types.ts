export interface DivarSessionCookies {
  accessToken: string;
  frontToken: string;
  did: string;
  csid: string;
  expiresAt: Date;
}

export interface PostRowData {
  manageToken: string;
  title: string;
  priceText: string;
  location: string;
  imageUrl: string;
  imageCount: number;
  label: string;
  labelColor: string;
  hasChat: boolean;
}

export interface ManagementPageData {
  postToken: string;
  brandToken: string;
  status: string;
  publishedAt: string;
  expiresAt: string;
  actions: string[];
}

export interface PostStatsData {
  impressions: number;
  views: number;
  contacts: number;
  bookmarks: number;
  chats: number;
  position: number | null;
  category: string | null;
  city: string | null;
}

export interface DivarWidget {
  widget_type: string;
  data: Record<string, unknown>;
  action_log?: {
    server_side_info?: {
      info?: Record<string, unknown>;
    };
  };
}

export interface MyPostsResponse {
  page: {
    widget_list: DivarWidget[];
    infinite_scroll_response?: {
      last_item_identifier: string;
    };
  };
}

export interface ManagementPageResponse {
  page: {
    widget_list: DivarWidget[];
    nav_bar_v2?: {
      data?: { text?: string };
    };
  };
}

export interface StatsResponse {
  page: {
    widget_list: DivarWidget[];
  };
  pages?: Record<string, { widget_list: DivarWidget[] }>;
}
