"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, Sparkles, Settings, LogIn, LogOut, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/store/session";

const NAV_ITEMS = [
  { title: "داشبورد", href: "/overview", icon: LayoutGrid },
  { title: "آگهی‌های من", href: "/posts", icon: FileText },
  { title: "دستیار هوش مصنوعی", href: "/ai", icon: Sparkles },
  { title: "تنظیمات", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { phone, expiresAt, openLoginModal, logout } = useSession();

  const isExpiringSoon = expiresAt
    ? expiresAt.getTime() < Date.now() + 30 * 60 * 1000
    : false;

  return (
    <Sidebar side="right" className="border-l border-sidebar-border bg-sidebar">
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 shadow-md shadow-primary/20 flex-shrink-0">
            <Zap className="w-[22px] h-[22px] text-white" strokeWidth={2} fill="currentColor" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sidebar-foreground font-extrabold text-base leading-tight tracking-tight">داشبورد دیوار</h1>
            <p className="text-muted-foreground text-[11px] mt-0.5">مدیریت هوشمند آگهی‌ها</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2.5 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 text-[11px] px-2.5">منو</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/overview" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="relative gap-3 px-3 py-5 rounded-xl text-[13.5px] font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold"
                    >
                      <Icon className={`w-[18px] h-[18px] ${isActive ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.8} />
                      <span>{item.title}</span>
                      {isActive && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-primary" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/60">
        {phone ? (
          <div className="rounded-2xl border border-sidebar-border bg-card p-2.5 card-elevated">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-[11px] font-bold">
                  {phone.slice(-4)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sidebar-foreground text-xs font-bold truncate ltr text-right" dir="ltr">
                  {phone}
                </p>
                {isExpiringSoon ? (
                  <button
                    onClick={openLoginModal}
                    className="text-[10px] mt-0.5 text-destructive font-medium flex items-center gap-1 hover:underline"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive blink-dot" />
                    توکن رو به انقضا — تجدید
                  </button>
                ) : (
                  <p className="text-success text-[10px] mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
                    متصل به دیوار
                  </p>
                )}
              </div>
              <button
                onClick={logout}
                aria-label="خروج"
                className="flex-shrink-0 rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openLoginModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-gradient-to-br from-primary to-primary/85 text-primary-foreground hover:opacity-90 transition-opacity text-sm font-semibold shadow-md shadow-primary/20"
          >
            <LogIn className="w-4 h-4" strokeWidth={2} />
            ورود به دیوار
          </button>
        )}
        <p className="text-center text-[10px] text-muted-foreground/50 mt-2.5">نسخهٔ ۱.۰ — همگام‌سازی خودکار هر ساعت</p>
      </SidebarFooter>
    </Sidebar>
  );
}
