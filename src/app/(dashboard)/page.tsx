<<<<<<< HEAD
import { redirect } from "next/navigation";

export default function DashboardIndexPage() {
  redirect("/overview");
=======
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/store/session";
import type { PostRowData } from "@/lib/divar/types";

interface StatsCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const { isLoggedIn, openLoginModal } = useSession();
  const [posts, setPosts] = useState<PostRowData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => {
        if (d.error === "SESSION_EXPIRED") openLoginModal();
        else setPosts(d.posts ?? []);
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const activePosts = posts.filter((p) => p.labelColor === "SUCCESS_PRIMARY");

  const summaryCards: StatsCard[] = [
    {
      title: "آگهی‌های فعال",
      value: String(activePosts.length),
      color: "text-green-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "کل آگهی‌ها",
      value: String(posts.length),
      color: "text-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "آگهی با چت",
      value: String(posts.filter((p) => p.hasChat).length),
      color: "text-purple-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: "تصویر دار",
      value: String(posts.filter((p) => p.imageCount > 0).length),
      color: "text-orange-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">برای شروع وارد دیوار شوید</h2>
        <p className="text-muted-foreground">برای مشاهده و مدیریت آگهی‌هایتان ابتدا وارد شوید</p>
        <button
          onClick={openLoginModal}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          ورود با OTP
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">خوش آمدید</h1>
        <p className="text-muted-foreground mt-1">خلاصه وضعیت آگهی‌های شما</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              {loading ? (
                <Skeleton className="h-14 w-full" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`${card.color} opacity-80`}>{card.icon}</div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{card.title}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">آخرین آگهی‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              آگهی‌ای یافت نشد
            </p>
          ) : (
            <div className="divide-y">
              {posts.slice(0, 5).map((post) => (
                <div key={post.manageToken} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <p className="text-muted-foreground text-xs truncate">{post.priceText} — {post.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    post.labelColor === "SUCCESS_PRIMARY"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {post.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
>>>>>>> 65723248fbc8219afcda3a52bb0c2c89885d294e
}
