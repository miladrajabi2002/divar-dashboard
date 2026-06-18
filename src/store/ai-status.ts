"use client";

import { create } from "zustand";

interface AiStatusState {
  connected: boolean | null;
  checked: boolean;
  check: () => Promise<void>;
}

export const useAiStatus = create<AiStatusState>((set) => ({
  connected: null,
  checked: false,

  check: async () => {
    try {
      const res = await fetch("/api/ai/test-connection", { cache: "no-store" });
      const d = await res.json();
      set({ connected: Boolean(d.ok), checked: true });
    } catch {
      set({ connected: false, checked: true });
    }
  },
}));
