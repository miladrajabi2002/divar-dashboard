"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/store/session";
import { X, Lock } from "lucide-react";

export function OtpLoginModal() {
  const { showLoginModal, closeLoginModal, setLoggedIn, hydrate, isLoggedIn } =
    useSession();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (!showLoginModal) return null;

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("code");
      setCountdown(120);
    } catch (e) {
      setError(String(e).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLoggedIn(phone, new Date(data.expiresAt));
      // Re-sync from the server so the whole app reflects the real session.
      await hydrate();
      // Reset for next time.
      setStep("phone");
      setCode("");
    } catch (e) {
      setError(String(e).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* gradient header */}
        <div className="relative bg-gradient-to-br from-primary to-primary/70 px-6 pt-8 pb-12 text-center">
          {isLoggedIn && (
            <button
              onClick={closeLoginModal}
              className="absolute top-4 left-4 text-white/80 hover:text-white"
              aria-label="بستن"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          )}
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Lock className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-bold text-white">ورود به حساب دیوار</h2>
          <p className="mt-1 text-sm text-white/80">
            {step === "phone"
              ? "شماره موبایل خود را وارد کنید"
              : `کد ارسال‌شده به ${phone}`}
          </p>
        </div>

        {/* body card lifted over header */}
        <div className="-mt-6 rounded-t-3xl bg-card px-6 pb-6 pt-6">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="h-12 text-center text-lg tracking-widest ltr"
                dir="ltr"
                maxLength={11}
                autoFocus
              />
              {error && <p className="text-destructive text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full h-11" disabled={loading || phone.length < 11}>
                {loading ? "در حال ارسال..." : "دریافت کد تأیید"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                ref={codeRef}
                type="text"
                inputMode="numeric"
                placeholder="– – – – –"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="h-12 text-center text-2xl tracking-[0.5em] ltr"
                dir="ltr"
                maxLength={6}
              />
              {error && <p className="text-destructive text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full h-11" disabled={loading || code.length < 4}>
                {loading ? "در حال تأیید..." : "تأیید و ورود"}
              </Button>
              <div className="text-center">
                {countdown > 0 ? (
                  <span className="text-muted-foreground text-sm">
                    ارسال مجدد کد تا {countdown} ثانیه دیگر
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    تغییر شماره / ارسال مجدد
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
