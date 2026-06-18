"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AiReviewPanel } from "@/components/ai/AiReviewPanel";
import { ChevronRight, BarChart3, ExternalLink, Sparkles, Trash2 } from "lucide-react";
import type { ManagementPageData, PostRowData } from "@/lib/divar/types";

export default function PostManagementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ManagementPageData | null>(null);
  const [postInfo, setPostInfo] = useState<PostRowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${token}`).then((r) => r.json()),
      fetch("/api/posts").then((r) => r.json().catch(() => ({}))),
    ])
      .then(([managementData, listData]) => {
        setData(managementData);
        const match = (listData.posts ?? []).find(
          (p: PostRowData) => p.manageToken === token
        );
        setPostInfo(match ?? null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleDelete() {
    if (!confirm("آیا از حذف این آگهی اطمینان دارید؟")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${token}/delete`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.push("/posts");
    else alert("حذف ناموفق بود");
  }

  const postToken = token.slice(0, 8);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/posts" className="text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </Link>
        <h1 className="text-xl font-bold">مدیریت آگهی</h1>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                وضعیت آگهی
                <Badge className="bg-success/15 text-success font-medium">
                  {data.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.publishedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">انتشار</span>
                  <span className="font-medium">{data.publishedAt}</span>
                </div>
              )}
              {data.expiresAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">انقضاء</span>
                  <span className="font-medium">{data.expiresAt}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">شناسه آگهی</span>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded ltr" dir="ltr">
                  {postToken}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI growth review for this post */}
          <AiReviewPanel
            endpoint={`/api/ai/review/post/${token}`}
            body={{
              title: postInfo?.title,
              priceText: postInfo?.priceText,
              location: postInfo?.location,
              imageCount: postInfo?.imageCount,
            }}
            title="بررسی این آگهی با هوش مصنوعی"
            triggerLabel="بررسی با هوش مصنوعی"
          />

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">عملیات</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {data.brandToken && (
                <Link href={`/posts/${token}/stats?brand=${data.brandToken}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <BarChart3 className="w-4 h-4" strokeWidth={1.8} />
                    آمار آگهی
                  </Button>
                </Link>
              )}
              <a
                href={`https://divar.ir/v/${postToken}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" strokeWidth={1.8} />
                  مشاهده در دیوار
                </Button>
              </a>
              <Link href={`/ai?post=${token}`}>
                <Button variant="outline" className="w-full gap-2">
                  <Sparkles className="w-4 h-4" strokeWidth={1.8} />
                  بهبود با AI
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                {deleting ? "در حال حذف..." : "حذف آگهی"}
              </Button>
            </CardContent>
          </Card>

          {/* Available Actions from Divar */}
          {data.actions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">امکانات دیوار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.actions.map((action) => (
                    <Badge key={action} variant="secondary" className="text-xs px-3 py-1">
                      {action}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-center py-8">خطا در بارگذاری اطلاعات</p>
      )}
    </div>
  );
}
