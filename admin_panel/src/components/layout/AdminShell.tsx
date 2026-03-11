import React from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AdminShell({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="shellRoot">
      <div className="shellAside">
        <Sidebar />
      </div>
      <div className="shellContent">
        <Topbar />
        <div className="shellInner">{children}</div>
      </div>
    </div>
  );
}
