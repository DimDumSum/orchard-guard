import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "OrchardGuard",
  description: "Apple orchard disease & pest risk management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="h-full">
        <ThemeProvider>
          {/* Desktop top nav */}
          <Sidebar />

          {/* Mobile header */}
          <MobileHeader />

          {/* Page content */}
          <main className="relative z-[1] pt-14 pb-16 lg:pb-0">
            <div className="mx-auto max-w-[920px] px-7 py-8">
              {children}
            </div>
          </main>

          {/* Mobile bottom tab bar */}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
