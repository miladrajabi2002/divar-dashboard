"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/store/session";
import { User, Loader2, Wifi, CheckCircle2, XCircle, Check } from "lucide-react";

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
        setTextModel(d.textModel ?? "");
        setImageModel(d.imageModel ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setTestResult(null);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textModel, imageModel }),
      });
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
                    {expiresAt.toLocaleTimeString("en-US")}
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
                <User className="w-6 h-6 text-primary" strokeWidth={1.8} />
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

          {/* Connection test — the API key is read from the server's .env, not entered here */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">وضعیت اتصال</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing || loading}
                className="shrink-0 gap-1.5"
              >
                {testing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wifi className="w-3.5 h-3.5" strokeWidth={2} />
                )}
                تست اتصال
              </Button>
            </div>

            {testResult && (
              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-sm ${testResult.ok ? "bg-emerald-500/10 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
                {testResult.ok ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
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
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                    <p>{testResult.message}</p>
                  </>
                )}
              </div>
            )}

            <p className="text-muted-foreground text-xs">
              کلید OpenRouter از فایل <span className="font-mono">.env.local</span> روی سرور خوانده می‌شود
              (متغیر <span className="font-mono">OPENROUTER_API_KEY</span>). کلید را از{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono">
                openrouter.ai/keys
              </a>{" "}
              بگیرید.
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
            {saving ? "در حال ذخیره..." : saved ? <><Check className="w-4 h-4 inline ml-1" strokeWidth={2.5} />ذخیره شد</> : "ذخیره تنظیمات"}
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
