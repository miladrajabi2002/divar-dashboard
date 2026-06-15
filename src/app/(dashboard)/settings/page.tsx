"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/store/session";

// Curated OpenRouter models. Users can also type any model id manually.
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
  "google/gemini-2.5-flash-image-preview",
  "google/gemini-2.0-flash-exp:free",
  "openai/gpt-4o",
];

export default function SettingsPage() {
  const { phone, expiresAt, isLoggedIn, openLoginModal, setLoggedOut } = useSession();

  const [apiKey, setApiKey] = useState("");
  const [apiKeyMasked, setApiKeyMasked] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [textModel, setTextModel] = useState("");
  const [imageModel, setImageModel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">تنظیمات</h1>

      {/* Account Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">حساب دیوار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoggedIn && phone ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">شماره موبایل</span>
                <span className="font-mono ltr" dir="ltr">{phone}</span>
              </div>
              {expiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">انقضاء توکن</span>
                  <Badge
                    variant={expiresAt.getTime() < now + 30 * 60 * 1000 ? "destructive" : "secondary"}
                  >
                    {expiresAt.toLocaleTimeString("fa-IR")}
                  </Badge>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={openLoginModal} className="flex-1">
                  تجدید توکن
                </Button>
                <Button variant="destructive" size="sm" onClick={setLoggedOut} className="flex-1">
                  خروج
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-muted-foreground text-sm">وارد نشده‌اید</p>
              <Button onClick={openLoginModal}>ورود با OTP</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">پیکربندی هوش مصنوعی (OpenRouter)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium">کلید API</label>
            <Input
              type="password"
              placeholder={hasApiKey ? `ذخیره شده: ${apiKeyMasked}` : "sk-or-v1-..."}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm ltr"
              dir="ltr"
              disabled={loading}
            />
            <p className="text-muted-foreground text-xs">
              کلید را از{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono"
              >
                openrouter.ai/keys
              </a>{" "}
              بگیرید. برای حفظ کلید فعلی این فیلد را خالی بگذارید.
            </p>
          </div>

          {/* Text Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium">مدل متن (عنوان، توضیحات، تحلیل)</label>
            <ModelSelect
              value={textModel}
              onChange={setTextModel}
              options={TEXT_MODELS}
              disabled={loading}
            />
          </div>

          {/* Image Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium">مدل عکس (بنر آگهی)</label>
            <ModelSelect
              value={imageModel}
              onChange={setImageModel}
              options={IMAGE_MODELS}
              disabled={loading}
            />
            <p className="text-muted-foreground text-xs">
              فقط مدل‌هایی که خروجی تصویر دارند (image generation) را انتخاب کنید.
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving || loading} className="w-full">
            {saving ? "در حال ذخیره..." : saved ? "ذخیره شد ✓" : "ذخیره تنظیمات"}
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">درباره</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>داشبورد مدیریت آگهی‌های دیوار با هوش مصنوعی</p>
          <p>این پروژه از API‌های داخلی دیوار استفاده می‌کند و برای مدیریت شخصی آگهی‌ها طراحی شده است.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ModelSelect({
  value,
  onChange,
  options,
  disabled,
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
        className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background ltr disabled:opacity-50"
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
          <option key={m} value={m}>
            {m}
          </option>
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
