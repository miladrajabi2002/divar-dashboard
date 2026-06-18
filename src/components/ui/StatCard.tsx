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
      className="card-elevated rounded-2xl border border-border/50 bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${TINT_CLASSES[color]} ${COLOR_CLASSES[color]}`}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </div>
      </div>
      <p className={`mt-3 text-3xl font-extrabold tabular-nums tracking-tight ${COLOR_CLASSES[color]}`}>
        <AnimatedNumber value={value} decimals={decimals} />
      </p>
      {subtitle ? <p className="mt-1.5 text-xs text-muted-foreground truncate">{subtitle}</p> : null}
    </motion.div>
  );
}
