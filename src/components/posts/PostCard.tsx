"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PostRowData } from "@/lib/divar/types";

const LABEL_STYLES: Record<string, string> = {
  SUCCESS_PRIMARY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  WARNING_PRIMARY: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ERROR_PRIMARY: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function PostCard({ post }: { post: PostRowData }) {
  const labelStyle = LABEL_STYLES[post.labelColor] ?? "bg-muted text-muted-foreground";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/posts/${post.manageToken}`}>
        <div className="aspect-video bg-muted relative overflow-hidden">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {post.imageCount > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {post.imageCount} تصویر
            </div>
          )}
          <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${labelStyle}`}>
            {post.label}
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm truncate">{post.title}</h3>
          <p className="text-primary font-bold text-sm mt-1">{post.priceText}</p>
          <p className="text-muted-foreground text-xs mt-1 truncate">{post.location}</p>
          <div className="flex items-center gap-2 mt-2">
            {post.hasChat && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                چت
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
