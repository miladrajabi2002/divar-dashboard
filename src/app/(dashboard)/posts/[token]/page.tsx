"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ManagementPageData } from "@/lib/divar/types";

export default function PostManagementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ManagementPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${token}`)
      .then((r) => r.json())
      .then(setData)
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
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
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

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">عملیات</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {data.brandToken && (
                <Link href={`/posts/${token}/stats?brand=${data.brandToken}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  مشاهده در دیوار
                </Button>
              </a>
              <Link href={`/ai?post=${token}`}>
                <Button variant="outline" className="w-full gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  بهبود با AI
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
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
