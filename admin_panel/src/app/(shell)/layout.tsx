import React from "react";

import { AdminShell } from "../../components/layout/AdminShell";

export default function ShellLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <AdminShell>{children}</AdminShell>;
}

