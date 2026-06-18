"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, Sparkles, Settings, LogIn, Phone, Zap } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/store/session";

const NAV_ITEMS = [
  { title: "داشبورد", href: "/overview", icon: LayoutGrid },
  { title: "آگهی‌های من", href: "/posts", icon: FileText },
  { title: "دستیار هوش مصنوعی", href: "/ai", icon: Sparkles },
  { title: "تنظیمات", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { phone, expiresAt, openLoginModal } = useSession();

  const isExpiringSoon = expiresAt
    ? expiresAt.getTime() < Date.now() + 30 * 60 * 1000
    : false;

  return (
    <Sidebar side="right" className="border-l border-sidebar-border bg-sidebar">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-sm flex-shrink-0">
            <Zap className="w-5 h-5 text-white" strokeWidth={2} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-bold text-[15px] leading-tight">داشبورد دیوار</h1>
            <p className="text-muted-foreground text-[11px]">مدیریت هوشمند آگهی</p>
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

      <SidebarFooter className="p-3">
        {phone ? (
          <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-card p-3 card-elevated">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {phone.slice(-4)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-xs font-semibold truncate ltr flex items-center gap-1" dir="ltr">
                <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                {phone}
              </p>
              {isExpiringSoon ? (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0 mt-1 cursor-pointer"
                  onClick={openLoginModal}
                >
                  توکن در حال انقضاء
                </Badge>
              ) : (
                <p className="text-success text-[10px] mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
                  متصل به دیوار
                </p>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={openLoginModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold shadow-sm"
          >
            <LogIn className="w-4 h-4" strokeWidth={2} />
            ورود به دیوار
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
