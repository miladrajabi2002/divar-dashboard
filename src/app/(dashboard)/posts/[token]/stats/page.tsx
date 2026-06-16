"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PostStatsData, MetricData } from "@/lib/divar/types";
import { formatNumber } from "@/lib/utils/persian";

const METRICS = [
  {
    key: "impression" as const,
    label: "نمایش در فهرست",
    color: "#3b82f6",
    bg: "bg-blue-500/10",
    fg: "text-blue-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    key: "click" as const,
    label: "بازدید از آگهی",
    color: "#10b981",
    bg: "bg-emerald-500/10",
    fg: "text-emerald-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    key: "contact" as const,
    label: "اقدام به تماس",
    color: "#f59e0b",
    bg: "bg-amber-500/10",
    fg: "text-amber-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    key: "chat" as const,
    label: "چت دریافتی",
    color: "#a855f7",
    bg: "bg-purple-500/10",
    fg: "text-purple-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

function MetricChart({
  metric,
  data,
}: {
  metric: (typeof METRICS)[number];
  data: MetricData;
}) {
  const chartData = data.series.map((pt) => ({ name: pt.label, value: pt.value }));

  return (
    <Card className="card-elevated border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${metric.bg} ${metric.fg}`}>{metric.icon}</div>
            <div>
              <CardTitle className="text-sm font-semibold">{metric.label}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                امروز:{" "}
                <span className={`font-bold ${metric.fg}`}>
                  {formatNumber(data.today)}
                </span>
              </p>
            </div>
          </div>
          <div className="text-left">
            <p className={`text-2xl font-extrabold ${metric.fg}`}>{formatNumber(data.total)}</p>
            <p className="text-xs text-muted-foreground">کل</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: 12,
                  direction: "rtl",
                }}
                formatter={(v) => [formatNumber(Number(v ?? 0)), metric.label]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={metric.color}
                strokeWidth={2.5}
                fill={`url(#grad-${metric.key})`}
                dot={{ r: 4, fill: metric.color, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: metric.color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-36 flex items-center justify-center text-sm text-muted-foreground">
            داده‌ای موجود نیست
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PostStatsContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const searchParams = useSearchParams();
  const brandToken = searchParams.get("brand") ?? "";
  const [stats, setStats] = useState<PostStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!brandToken) { setLoading(false); return; }
    fetch(`/api/posts/${token}/stats?brand=${brandToken}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.detail ?? d.error);
        else setStats(d);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [token, brandToken]);

  if (!brandToken) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        پارامتر brand یافت نشد — از صفحه جزئیات آگهی وارد شوید
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/posts/${token}`}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold">عملکرد آگهی</h1>
          <p className="text-muted-foreground text-xs mt-0.5">آمار روزانه از دیوار</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/8 border border-destructive/20 text-destructive rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        </div>
      ) : stats ? (
        <div className="space-y-5 fade-in">
          {/* Position */}
          {stats.position && (
            <div className="flex items-center gap-3 p-4 bg-accent rounded-2xl">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-accent-foreground">
                  جایگاه {formatNumber(stats.position)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.city ?? ""}{stats.city && stats.category ? " — " : ""}{stats.category ?? ""}
                </p>
              </div>
            </div>
          )}

          {/* KPI summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "نمایش", value: stats.impressions, color: "text-blue-600", bg: "bg-blue-500/8" },
              { label: "بازدید", value: stats.views, color: "text-emerald-600", bg: "bg-emerald-500/8" },
              { label: "تماس", value: stats.contacts, color: "text-amber-600", bg: "bg-amber-500/8" },
              { label: "چت", value: stats.chats, color: "text-purple-600", bg: "bg-purple-500/8" },
            ].map((kpi) => (
              <Card key={kpi.label} className={`border-border/50 ${kpi.bg}`}>
                <CardContent className="p-4">
                  <p className={`text-2xl font-extrabold ${kpi.color}`}>{formatNumber(kpi.value)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.label} کل</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Today's summary */}
          {stats.series && (
            <Card className="card-elevated border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">آمار امروز</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {METRICS.map((m) => {
                    const md = stats.series![m.key];
                    return (
                      <div key={m.key} className="text-center">
                        <p className={`text-xl font-bold ${m.fg}`}>{formatNumber(md.today)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-metric charts */}
          {stats.series && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METRICS.map((m) => (
                <MetricChart key={m.key} metric={m} data={stats.series![m.key]} />
              ))}
            </div>
          )}

          {/* Bookmarks */}
          {stats.bookmarks > 0 && (
            <Card className="card-elevated border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">نشان‌کردن‌ها</p>
                  <p className="text-rose-600 font-bold text-lg">{formatNumber(stats.bookmarks)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        !error && (
          <p className="text-muted-foreground text-center py-12 text-sm">
            آماری یافت نشد
          </p>
        )
      )}
    </div>
  );
}

export default function PostStatsPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground text-sm">در حال بارگذاری...</div>}>
      <PostStatsContent params={params} />
    </Suspense>
  );
}
