"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { PostRowData } from "@/lib/divar/types";

const LABEL_STYLES: Record<string, string> = {
  SUCCESS_PRIMARY: "bg-emerald-500/12 text-emerald-700",
  WARNING_PRIMARY: "bg-amber-500/12 text-amber-700",
  ERROR_PRIMARY:   "bg-rose-500/12 text-rose-700",
};

export function PostCard({ post }: { post: PostRowData }) {
  const labelStyle = LABEL_STYLES[post.labelColor] ?? "bg-muted text-muted-foreground";

  return (
    <Card className="overflow-hidden border-border/50 card-elevated hover:-translate-y-1 hover:card-elevated-lg transition-all duration-200 group p-0">
      <Link href={`/posts/${post.manageToken}`} className="block">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Image count badge */}
          {post.imageCount > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/55 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
              </svg>
              {post.imageCount}
            </div>
          )}

          {/* Status badge */}
          <div className={`absolute top-2 right-2 text-xs px-2.5 py-1 rounded-full font-medium ${labelStyle}`}>
            {post.label}
          </div>
        </div>

        {/* Info */}
        <CardContent className="p-3.5">
          <h3 className="font-semibold text-sm leading-snug truncate">{post.title}</h3>
          <p className="text-primary font-bold text-sm mt-1.5">{post.priceText}</p>
          {post.location && (
            <p className="text-muted-foreground text-xs mt-1 truncate flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {post.location}
            </p>
          )}
          {post.hasChat && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              چت فعال
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
