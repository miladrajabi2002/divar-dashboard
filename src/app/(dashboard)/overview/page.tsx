"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/store/session";
import type { PostRowData } from "@/lib/divar/types";

interface StatsCard {
  title: string;
  value: string;
  tint: string;
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const { isLoggedIn, phone, openLoginModal } = useSession();
  const [posts, setPosts] = useState<PostRowData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    fetch("/api/posts")
      .then((r) => r.json().catch(() => ({})))
      .then((d) => {
        if (d.error === "SESSION_EXPIRED") openLoginModal();
        else setPosts(d.posts ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, openLoginModal]);

  const activePosts = posts.filter((p) => p.labelColor === "SUCCESS_PRIMARY");

  const summaryCards: StatsCard[] = [
    {
      title: "آگهی‌های فعال",
      value: String(activePosts.length),
      tint: "bg-emerald-500/10 text-emerald-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "کل آگهی‌ها",
      value: String(posts.length),
      tint: "bg-blue-500/10 text-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "آگهی با چت",
      value: String(posts.filter((p) => p.hasChat).length),
      tint: "bg-violet-500/10 text-violet-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: "تصویردار",
      value: String(posts.filter((p) => p.imageCount > 0).length),
      tint: "bg-amber-500/10 text-amber-600",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">برای شروع وارد دیوار شوید</h2>
        <p className="text-muted-foreground max-w-xs">برای مشاهده و مدیریت آگهی‌هایتان ابتدا وارد حساب دیوار شوید</p>
        <button onClick={openLoginModal} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          ورود با کد یک‌بارمصرف
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary to-primary/75 p-7 text-primary-foreground">
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -left-2 bottom-0 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-sm text-primary-foreground/80">خوش آمدید 👋</p>
          <h1 className="text-2xl font-bold mt-1">داشبورد آگهی‌های شما</h1>
          {phone && (
            <p className="text-primary-foreground/80 text-sm mt-2 ltr inline-block" dir="ltr">
              {phone}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-elevated border-border/60">
            <CardContent className="p-5">
              {loading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tint}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-none">{card.value}</p>
                    <p className="text-muted-foreground text-xs mt-1.5">{card.title}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Posts */}
      <Card className="card-elevated border-border/60">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">آخرین آگهی‌ها</CardTitle>
          <Link href="/posts" className="text-primary text-sm font-medium hover:underline">
            مشاهدهٔ همه
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">آگهی‌ای یافت نشد</p>
          ) : (
            <div className="divide-y divide-border/70">
              {posts.slice(0, 6).map((post) => (
                <Link
                  key={post.manageToken}
                  href={`/posts/${post.manageToken}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 -mx-2 px-2 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  {post.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.imageUrl} alt={post.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-muted flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <p className="text-muted-foreground text-xs truncate mt-0.5">
                      {post.priceText} {post.location && `— ${post.location}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    post.labelColor === "SUCCESS_PRIMARY"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {post.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
