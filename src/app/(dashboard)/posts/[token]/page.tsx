"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AiReviewPanel } from "@/components/ai/AiReviewPanel";
import { PostStatsView } from "@/components/posts/PostStatsView";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import toast from "react-hot-toast";
import { ChevronRight, ExternalLink, Sparkles, Trash2, MapPin, Image as ImageIcon, Loader2 } from "lucide-react";
import type { ManagementPageData, PostRowData, PostStatsData } from "@/lib/divar/types";

export default function PostViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ManagementPageData | null>(null);
  const [postInfo, setPostInfo] = useState<PostRowData | null>(null);
  const [stats, setStats] = useState<PostStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

        // Once we have the brand token, pull the full stats inline.
        if (managementData?.brandToken) {
          fetch(`/api/posts/${token}/stats?brand=${managementData.brandToken}`)
            .then((r) => r.json())
            .then((d) => { if (!d.error) setStats(d); })
            .catch(() => {})
            .finally(() => setStatsLoading(false));
        } else {
          setStatsLoading(false);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/posts/${token}/delete`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("آگهی حذف شد");
      router.push("/posts");
    } else {
      toast.error("حذف ناموفق بود");
      setConfirmOpen(false);
    }
  }

  const postToken = token.slice(0, 8);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/posts" className="text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </Link>
        <h1 className="text-xl font-bold">مشاهده آگهی</h1>
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
          {/* Post header: image + title + price + status */}
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-muted flex-shrink-0 overflow-hidden relative">
                  {postInfo?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={postInfo.imageUrl}
                      alt={postInfo.title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                      <ImageIcon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-base leading-snug">{postInfo?.title || "آگهی"}</h2>
                    {data.status && (
                      <Badge className="bg-success/15 text-success font-medium shrink-0">{data.status}</Badge>
                    )}
                  </div>
                  {postInfo?.priceText && <p className="text-primary font-bold text-sm">{postInfo.priceText}</p>}
                  {postInfo?.location && (
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                      {postInfo.location}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                    {data.publishedAt && <span>انتشار: {data.publishedAt}</span>}
                    {data.expiresAt && <span>انقضاء: {data.expiresAt}</span>}
                  </div>
                </div>
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

          {/* Inline stats */}
          {statsLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
              </div>
            </div>
          ) : stats ? (
            <div className="fade-in">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">آمار عملکرد آگهی</h3>
              <PostStatsView stats={stats} />
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                <Loader2 className="w-5 h-5 mx-auto mb-2 opacity-40" />
                آماری برای این آگهی موجود نیست — از داشبورد روی «بروزرسانی» بزنید.
              </CardContent>
            </Card>
          )}

          {/* Operations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">عملیات</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <a href={`https://divar.ir/v/${postToken}`} target="_blank" rel="noopener noreferrer">
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
                className="w-full gap-2 col-span-2"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                حذف آگهی
              </Button>
            </CardContent>
          </Card>

          {/* Available actions from Divar */}
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="حذف آگهی"
        description="با حذف این آگهی، از دیوار هم حذف می‌شود و قابل بازگشت نیست. مطمئن هستید؟"
        confirmLabel="حذف کن"
        cancelLabel="انصراف"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
