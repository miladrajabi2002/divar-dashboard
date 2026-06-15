"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SIZES = [
  { key: "square",    label: "مربع",   sub: "۱۰۲۴×۱۰۲۴", icon: "⬛" },
  { key: "landscape", label: "افقی",   sub: "۱۷۹۲×۱۰۲۴", icon: "▬" },
  { key: "portrait",  label: "عمودی",  sub: "۱۰۲۴×۱۷۹۲", icon: "▮" },
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
        <h1 className="text-2xl font-bold tracking-tight">بنرساز هوش مصنوعی</h1>
        <p className="text-muted-foreground text-sm mt-1">
          تولید تصویر بنر حرفه‌ای برای آگهی دیوار با DALL-E و OpenRouter
        </p>
      </div>

      <Card className="card-elevated border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">توصیف محصول</CardTitle>
          <p className="text-muted-foreground text-sm">
            محصول و ویژگی‌های ظاهری آن را شرح دهید
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <textarea
            className="textarea-field"
            placeholder="مثال: گوشی سامسونگ گلکسی S24 مشکی، نو، در جعبه، روی پس‌زمینه مینیمال سفید"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">اندازهٔ بنر</p>
            <div className="grid grid-cols-3 gap-2.5">
              {SIZES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSize(s.key)}
                  className={`group p-3.5 rounded-xl border-2 text-center transition-all duration-150 ${
                    size === s.key
                      ? "border-primary bg-primary/8 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/60"
                  }`}
                >
                  <div className={`text-xl mb-1 ${size === s.key ? "opacity-100" : "opacity-40"}`}>
                    {s.icon}
                  </div>
                  <div className={`text-sm font-semibold ${size === s.key ? "text-primary" : "text-foreground"}`}>
                    {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 ltr" dir="ltr">
                    {s.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full h-11 text-base font-semibold gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                در حال ساخت بنر...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ساخت بنر
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/20 text-destructive rounded-xl text-sm fade-in">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="break-words">{error}</p>
        </div>
      )}

      {image && (
        <Card className="card-elevated border-border/50 fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal flex items-center justify-between">
              <span>بنر تولید شده</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">آماده دانلود</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="بنر تولید شده"
              className="w-full rounded-xl border border-border/60 shadow-sm"
            />
            <a
              href={image}
              download="divar-banner.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
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
    <Suspense fallback={
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm gap-2">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        در حال بارگذاری...
      </div>
    }>
      <BannerPageContent />
    </Suspense>
  );
}
