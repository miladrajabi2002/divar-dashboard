"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { useSession } from "@/store/session";
import { FileText, RefreshCw } from "lucide-react";
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
  const [error, setError] = useState("");

  const loadPosts = useCallback(
    async (t: Tab, last = "", append = false) => {
      if (!isLoggedIn) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");

      try {
        const url = `/api/posts?tab=${t}${last ? `&last=${encodeURIComponent(last)}` : ""}`;
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));

        if (data.error === "SESSION_EXPIRED") {
          openLoginModal();
        } else if (data.error) {
          setError(
            data.detail
              ? `خطای دیوار (${data.status ?? ""}): ${data.detail}`
              : "دریافت آگهی‌ها ناموفق بود"
          );
        } else {
          const newPosts: PostRowData[] = data.posts ?? [];
          setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
          const nextId = data.nextIdentifier ?? "";
          setLastIdentifier(nextId);
          setHasMore(newPosts.length > 0 && !!nextId);
        }
      } catch (e) {
        setError(String(e).replace("Error: ", ""));
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
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
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary" strokeWidth={1.8} />
        </div>
        <p className="text-muted-foreground">برای مشاهده آگهی‌ها ابتدا وارد شوید</p>
        <Button onClick={openLoginModal}>ورود با کد یک‌بارمصرف</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">آگهی‌های من</h1>
            {!loading && posts.length > 0 && (
              <span className="rounded-full bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 tabular-nums">
                {posts.length}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">مدیریت و بهبود آگهی‌های دیوار</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadPosts(tab)} className="gap-1.5">
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
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

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm break-words" dir="ltr">
          {error}
        </div>
      )}

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
          <FileText className="w-12 h-12 text-muted-foreground/30" strokeWidth={1} />
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
