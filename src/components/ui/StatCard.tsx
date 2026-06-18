"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatCardProps {
  label: string;
  value: number;
  decimals?: number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "destructive" | "default";
}

const COLOR_CLASSES: Record<NonNullable<StatCardProps["color"]>, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  default: "text-foreground",
};

const TINT_CLASSES: Record<NonNullable<StatCardProps["color"]>, string> = {
  primary: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
  default: "bg-muted",
};

// Soft top-corner glow tinted by the card color.
const GLOW_CLASSES: Record<NonNullable<StatCardProps["color"]>, string> = {
  primary: "from-primary/[0.07]",
  success: "from-success/[0.07]",
  warning: "from-warning/[0.07]",
  destructive: "from-destructive/[0.07]",
  default: "from-foreground/[0.04]",
};

export const statCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export function StatCard({
  label,
  value,
  decimals = 0,
  subtitle,
  icon: Icon,
  color = "default",
}: StatCardProps) {
  return (
    <motion.div
      variants={statCardVariants}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="card-elevated group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5"
    >
      <div
        className={`pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-br ${GLOW_CLASSES[color]} to-transparent blur-2xl`}
      />
      <div className="relative flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${TINT_CLASSES[color]} ${COLOR_CLASSES[color]}`}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </div>
      </div>
      <p className={`relative mt-3 text-3xl font-extrabold tabular-nums tracking-tight ${COLOR_CLASSES[color]}`}>
        <AnimatedNumber value={value} decimals={decimals} />
      </p>
      {subtitle ? <p className="relative mt-1.5 text-xs text-muted-foreground truncate">{subtitle}</p> : null}
    </motion.div>
  );
}
