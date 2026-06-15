"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/store/session";

const TEXT_MODELS = [
  "anthropic/claude-sonnet-4-6",
  "anthropic/claude-opus-4-8",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-chat",
];

const IMAGE_MODELS = [
  "openai/dall-e-3",
  "openai/dall-e-2",
  "stability/stable-image-core",
  "stability/stable-diffusion-xl-1024-v1-0",
];

type TestResult =
  | { ok: true; label?: string; usage?: number; limit?: number; is_free_tier?: boolean }
  | { ok: false; message: string };

export default function SettingsPage() {
  const { phone, expiresAt, isLoggedIn, openLoginModal, logout } = useSession();

  const [apiKey, setApiKey] = useState("");
  const [apiKeyMasked, setApiKeyMasked] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [textModel, setTextModel] = useState("");
  const [imageModel, setImageModel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setHasApiKey(d.hasApiKey);
        setApiKeyMasked(d.apiKeyMasked ?? "");
        setTextModel(d.textModel ?? "");
        setImageModel(d.imageModel ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          textModel,
          imageModel,
        }),
      });
      const d = await res.json();
      setHasApiKey(d.hasApiKey);
      setApiKeyMasked(d.apiKeyMasked ?? "");
      setApiKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/test-connection");
      const d = await res.json();
      setTestResult(d);
    } catch {
      setTestResult({ ok: false, message: "خطا در ارسال درخواست" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تنظیمات</h1>
        <p className="text-muted-foreground text-sm mt-1">مدیریت حساب و پیکربندی هوش مصنوعی</p>
      </div>

      {/* Account */}
      <Card className="card-elevated border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            حساب دیوار
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoggedIn && phone ? (
            <>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">شماره موبایل</span>
                <span className="font-mono text-sm ltr" dir="ltr">{phone}</span>
              </div>
              {expiresAt && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">انقضاء توکن</span>
                  <Badge
                    variant={expiresAt.getTime() < now + 30 * 60 * 1000 ? "destructive" : "secondary"}
                    className="font-mono"
                  >
                    {expiresAt.toLocaleTimeString("fa-IR")}
                  </Badge>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={openLoginModal} className="flex-1">
                  تجدید توکن
                </Button>
                <Button variant="destructive" size="sm" onClick={logout} className="flex-1">
                  خروج
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm">وارد نشده‌اید</p>
              <Button onClick={openLoginModal} size="sm">ورود با OTP</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Config */}
      <Card className="card-elevated border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            هوش مصنوعی — OpenRouter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium">کلید API</label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder={hasApiKey ? `ذخیره شده: ${apiKeyMasked}` : "sk-or-v1-..."}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
                className="font-mono text-sm ltr flex-1"
                dir="ltr"
                disabled={loading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing || loading || (!hasApiKey && !apiKey.trim())}
                className="shrink-0 gap-1.5"
              >
                {testing ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                )}
                تست
              </Button>
            </div>

            {testResult && (
              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-sm ${testResult.ok ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
                {testResult.ok ? (
                  <>
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="space-y-0.5">
                      <p className="font-medium">اتصال برقرار است</p>
                      {testResult.label && <p className="text-xs opacity-80">{testResult.label}</p>}
                      {testResult.usage != null && (
                        <p className="text-xs opacity-80 ltr" dir="ltr">
                          Used: ${testResult.usage.toFixed(4)}
                          {testResult.limit ? ` / $${testResult.limit}` : ""}
                          {testResult.is_free_tier ? " (free tier)" : ""}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{testResult.message}</p>
                  </>
                )}
              </div>
            )}

            <p className="text-muted-foreground text-xs">
              کلید را از{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">
                openrouter.ai/keys
              </a>{" "}
              بگیرید. برای حفظ کلید فعلی این فیلد را خالی بگذارید.
            </p>
          </div>

          {/* Text Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium">مدل متن</label>
            <p className="text-muted-foreground text-xs">برای تولید عنوان، توضیحات و تحلیل آگهی</p>
            <ModelSelect value={textModel} onChange={setTextModel} options={TEXT_MODELS} disabled={loading} />
          </div>

          {/* Image Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium">مدل تصویر</label>
            <p className="text-muted-foreground text-xs">برای بنرساز — باید از <span className="font-mono">/images/generations</span> API پشتیبانی کند</p>
            <ModelSelect value={imageModel} onChange={setImageModel} options={IMAGE_MODELS} disabled={loading} />
          </div>

          <Button onClick={handleSave} disabled={saving || loading} className="w-full">
            {saving ? "در حال ذخیره..." : saved ? "✓ ذخیره شد" : "ذخیره تنظیمات"}
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="card-elevated border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">درباره</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          <p>داشبورد مدیریت آگهی‌های دیوار با هوش مصنوعی</p>
          <p>از API‌های داخلی دیوار و OpenRouter استفاده می‌کند.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ModelSelect({
  value, onChange, options, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  const isCustom = value !== "" && !options.includes(value);
  const [custom, setCustom] = useState(isCustom);

  return (
    <div className="space-y-2">
      <select
        className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background ltr disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
        dir="ltr"
        value={custom ? "__custom__" : value}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === "__custom__") {
            setCustom(true);
          } else {
            setCustom(false);
            onChange(e.target.value);
          }
        }}
      >
        {options.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
        <option value="__custom__">سفارشی (وارد کردن دستی)…</option>
      </select>
      {custom && (
        <Input
          placeholder="provider/model-id"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm ltr"
          dir="ltr"
          disabled={disabled}
        />
      )}
    </div>
  );
}
