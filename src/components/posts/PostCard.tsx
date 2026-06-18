"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Images, MapPin, MessageCircle, ArrowLeft } from "lucide-react";
import type { PostRowData } from "@/lib/divar/types";

const LABEL_STYLES: Record<string, string> = {
  SUCCESS_PRIMARY: "bg-emerald-500/90 text-white",
  WARNING_PRIMARY: "bg-amber-500/90 text-white",
  ERROR_PRIMARY:   "bg-rose-500/90 text-white",
};

export function PostCard({ post }: { post: PostRowData }) {
  const labelStyle = LABEL_STYLES[post.labelColor] ?? "bg-foreground/70 text-background";

  return (
    <Card className="group overflow-hidden border-border/50 ring-1 ring-foreground/5 card-elevated hover:-translate-y-1.5 hover:card-elevated-lg transition-all duration-300 p-0">
      <Link href={`/posts/${post.manageToken}`} className="block">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground/25" strokeWidth={1} />
            </div>
          )}

          {/* bottom scrim for legibility */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* status badge */}
          <div className={`absolute top-2.5 right-2.5 text-[11px] px-2.5 py-1 rounded-full font-bold backdrop-blur-sm shadow-sm ${labelStyle}`}>
            {post.label}
          </div>

          {post.imageCount > 1 && (
            <div className="absolute bottom-2.5 left-2.5 bg-black/55 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 tabular-nums">
              <Images className="w-3 h-3" strokeWidth={2} />
              {post.imageCount}
            </div>
          )}

          {/* hover affordance */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-white text-xs font-semibold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
            مشاهده
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.2} />
          </div>
        </div>

        <CardContent className="p-3.5">
          <h3 className="font-semibold text-sm leading-snug truncate group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-primary font-extrabold text-sm mt-1.5 tabular-nums">{post.priceText}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            {post.location ? (
              <p className="text-muted-foreground text-xs truncate flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                <span className="truncate">{post.location}</span>
              </p>
            ) : <span />}
            {post.hasChat && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 shrink-0">
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                چت
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
