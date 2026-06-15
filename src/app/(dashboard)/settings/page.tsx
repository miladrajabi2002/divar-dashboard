"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/store/session";

export default function SettingsPage() {
  const { phone, expiresAt, isLoggedIn, openLoginModal, setLoggedOut } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSaveApiKey() {
    // In a real setup this would hit a server action
    localStorage.setItem("OPENROUTER_API_KEY", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                    variant={expiresAt.getTime() < Date.now() + 30 * 60 * 1000 ? "destructive" : "secondary"}
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

      {/* OpenRouter API Key */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">کلید API هوش مصنوعی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            کلید API از{" "}
            <span className="text-primary font-mono">openrouter.ai</span>{" "}
            برای استفاده از ابزارهای هوش مصنوعی
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm ltr"
              dir="ltr"
            />
            <Button onClick={handleSaveApiKey} disabled={!apiKey}>
              {saved ? "✓" : "ذخیره"}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            کلید در متغیر محیطی <code className="bg-muted px-1 rounded">OPENROUTER_API_KEY</code> در فایل{" "}
            <code className="bg-muted px-1 rounded">.env.local</code> ذخیره می‌شود
          </p>
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
          <div className="pt-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              مشاهده در GitHub
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
