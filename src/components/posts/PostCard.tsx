"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Images, MapPin, MessageCircle } from "lucide-react";
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
        <div className="aspect-video bg-muted relative overflow-hidden">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground/25" strokeWidth={1} />
            </div>
          )}
          {post.imageCount > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/55 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Images className="w-3 h-3" strokeWidth={2} />
              {post.imageCount}
            </div>
          )}
          <div className={`absolute top-2 right-2 text-xs px-2.5 py-1 rounded-full font-medium ${labelStyle}`}>
            {post.label}
          </div>
        </div>
        <CardContent className="p-3.5">
          <h3 className="font-semibold text-sm leading-snug truncate">{post.title}</h3>
          <p className="text-primary font-bold text-sm mt-1.5">{post.priceText}</p>
          {post.location && (
            <p className="text-muted-foreground text-xs mt-1 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
              {post.location}
            </p>
          )}
          {post.hasChat && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
              چت فعال
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
