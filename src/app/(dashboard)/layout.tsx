"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { OtpLoginModal } from "@/components/auth/OtpLoginModal";
import { useSession } from "@/store/session";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrate, hydrated, isLoggedIn, openLoginModal } = useSession();

  // Hydrate session from the server on first load.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Once we know the real state, prompt login if there is no valid session.
  useEffect(() => {
    if (hydrated && !isLoggedIn) openLoginModal();
  }, [hydrated, isLoggedIn, openLoginModal]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border/70 bg-card/40 backdrop-blur flex items-center px-5 gap-3 flex-shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm font-medium text-foreground/80">
                داشبورد مدیریت آگهی‌های دیوار
              </p>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-5 sm:p-7">{children}</div>
        </main>
      </div>
      <OtpLoginModal />
    </SidebarProvider>
  );
}
