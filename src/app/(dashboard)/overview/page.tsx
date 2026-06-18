"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "@/store/session";
import { StatCard } from "@/components/ui/StatCard";
import { AggregateStatsChart } from "@/components/dashboard/AggregateStatsChart";
import type { HourlySnapshot } from "@/components/dashboard/AggregateStatsChart";
import { PostSummaryRow } from "@/components/dashboard/PostSummaryRow";
import { AiReviewPanel } from "@/components/ai/AiReviewPanel";
import type { PostRowData } from "@/lib/divar/types";
import type { OverviewStats } from "@/lib/divar/aggregate-stats";
import { FileText, CheckCircle2, Eye, Phone, Lock, RefreshCw, Loader2 } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function DashboardPage() {
  const { isLoggedIn, phone, openLoginModal } = useSession();
  const [posts, setPosts] = useState<PostRowData[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [snapshots, setSnapshots] = useState<HourlySnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [chartMode, setChartMode] = useState<"daily" | "hourly">("daily");

  const load = () => {
    if (!isLoggedIn) return;
    setLoading(true);
    Promise.all([
      fetch("/api/posts").then((r) => r.json().catch(() => ({}))),
      fetch("/api/posts/overview-stats").then((r) => r.json().catch(() => ({}))),
    ])
      .then(([postsData, overviewData]) => {
        if (postsData.error === "SESSION_EXPIRED") {
          openLoginModal();
          return;
        }
        setPosts(postsData.posts ?? []);
        setOverview(overviewData.totals ? overviewData : null);
        setSnapshots(overviewData.snapshots ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual "refresh now": pull fresh posts + stats from Divar, then reload the view.
  const refresh = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.error === "SESSION_EXPIRED") {
        openLoginModal();
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "بروزرسانی ناموفق بود");
      toast.success("آمار بروزرسانی شد");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "بروزرسانی ناموفق بود");
    } finally {
      setSyncing(false);
    }
  };

  const active = posts.filter((p) => p.labelColor === "SUCCESS_PRIMARY");

  // Map postToken (derived from manageToken) -> manageToken, so cached stats rows
  // (which only know postToken) can link back to a post detail page.
  const manageTokenByPostToken = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of posts) map.set(p.manageToken.slice(0, 8), p.manageToken);
    return map;
  }, [posts]);

  const activePostsWithStats = useMemo(() => {
    if (!overview) return [];
    const activeTokens = new Set(active.map((p) => p.manageToken.slice(0, 8)));
    return overview.posts.filter((p) => activeTokens.has(p.postToken));
  }, [overview, active]);

  const kpis = [
    { title: "کل آگهی‌ها", value: posts.length, icon: FileText, color: "default" as const },
    { title: "آگهی‌های فعال", value: active.length, icon: CheckCircle2, color: "success" as const },
    { title: "مجموع بازدید", value: overview?.totals.views ?? 0, icon: Eye, color: "primary" as const },
    { title: "مجموع تماس", value: overview?.totals.contacts ?? 0, icon: Phone, color: "warning" as const },
  ];

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
          <Lock className="w-10 h-10 text-primary" strokeWidth={1.6} />
        </div>
        <h2 className="text-xl font-bold">برای شروع وارد دیوار شوید</h2>
        <p className="text-muted-foreground max-w-xs">برای مشاهده آمار و مدیریت آگهی‌هایتان ابتدا وارد حساب دیوار شوید</p>
        <Button onClick={openLoginModal} size="lg">ورود با کد یک‌بارمصرف</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">داشبورد</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {phone ? (
              <span className="ltr inline-block" dir="ltr">{phone}</span>
            ) : "خلاصهٔ وضعیت آگهی‌های شما"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={syncing} className="gap-2">
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" strokeWidth={1.8} />}
          {syncing ? "در حال بروزرسانی..." : "بروزرسانی"}
        </Button>
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {kpis.map((k) => (
            <StatCard key={k.title} label={k.title} value={k.value} icon={k.icon} color={k.color} />
          ))}
        </motion.div>
      )}

      {/* AI growth review */}
      <AiReviewPanel
        endpoint="/api/ai/review/overview"
        title="بررسی هوشمند عملکرد آگهی‌ها"
        triggerLabel="بررسی با هوش مصنوعی"
      />

      {/* Aggregate growth chart */}
      <Card className="card-elevated border-border/50">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">روند رشد آگهی‌ها</CardTitle>
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1 text-xs">
            <button
              onClick={() => setChartMode("daily")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                chartMode === "daily" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              روزانه
            </button>
            <button
              onClick={() => setChartMode("hourly")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                chartMode === "hourly" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              ساعتی
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-72 w-full rounded-xl" />
          ) : (
            <AggregateStatsChart
              series={overview?.series ?? []}
              snapshots={snapshots}
              mode={chartMode}
            />
          )}
        </CardContent>
      </Card>

      {/* Active posts performance list */}
      <Card className="card-elevated border-border/50">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">عملکرد آگهی‌های فعال</CardTitle>
          <Link href="/posts" className="text-primary text-sm font-medium hover:underline">مشاهدهٔ همه</Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
          ) : activePostsWithStats.length === 0 ? (
            <Empty
              message={
                active.length === 0
                  ? "هیچ آگهی فعالی ندارید"
                  : "آماری برای آگهی‌های فعال هنوز آماده نیست — روی «بروزرسانی» بزنید"
              }
            />
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              {activePostsWithStats.slice(0, 8).map((p) => (
                <PostSummaryRow key={p.postToken} post={p} manageToken={manageTokenByPostToken.get(p.postToken)} />
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Empty({ message = "داده‌ای برای نمایش نیست" }: { message?: string }) {
  return <p className="text-muted-foreground text-sm text-center py-12">{message}</p>;
}
