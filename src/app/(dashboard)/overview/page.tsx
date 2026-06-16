"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSession } from "@/store/session";
import type { PostRowData } from "@/lib/divar/types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PALETTE = ["#e11d2a", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#64748b"];

export default function DashboardPage() {
  const { isLoggedIn, phone, openLoginModal } = useSession();
  const [posts, setPosts] = useState<PostRowData[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
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
  };

  useEffect(load, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = posts.filter((p) => p.labelColor === "SUCCESS_PRIMARY").length;
  const withChat = posts.filter((p) => p.hasChat).length;
  const withImage = posts.filter((p) => p.imageCount > 0).length;

  const kpis = [
    { title: "کل آگهی‌ها", value: posts.length, tint: "from-rose-500/15 to-rose-500/5", fg: "text-rose-600", icon: IconDoc },
    { title: "آگهی‌های فعال", value: active, tint: "from-emerald-500/15 to-emerald-500/5", fg: "text-emerald-600", icon: IconCheck },
    { title: "دارای چت", value: withChat, tint: "from-violet-500/15 to-violet-500/5", fg: "text-violet-600", icon: IconChat },
    { title: "تصویردار", value: withImage, tint: "from-amber-500/15 to-amber-500/5", fg: "text-amber-600", icon: IconImage },
  ];

  // status distribution for the donut
  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      const key = p.label?.trim() || "بدون وضعیت";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [posts]);

  const featureData = [
    { name: "فعال", value: active },
    { name: "تصویردار", value: withImage },
    { name: "چت‌دار", value: withChat },
    { name: "کل", value: posts.length },
  ];

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
          <span className="text-primary">{IconLock}</span>
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
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          {IconRefresh}
          بروزرسانی
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.title} className="card-elevated border-border/50 overflow-hidden">
            <CardContent className="p-5">
              {loading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-extrabold leading-none tracking-tight">{k.value.toLocaleString("fa-IR")}</p>
                    <p className="text-muted-foreground text-[13px] mt-2">{k.title}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${k.tint} ${k.fg}`}>
                    {k.icon}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Donut */}
        <Card className="card-elevated border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">توزیع وضعیت آگهی‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : statusData.length === 0 ? (
              <Empty />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  {statusData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                      {s.name}
                      <span className="font-semibold text-foreground">{s.value.toLocaleString("fa-IR")}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bar */}
        <Card className="card-elevated border-border/50 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">نمای کلی آگهی‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : posts.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={featureData} barSize={42}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {featureData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent posts */}
      <Card className="card-elevated border-border/50">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">آخرین آگهی‌ها</CardTitle>
          <Link href="/posts" className="text-primary text-sm font-medium hover:underline">مشاهدهٔ همه</Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : posts.length === 0 ? (
            <Empty />
          ) : (
            <div className="divide-y divide-border/60">
              {posts.slice(0, 6).map((post) => (
                <Link
                  key={post.manageToken}
                  href={`/posts/${post.manageToken}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 -mx-2 px-2 rounded-xl hover:bg-muted/60 transition-colors"
                >
                  {/* Thumbnail — fixed square with object-cover */}
                  <div className="w-14 h-14 rounded-xl bg-muted flex-shrink-0 overflow-hidden relative">
                    {post.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <p className="text-muted-foreground text-xs truncate mt-0.5">
                      {post.priceText}{post.location ? ` — ${post.location}` : ""}
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

function Empty() {
  return <p className="text-muted-foreground text-sm text-center py-12">داده‌ای برای نمایش نیست</p>;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: { name?: string } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const name = item.payload?.name ?? item.name;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs shadow-md">
      <span className="text-muted-foreground">{name}: </span>
      <span className="font-bold">{(item.value ?? 0).toLocaleString("fa-IR")}</span>
    </div>
  );
}

const IconDoc = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconCheck = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconChat = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);
const IconImage = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconRefresh = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const IconLock = (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
