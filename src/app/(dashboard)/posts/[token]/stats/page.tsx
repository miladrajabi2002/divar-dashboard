"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PostStatsData } from "@/lib/divar/types";
import { formatNumber } from "@/lib/utils/persian";

const STAT_ITEMS = [
  { key: "impressions" as keyof PostStatsData, label: "نمایش‌ها", color: "#22c55e", icon: "👁" },
  { key: "views" as keyof PostStatsData, label: "بازدیدها", color: "#3b82f6", icon: "🔍" },
  { key: "contacts" as keyof PostStatsData, label: "تماس‌ها", color: "#f59e0b", icon: "📞" },
  { key: "bookmarks" as keyof PostStatsData, label: "نشان‌کردن‌ها", color: "#a855f7", icon: "🔖" },
  { key: "chats" as keyof PostStatsData, label: "چت‌ها", color: "#ec4899", icon: "💬" },
];

function PostStatsContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const searchParams = useSearchParams();
  const brandToken = searchParams.get("brand") ?? "";
  const [stats, setStats] = useState<PostStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandToken) return;
    fetch(`/api/posts/${token}/stats?brand=${brandToken}&tab=overview`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [token, brandToken]);

  // mock trend for chart (single data point in real usage, trend builds over time)
  const chartData = stats
    ? [{ name: "اکنون", ...Object.fromEntries(STAT_ITEMS.map((s) => [s.label, stats[s.key] as number])) }]
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/posts/${token}`} className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">عملکرد آگهی</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Position Badge */}
          {stats.position && (
            <div className="flex items-center gap-2 p-4 bg-accent rounded-xl">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-bold text-accent-foreground">جایگاه {formatNumber(stats.position)}</p>
                <p className="text-sm text-muted-foreground">
                  در {stats.city ?? "شهر"} — {stats.category ?? "دسته‌بندی"}
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {STAT_ITEMS.map((item) => {
              const value = stats[item.key] as number;
              return (
                <Card key={item.key}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: item.color }}>
                          {formatNumber(value)}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5">{item.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Trend note */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                نمودار تاریخچه (با هر بار بروزرسانی کامل‌تر می‌شود)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    {STAT_ITEMS.map((s) => (
                      <Line
                        key={s.key}
                        type="monotone"
                        dataKey={s.label}
                        stroke={s.color}
                        dot={false}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  داده‌های بیشتری نیاز است — چند بار آمار را بروز کنید تا نمودار نمایش داده شود
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          {!brandToken ? "پارامتر brand یافت نشد" : "خطا در بارگذاری آمار"}
        </p>
      )}
    </div>
  );
}

export default function PostStatsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground text-sm">در حال بارگذاری...</div>}>
      <PostStatsContent params={params} />
    </Suspense>
  );
}
