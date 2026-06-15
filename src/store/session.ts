"use client";

import { create } from "zustand";

interface SessionState {
  isLoggedIn: boolean;
  phone: string | null;
  expiresAt: Date | null;
  showLoginModal: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLoggedIn: (phone: string, expiresAt: Date) => void;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  checkExpiry: () => boolean;
}

export const useSession = create<SessionState>((set, get) => ({
  isLoggedIn: false,
  phone: null,
  expiresAt: null,
  showLoginModal: false,
  hydrated: false,

  // Ask the server (source of truth) whether a valid session exists.
  hydrate: async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const d = await res.json();
      set({
        isLoggedIn: Boolean(d.loggedIn),
        phone: d.phone ?? null,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setLoggedIn: (phone, expiresAt) =>
    set({ isLoggedIn: true, phone, expiresAt, showLoginModal: false }),

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network errors on logout
    }
    set({ isLoggedIn: false, phone: null, expiresAt: null });
  },

  openLoginModal: () => set({ showLoginModal: true }),
  closeLoginModal: () => set({ showLoginModal: false }),

  checkExpiry: () => {
    const { expiresAt } = get();
    if (!expiresAt) return true;
    return expiresAt.getTime() < Date.now() + 5 * 60 * 1000;
  },
}));
