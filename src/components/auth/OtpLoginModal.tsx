"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/OtpInput";
import { useSession } from "@/store/session";
import { X, Phone, ShieldCheck, AlertCircle, Loader2, ArrowRight, Pencil } from "lucide-react";

const OTP_LENGTH = 5;

export function OtpLoginModal() {
  const { showLoginModal, closeLoginModal, setLoggedIn, hydrate, isLoggedIn } =
    useSession();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (!showLoginModal) return null;

  async function sendOtp() {
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
      setCode("");
      setCountdown(120);
    } catch (e) {
      setError(String(e).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  }

  async function verify(finalCode: string) {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: finalCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLoggedIn(phone, new Date(data.expiresAt));
      await hydrate();
      setStep("phone");
      setCode("");
    } catch (e) {
      setError(String(e).replace("Error: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        {/* gradient header with decorative glow */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/65 px-6 pt-8 pb-14 text-center">
          <div className="pointer-events-none absolute -top-10 -right-6 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
          {isLoggedIn && (
            <button
              onClick={closeLoginModal}
              className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
              aria-label="بستن"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          )}
          <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur shadow-inner">
            {step === "phone" ? (
              <Phone className="h-8 w-8 text-white" strokeWidth={2} />
            ) : (
              <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2} />
            )}
          </div>
          <h2 className="relative text-lg font-bold text-white">ورود به حساب دیوار</h2>
          <p className="relative mt-1 text-sm text-white/85">
            {step === "phone" ? (
              "شماره موبایل خود را وارد کنید"
            ) : (
              <span className="ltr inline-block" dir="ltr">کد ارسال‌شده به {phone}</span>
            )}
          </p>

          {/* step dots */}
          <div className="relative mt-4 flex items-center justify-center gap-1.5">
            <span className={`h-1.5 rounded-full transition-all ${step === "phone" ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            <span className={`h-1.5 rounded-full transition-all ${step === "code" ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
          </div>
        </div>

        {/* body lifted over header */}
        <div className="-mt-6 rounded-t-3xl bg-card px-6 pb-6 pt-6">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={(e) => { e.preventDefault(); sendOtp(); }}
                className="space-y-4"
              >
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" strokeWidth={1.8} />
                  <Input
                    type="tel"
                    placeholder="09123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="h-12 text-center text-lg tracking-[0.2em] ltr pr-10"
                    dir="ltr"
                    maxLength={11}
                    autoFocus
                  />
                </div>
                {error && <ErrorLine text={error} />}
                <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={loading || phone.length < 11}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
                  {loading ? "در حال ارسال..." : "دریافت کد تأیید"}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={(e) => { e.preventDefault(); verify(code); }}
                className="space-y-4"
              >
                <OtpInput
                  value={code}
                  onChange={(v) => { setCode(v); setError(""); }}
                  length={OTP_LENGTH}
                  autoFocus
                  disabled={loading}
                  onComplete={(v) => verify(v)}
                />
                {error && <ErrorLine text={error} />}
                <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={loading || code.length < OTP_LENGTH}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" strokeWidth={2.2} />}
                  {loading ? "در حال تأیید..." : "تأیید و ورود"}
                </Button>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                    تغییر شماره
                  </button>
                  <span className="text-border">|</span>
                  {countdown > 0 ? (
                    <span className="text-muted-foreground tabular-nums">
                      ارسال مجدد تا <span className="ltr inline-block" dir="ltr">{countdown}</span> ثانیه
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={loading}
                      className="text-primary font-medium hover:underline"
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-destructive text-sm">
      <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
      <span>{text}</span>
    </div>
  );
}
