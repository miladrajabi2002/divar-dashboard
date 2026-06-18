"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Type,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Check,
  Copy,
  AlertCircle,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type AiTab = "title" | "description" | "image_prompt";

const TAB_CONFIG: Record<AiTab, { label: string; placeholder: string; hint: string; icon: LucideIcon }> = {
  title: {
    label: "عنوان",
    placeholder: "مثال: پایه تلویزیون سامسونگ ۵۵ اینچ، نو، با گارانتی",
    hint: "نوع محصول و ویژگی‌های اصلی را بنویسید تا ۵ عنوان پیشنهادی دریافت کنید",
    icon: Type,
  },
  description: {
    label: "متن آگهی",
    placeholder: "مثال: ماوس گیمینگ ایسوس، دست دوم، ۳ ماه کارکرده، همراه با باکس اصلی",
    hint: "اطلاعات محصول را شرح دهید تا یک متن آگهی حرفه‌ای دریافت کنید",
    icon: FileText,
  },
  image_prompt: {
    label: "ساخت بنر",
    placeholder: "مثال: گوشی سامسونگ گلکسی S24 مشکی، نو، در جعبه، روی پس‌زمینه مینیمال سفید",
    hint: "محصول را شرح دهید — هوش مصنوعی پرامپت تصویر را می‌سازد و بنر را خودکار تولید می‌کند",
    icon: ImageIcon,
  },
};

const BANNER_SIZES = [
  { key: "square", label: "مربع", sub: "1024×1024", icon: Square },
  { key: "landscape", label: "افقی", sub: "1792×1024", icon: RectangleHorizontal },
  { key: "portrait", label: "عمودی", sub: "1024×1792", icon: RectangleVertical },
] as const;

function AiPageContent() {
  const searchParams = useSearchParams();
  const postToken = searchParams.get("post") ?? "";
  const [activeTab, setActiveTab] = useState<AiTab>("title");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [size, setSize] = useState<(typeof BANNER_SIZES)[number]["key"]>("square");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerLoading, setBannerLoading] = useState(false);

  const cfg = TAB_CONFIG[activeTab];
  const Icon = cfg.icon;

  function resetOutputs() {
    setOutput("");
    setError("");
    setCopied(false);
    setBannerImage("");
  }

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    resetOutputs();

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, prompt: input, postToken: postToken || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOutput(data.output);
      setLoading(false);

      // Image-prompt flow auto-pipes straight into banner generation — no manual second step.
      if (activeTab === "image_prompt") {
        setBannerLoading(true);
        const bannerRes = await fetch("/api/ai/banner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: data.output, size, postToken: postToken || undefined }),
        });
        const bannerData = await bannerRes.json();
        if (!bannerRes.ok) throw new Error(bannerData.error);
        setBannerImage(bannerData.image);
      }
    } catch (e) {
      setError(String(e).replace("Error: ", ""));
    } finally {
      setLoading(false);
      setBannerLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">دستیار هوش مصنوعی</h1>
        <p className="text-muted-foreground text-sm mt-1">ابزارهای AI برای بهبود و تبلیغ آگهی‌های دیوار</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => { setActiveTab(v as AiTab); setInput(""); resetOutputs(); }}
      >
        <TabsList className="grid grid-cols-3 w-full h-auto p-1 gap-1">
          {(Object.keys(TAB_CONFIG) as AiTab[]).map((t) => {
            const TabIcon = TAB_CONFIG[t].icon;
            return (
              <TabsTrigger
                key={t}
                value={t}
                className="flex flex-col items-center gap-1 py-2.5 text-xs data-[state=active]:shadow-sm"
              >
                <TabIcon className={`w-4 h-4 ${activeTab === t ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.8} />
                <span>{TAB_CONFIG[t].label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(TAB_CONFIG) as AiTab[]).map((t) => (
          <TabsContent key={t} value={t} className="mt-4 space-y-4">
            <Card className="card-elevated border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" strokeWidth={1.8} />
                  {TAB_CONFIG[t].label}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{TAB_CONFIG[t].hint}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="textarea-field"
                  placeholder={TAB_CONFIG[t].placeholder}
                  value={t === activeTab ? input : ""}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                />

                {t === "image_prompt" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">اندازهٔ بنر</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {BANNER_SIZES.map((s) => {
                        const SizeIcon = s.icon;
                        return (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => setSize(s.key)}
                            className={`group p-3.5 rounded-xl border-2 text-center transition-all duration-150 ${
                              size === s.key
                                ? "border-primary bg-primary/8 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/60"
                            }`}
                          >
                            <SizeIcon
                              className={`w-5 h-5 mx-auto mb-1 ${size === s.key ? "text-primary" : "text-muted-foreground/50"}`}
                              strokeWidth={1.6}
                            />
                            <div className={`text-sm font-semibold ${size === s.key ? "text-primary" : "text-foreground"}`}>
                              {s.label}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 ltr" dir="ltr">
                              {s.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={loading || bannerLoading || !input.trim()}
                  className="w-full h-11 font-semibold gap-2"
                >
                  {loading || bannerLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {bannerLoading ? "در حال ساخت بنر..." : "در حال تولید..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" strokeWidth={2} />
                      تولید با AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/20 text-destructive rounded-xl text-sm fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <p className="break-words">{error}</p>
              </div>
            )}

            {output && t !== "image_prompt" && (
              <Card className="card-elevated border-border/50 fade-in">
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">نتیجه</CardTitle>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors ${
                      copied
                        ? "bg-success/15 text-success"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        کپی شد
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" strokeWidth={1.8} />
                        کپی
                      </>
                    )}
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-7 bg-muted/40 p-4 rounded-xl border border-border/40">
                    {output}
                  </div>
                </CardContent>
              </Card>
            )}

            {t === "image_prompt" && bannerImage && (
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
                    src={bannerImage}
                    alt="بنر تولید شده"
                    className="w-full rounded-xl border border-border/60 shadow-sm"
                  />
                  <a
                    href={bannerImage}
                    download="divar-banner.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" strokeWidth={2} />
                    دانلود بنر
                  </a>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function AiPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        در حال بارگذاری...
      </div>
    }>
      <AiPageContent />
    </Suspense>
  );
}
