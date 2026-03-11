"use client";

import { ThemeProvider } from "next-themes";
import React from "react";

import { AuthProvider } from "../auth/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

