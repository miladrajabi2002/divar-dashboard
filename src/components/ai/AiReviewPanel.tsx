"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, Sparkles, X, RefreshCw } from "lucide-react";
import { Markdown } from "@/components/ui/Markdown";

interface AiReviewPanelProps {
  /** The endpoint to POST to in order to start streaming the review. */
  endpoint: string;
  /** Optional JSON body to send with the request. */
  body?: unknown;
  title?: string;
  triggerLabel?: string;
}

export function AiReviewPanel({
  endpoint,
  body,
  title = "بررسی با هوش مصنوعی",
  triggerLabel = "بررسی با هوش مصنوعی",
}: AiReviewPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setStreaming(false);
    setAnswer(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "خطا در دریافت گزارش هوش مصنوعی");
      }
      if (!res.body) throw new Error("پاسخی از سرور دریافت نشد");

      setLoading(false);
      setStreaming(true);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAnswer(accumulated);
      }
      const tail = decoder.decode();
      if (tail) {
        accumulated += tail;
        setAnswer(accumulated);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
      setAnswer(null);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  return (
    <div className="card-elevated rounded-2xl border border-primary/25 bg-primary/[0.03] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
        {!open ? (
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              if (!answer) void run();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            {triggerLabel}
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void run()}
              disabled={loading || streaming}
              aria-label="بازآوری گزارش"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading || streaming ? "animate-spin" : ""}`} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              {loading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> در حال جمع‌آوری اطلاعات...
                </div>
              ) : streaming && answer === null ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> در حال فکر کردن...
                </div>
              ) : answer !== null ? (
                <div>
                  <Markdown text={answer} />
                  {streaming && (
                    <span className="mr-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse rounded-sm bg-primary" />
                  )}
                </div>
              ) : (
                <p className="py-2 text-sm text-muted-foreground">گزارشی موجود نیست.</p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
