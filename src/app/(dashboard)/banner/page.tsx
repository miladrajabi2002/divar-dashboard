"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SIZES = [
  { key: "square", label: "مربع (فید دیوار)", hint: "۱۰۸۰×۱۰۸۰" },
  { key: "landscape", label: "افقی", hint: "۱۰۸۰×۸۱۰" },
  { key: "portrait", label: "عمودی", hint: "۱۰۸۰×۱۳۵۰" },
] as const;

function BannerPageContent() {
  const searchParams = useSearchParams();
  const postToken = searchParams.get("post") ?? "";
  const [input, setInput] = useState("");
  const [size, setSize] = useState<(typeof SIZES)[number]["key"]>("square");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setImage("");
    try {
      const res = await fetch("/api/ai/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, size, postToken: postToken || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImage(data.image);
    } catch (e) {
      setError(String(e).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">بنرساز هوش مصنوعی</h1>
        <p className="text-muted-foreground mt-1">
          تولید تصویر بنر آگهی دیوار با مدل تصویر OpenRouter
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">🎨 توضیح محصول</CardTitle>
          <p className="text-muted-foreground text-sm">
            محصول و ویژگی‌های ظاهری آن را توصیف کنید تا بنری حرفه‌ای ساخته شود
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="مثال: گوشی سامسونگ گلکسی S24 مشکی، نو، در جعبه، روی پس‌زمینه مینیمال"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
          />

          <div>
            <label className="text-sm font-medium">اندازهٔ بنر</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {SIZES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSize(s.key)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    size === s.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 ltr" dir="ltr">
                    {s.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading || !input.trim()} className="w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                در حال ساخت بنر... (ممکن است چند ثانیه طول بکشد)
              </span>
            ) : (
              "ساخت بنر ✨"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm">{error}</div>
      )}

      {image && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">نتیجه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="بنر تولید شده" className="w-full rounded-lg border" />
            <a
              href={image}
              download="divar-banner.png"
              className="inline-flex items-center justify-center w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              دانلود بنر
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BannerPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground text-sm">در حال بارگذاری...</div>}>
      <BannerPageContent />
    </Suspense>
  );
}
