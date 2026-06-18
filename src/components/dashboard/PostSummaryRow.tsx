"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, MousePointerClick, Phone, MessageCircle, ImageOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { PostOverviewRow } from "@/lib/divar/aggregate-stats";

export const postRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

interface PostSummaryRowProps {
  post: PostOverviewRow;
  manageToken?: string;
}

export function PostSummaryRow({ post, manageToken }: PostSummaryRowProps) {
  return (
    <motion.div
      variants={postRowVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={manageToken ? `/posts/${manageToken}` : "/posts"}
        className="card-elevated flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 hover:border-primary/30 transition-colors"
      >
        <div className="w-14 h-14 rounded-xl bg-muted flex-shrink-0 overflow-hidden relative">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
              <ImageOff className="w-5 h-5" strokeWidth={1.6} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{post.title}</p>
          <p className="text-muted-foreground text-xs truncate mt-0.5">{post.priceText}</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          <Metric icon={Eye} value={post.impressions} color="text-blue-600" />
          <Metric icon={MousePointerClick} value={post.views} color="text-emerald-600" />
          <Metric icon={Phone} value={post.contacts} color="text-amber-600" />
          <Metric icon={MessageCircle} value={post.chats} color="text-purple-600" />
        </div>
      </Link>
    </motion.div>
  );
}

function Metric({ icon: Icon, value, color }: { icon: LucideIcon; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[44px]">
      <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.8} />
      <span className={`text-sm font-bold tabular-nums ${color}`}>
        <AnimatedNumber value={value} />
      </span>
    </div>
  );
}
