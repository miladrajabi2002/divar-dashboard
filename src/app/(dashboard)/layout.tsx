"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { OtpLoginModal } from "@/components/auth/OtpLoginModal";
import { useSession } from "@/store/session";
import { useEffect } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/overview": "داشبورد",
  "/posts": "آگهی‌های من",
  "/ai": "دستیار هوش مصنوعی",
  "/banner": "بنرساز",
  "/settings": "تنظیمات",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (prefix !== "/overview" && pathname.startsWith(prefix)) return title;
  }
  return "داشبورد دیوار";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrate, hydrated, isLoggedIn, openLoginModal } = useSession();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !isLoggedIn) openLoginModal();
  }, [hydrated, isLoggedIn, openLoginModal]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b border-border/60 bg-card/60 backdrop-blur-sm flex items-center px-5 gap-3 flex-shrink-0 sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <div className="h-4 w-px bg-border" />
            <h2 className="text-sm font-semibold text-foreground">{pageTitle}</h2>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground hidden sm:block">دیوار داشبورد</span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-5 sm:p-7 fade-in">{children}</div>
        </main>
      </div>
      <OtpLoginModal />
    </SidebarProvider>
  );
}
