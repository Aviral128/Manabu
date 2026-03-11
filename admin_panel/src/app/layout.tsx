import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import React from "react";

import { SiteFooter } from "../components/layout/SiteFooter";
import { ClientMonitoringBridge } from "../components/monitoring/ClientMonitoringBridge";
import "./globals.css";
import { Providers } from "./providers";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MANABU Admin",
  description: "Administration console for MANABU - AI Learning Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <ClientMonitoringBridge />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
