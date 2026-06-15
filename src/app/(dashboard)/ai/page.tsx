"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type AiTab = "title" | "description" | "analysis" | "image_prompt";

const TAB_CONFIG: Record<
  AiTab,
  { label: string; placeholder: string; hint: string; icon: string }
> = {
  title: {
    label: "عنوان آگهی",
    placeholder: "مثال: پایه تلویزیون سامسونگ ۵۵ اینچ، نو، با گارانتی",
    hint: "نوع محصول، ویژگی‌های اصلی، و شرایط را بنویسید تا ۵ عنوان پیشنهادی دریافت کنید",
    icon: "✏️",
  },
  description: {
    label: "متن آگهی",
    placeholder: "مثال: ماوس گیمینگ ایسوس، دست دوم، ۳ ماه کارکرده، همراه با باکس اصلی",
    hint: "اطلاعات محصول را شرح دهید تا یک متن آگهی حرفه‌ای دریافت کنید",
    icon: "📝",
  },
  analysis: {
    label: "تحلیل آمار",
    placeholder: "مثال: نمایش: ۳۸۶۱، بازدید: ۸۰، تماس: ۱، چت: ۳، جایگاه: ۱۵۶۶",
    hint: "آمار آگهی خود را وارد کنید تا تحلیل و پیشنهادات بهبود دریافت کنید",
    icon: "📊",
  },
  image_prompt: {
    label: "پرامپت تصویر",
    placeholder: "مثال: پایه ال‌سی‌دی سامسونگ، رنگ مشکی، متریال فلزی",
    hint: "توضیح محصول را بنویسید تا یک پرامپت AI برای تولید تصویر حرفه‌ای دریافت کنید",
    icon: "🎨",
  },
};

function AiPageContent() {
  const searchParams = useSearchParams();
  const postToken = searchParams.get("post") ?? "";
  const [activeTab, setActiveTab] = useState<AiTab>("title");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cfg = TAB_CONFIG[activeTab];

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          prompt: input,
          postToken: postToken || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOutput(data.output);
    } catch (e) {
      setError(String(e).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">دستیار هوش مصنوعی</h1>
        <p className="text-muted-foreground mt-1">
          ابزارهای AI برای بهبود آگهی‌های دیوار
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as AiTab); setOutput(""); setError(""); }}>
        <TabsList className="grid grid-cols-4 w-full">
          {(Object.keys(TAB_CONFIG) as AiTab[]).map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">
              {TAB_CONFIG[t].icon} {TAB_CONFIG[t].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(TAB_CONFIG) as AiTab[]).map((t) => (
          <TabsContent key={t} value={t} className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {TAB_CONFIG[t].icon} {TAB_CONFIG[t].label}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{TAB_CONFIG[t].hint}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={TAB_CONFIG[t].placeholder}
                  value={t === activeTab ? input : ""}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      در حال تولید...
                    </span>
                  ) : (
                    "تولید با AI ✨"
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm">
                {error}
              </div>
            )}

            {output && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-normal flex items-center justify-between">
                    نتیجه
                    <button
                      onClick={() => navigator.clipboard.writeText(output)}
                      className="text-primary hover:underline text-xs"
                    >
                      کپی
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-7 bg-muted/50 p-4 rounded-lg">
                    {output}
                  </div>
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
    <Suspense fallback={<div className="p-6 text-muted-foreground text-sm">در حال بارگذاری...</div>}>
      <AiPageContent />
    </Suspense>
  );
}
