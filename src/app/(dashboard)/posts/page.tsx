"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { useSession } from "@/store/session";
import type { PostRowData } from "@/lib/divar/types";

type Tab = "all" | "ongoing" | "waiting" | "retired";

const TAB_LABELS: Record<Tab, string> = {
  all: "همه",
  ongoing: "منتشر شده",
  waiting: "نیمه‌کاره",
  retired: "آرشیو",
};

export default function PostsPage() {
  const { isLoggedIn, openLoginModal } = useSession();
  const [tab, setTab] = useState<Tab>("all");
  const [posts, setPosts] = useState<PostRowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastIdentifier, setLastIdentifier] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(
    async (t: Tab, last = "", append = false) => {
      if (!isLoggedIn) return;
      if (append) setLoadingMore(true);
      else setLoading(true);

      const url = `/api/posts?tab=${t}${last ? `&last=${encodeURIComponent(last)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.error === "SESSION_EXPIRED") {
        openLoginModal();
      } else {
        const newPosts: PostRowData[] = data.posts ?? [];
        setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
        const nextId = data.nextIdentifier ?? "";
        setLastIdentifier(nextId);
        setHasMore(newPosts.length > 0 && !!nextId);
      }

      if (append) setLoadingMore(false);
      else setLoading(false);
    },
    [isLoggedIn, openLoginModal]
  );

  useEffect(() => {
    setPosts([]);
    setLastIdentifier("");
    setHasMore(true);
    loadPosts(tab);
  }, [tab, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <p className="text-muted-foreground">برای مشاهده آگهی‌ها ابتدا وارد شوید</p>
        <Button onClick={openLoginModal}>ورود با OTP</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">آگهی‌های من</h1>
          {!loading && (
            <p className="text-muted-foreground text-sm mt-1">{posts.length} آگهی</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => loadPosts(tab)}>
          <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          بروزرسانی
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <TabsTrigger key={t} value={t} className="flex-1">
              {TAB_LABELS[t]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <svg className="w-12 h-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-muted-foreground">آگهی‌ای در این بخش وجود ندارد</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {posts.map((post) => (
              <PostCard key={post.manageToken} post={post} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => loadPosts(tab, lastIdentifier, true)}
                disabled={loadingMore}
              >
                {loadingMore ? "در حال بارگذاری..." : "بارگذاری بیشتر"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
