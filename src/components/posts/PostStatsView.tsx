"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointerClick, Phone, MessageCircle, MapPin, Bookmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PostStatsData, MetricData } from "@/lib/divar/types";
import { formatNumber } from "@/lib/utils/persian";

const METRICS: {
  key: "impression" | "click" | "contact" | "chat";
  label: string;
  color: string;
  bg: string;
  fg: string;
  icon: LucideIcon;
}[] = [
  { key: "impression", label: "نمایش در فهرست", color: "#3b82f6", bg: "bg-blue-500/10", fg: "text-blue-600", icon: Eye },
  { key: "click", label: "بازدید از آگهی", color: "#10b981", bg: "bg-emerald-500/10", fg: "text-emerald-600", icon: MousePointerClick },
  { key: "contact", label: "اقدام به تماس", color: "#f59e0b", bg: "bg-amber-500/10", fg: "text-amber-600", icon: Phone },
  { key: "chat", label: "چت دریافتی", color: "#a855f7", bg: "bg-purple-500/10", fg: "text-purple-600", icon: MessageCircle },
];

function MetricChart({ metric, data }: { metric: (typeof METRICS)[number]; data: MetricData }) {
  const chartData = data.series.map((pt) => ({ name: pt.label, value: pt.value }));
  const Icon = metric.icon;

  return (
    <Card className="card-elevated border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${metric.bg} ${metric.fg}`}>
              <Icon className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{metric.label}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                امروز: <span className={`font-bold ${metric.fg}`}>{formatNumber(data.today)}</span>
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
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: 12, direction: "rtl" }}
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
          <div className="h-36 flex items-center justify-center text-sm text-muted-foreground">داده‌ای موجود نیست</div>
        )}
      </CardContent>
    </Card>
  );
}

export function PostStatsView({ stats }: { stats: PostStatsData }) {
  return (
    <div className="space-y-5">
      {/* Position */}
      {stats.position && (
        <div className="flex items-center gap-3 p-4 bg-accent rounded-2xl">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-primary" strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-bold text-accent-foreground">جایگاه {formatNumber(stats.position)}</p>
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
              <Bookmark className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold">نشان‌کردن‌ها</p>
              <p className="text-rose-600 font-bold text-lg">{formatNumber(stats.bookmarks)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
