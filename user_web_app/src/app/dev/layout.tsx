import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

import { isAdmin, isAuthenticated } from "../../auth/server";
import { DevShell } from "../../components/layout/DevShell";

export default async function DevLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    redirect("/login?next=/dev");
  }
  if (!isAdmin(cookieStore)) {
    redirect("/app/dashboard");
  }

  return <DevShell>{children}</DevShell>;
}
