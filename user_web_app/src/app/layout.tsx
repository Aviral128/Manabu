import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import React from "react";

import { SiteFooter } from "../components/layout/SiteFooter";
import { ClientMonitoringBridge } from "../components/monitoring/ClientMonitoringBridge";
import "./globals.css";
import { Providers } from "./providers";

const headingFont = Outfit({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "MANABU",
  description: "MANABU - AI Learning Platform",
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
