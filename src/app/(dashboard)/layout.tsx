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
  const { checkExpiry, openLoginModal, isLoggedIn } = useSession();

  useEffect(() => {
    if (checkExpiry()) openLoginModal();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="h-5 w-px bg-border" />
            <p className="text-sm text-muted-foreground">داشبورد مدیریت آگهی‌های دیوار</p>
          </header>
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>
      <OtpLoginModal />
    </SidebarProvider>
  );
}
