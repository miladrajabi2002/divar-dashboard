"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AiTab = "title" | "description" | "analysis" | "image_prompt";

const TAB_CONFIG: Record<AiTab, { label: string; placeholder: string; hint: string; icon: React.ReactNode }> = {
  title: {
    label: "عنوان",
    placeholder: "مثال: پایه تلویزیون سامسونگ ۵۵ اینچ، نو، با گارانتی",
    hint: "نوع محصول و ویژگی‌های اصلی را بنویسید تا ۵ عنوان پیشنهادی دریافت کنید",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  },
  description: {
    label: "متن آگهی",
    placeholder: "مثال: ماوس گیمینگ ایسوس، دست دوم، ۳ ماه کارکرده، همراه با باکس اصلی",
    hint: "اطلاعات محصول را شرح دهید تا یک متن آگهی حرفه‌ای دریافت کنید",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  analysis: {
    label: "تحلیل آمار",
    placeholder: "مثال: نمایش: ۳۸۶۱، بازدید: ۸۰، تماس: ۱، چت: ۳، جایگاه: ۱۵۶۶",
    hint: "آمار آگهی را وارد کنید تا تحلیل و پیشنهادات بهبود دریافت کنید",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  image_prompt: {
    label: "پرامپت تصویر",
    placeholder: "مثال: پایه ال‌سی‌دی سامسونگ، رنگ مشکی، متریال فلزی",
    hint: "توضیح محصول را بنویسید تا یک پرامپت AI برای تولید تصویر حرفه‌ای دریافت کنید",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
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
  const [copied, setCopied] = useState(false);

  const cfg = TAB_CONFIG[activeTab];

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");
    setCopied(false);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, prompt: input, postToken: postToken || undefined }),
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

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">دستیار هوش مصنوعی</h1>
        <p className="text-muted-foreground text-sm mt-1">ابزارهای AI برای بهبود آگهی‌های دیوار</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => { setActiveTab(v as AiTab); setOutput(""); setError(""); setCopied(false); }}
      >
        <TabsList className="grid grid-cols-4 w-full h-auto p-1 gap-1">
          {(Object.keys(TAB_CONFIG) as AiTab[]).map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="flex flex-col items-center gap-1 py-2.5 text-xs data-[state=active]:shadow-sm"
            >
              <span className={activeTab === t ? "text-primary" : "text-muted-foreground"}>
                {TAB_CONFIG[t].icon}
              </span>
              <span>{TAB_CONFIG[t].label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(TAB_CONFIG) as AiTab[]).map((t) => (
          <TabsContent key={t} value={t} className="mt-4 space-y-4">
            <Card className="card-elevated border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-primary">{TAB_CONFIG[t].icon}</span>
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
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className="w-full h-11 font-semibold gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      در حال تولید...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      تولید با AI
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
                <p>{error}</p>
              </div>
            )}

            {output && (
              <Card className="card-elevated border-border/50 fade-in">
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">نتیجه</CardTitle>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors ${
                      copied
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        کپی شد
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
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
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        در حال بارگذاری...
      </div>
    }>
      <AiPageContent />
    </Suspense>
  );
}
