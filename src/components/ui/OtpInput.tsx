"use client";

import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  onComplete?: (v: string) => void;
}

// Segmented one-box-per-digit OTP input. Boxes are LTR (codes read left→right)
// and English-digit only. Handles paste, backspace and arrow navigation.
export function OtpInput({
  value,
  onChange,
  length = 5,
  autoFocus,
  disabled,
  onComplete,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusBox = (i: number) => {
    const el = refs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const handleInput = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    const next = [...chars];
    if (digits.length > 1) {
      let j = i;
      for (const ch of digits) {
        if (j >= length) break;
        next[j] = ch;
        j++;
      }
      commit(next.join(""));
      focusBox(Math.min(j, length - 1));
      return;
    }
    next[i] = digits;
    commit(next.join(""));
    if (i < length - 1) focusBox(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...chars];
      if (next[i]) {
        next[i] = "";
        onChange(next.join(""));
      } else if (i > 0) {
        next[i - 1] = "";
        onChange(next.join(""));
        focusBox(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      focusBox(i - 1);
    } else if (e.key === "ArrowRight" && i < length - 1) {
      focusBox(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    commit(text);
    focusBox(Math.min(text.length, length - 1));
  };

  return (
    <div className="flex justify-center gap-2.5" dir="ltr">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={c}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`h-14 w-12 rounded-2xl border-2 bg-background text-center text-2xl font-bold tabular-nums outline-none transition-all ${
            c
              ? "border-primary text-primary shadow-sm shadow-primary/10"
              : "border-border text-foreground"
          } focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
