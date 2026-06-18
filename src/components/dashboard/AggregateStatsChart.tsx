"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toEnglishDigits, formatNumber } from "@/lib/utils/persian";
import type { OverviewSeriesPoint } from "@/lib/divar/aggregate-stats";

const SERIES = [
  { key: "impression" as const, label: "نمایش", color: "#3b82f6" },
  { key: "click" as const, label: "بازدید", color: "#10b981" },
  { key: "contact" as const, label: "تماس", color: "#f59e0b" },
  { key: "chat" as const, label: "چت", color: "#a855f7" },
];

export interface HourlySnapshot {
  t: number;
  impressions: number;
  views: number;
  contacts: number;
  chats: number;
}

interface Props {
  series: OverviewSeriesPoint[];
  snapshots?: HourlySnapshot[];
  mode?: "daily" | "hourly";
}

export function AggregateStatsChart({ series, snapshots = [], mode = "daily" }: Props) {
  const data =
    mode === "hourly"
      ? snapshots.map((s) => ({
          name: toEnglishDigits(
            new Date(s.t).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          ),
          impression: s.impressions,
          click: s.views,
          contact: s.contacts,
          chat: s.chats,
        }))
      : series.map((p) => ({ ...p, name: toEnglishDigits(p.label) }));

  if (data.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground px-6">
        <p>هنوز داده‌ای برای نمودار جمع نشده</p>
        <p className="text-xs">
          {mode === "hourly"
            ? "روند ساعتی بعد از چند بار بروزرسانی خودکار پر می‌شود"
            : "برای دیدن روند رشد، آمار آگهی‌ها را یک‌بار بروزرسانی کنید"}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          {SERIES.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.22} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
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
            borderRadius: 10,
            fontSize: 12,
            direction: "rtl",
          }}
          formatter={(value, name) => [
            formatNumber(Number(value ?? 0)),
            SERIES.find((s) => s.key === name)?.label ?? String(name),
          ]}
        />
        <Legend
          formatter={(value) => SERIES.find((s) => s.key === value)?.label ?? String(value)}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {SERIES.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.key}
            stroke={s.color}
            strokeWidth={2.2}
            fill={`url(#grad-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
