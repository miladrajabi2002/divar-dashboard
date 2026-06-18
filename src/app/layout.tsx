import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

// Self-hosted Vazirmatn variable font — no external CDN request at runtime.
const vazirmatn = localFont({
  src: "./fonts/Vazirmatn.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "داشبورد دیوار",
  description: "مدیریت هوشمند آگهی‌های دیوار با هوش مصنوعی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={`h-full ${vazirmatn.variable}`}>
      <body className="h-full antialiased font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
