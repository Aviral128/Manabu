import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

import { isAuthenticated } from "../../auth/server";
import { AppShell } from "../../components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    redirect("/login?next=/app/dashboard");
  }

  return <AppShell>{children}</AppShell>;
}
