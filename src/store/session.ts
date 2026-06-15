"use client";

import { create } from "zustand";

interface SessionState {
  isLoggedIn: boolean;
  phone: string | null;
  expiresAt: Date | null;
  showLoginModal: boolean;
  setLoggedIn: (phone: string, expiresAt: Date) => void;
  setLoggedOut: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  checkExpiry: () => boolean;
}

export const useSession = create<SessionState>((set, get) => ({
  isLoggedIn: false,
  phone: null,
  expiresAt: null,
  showLoginModal: false,

  setLoggedIn: (phone, expiresAt) =>
    set({ isLoggedIn: true, phone, expiresAt, showLoginModal: false }),

  setLoggedOut: () =>
    set({ isLoggedIn: false, phone: null, expiresAt: null }),

  openLoginModal: () => set({ showLoginModal: true }),
  closeLoginModal: () => set({ showLoginModal: false }),

  checkExpiry: () => {
    const { expiresAt } = get();
    if (!expiresAt) return true;
    return expiresAt.getTime() < Date.now() + 5 * 60 * 1000;
  },
}));
