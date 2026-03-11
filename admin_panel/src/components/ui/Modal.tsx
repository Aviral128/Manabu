"use client";

import React from "react";

import { Button } from "./Button";

export function Modal({
  open,
  title,
  children,
  onClose,
  width = 560,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
}): JSX.Element {
  const ref = React.useRef<HTMLDialogElement | null>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      style={{
        width: `min(${width}px, calc(100vw - 32px))`,
        border: "1px solid var(--border)",
        borderRadius: 22,
        padding: 0,
        background: "var(--panelSolid)",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          padding: 14,
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>{title}</div>
        <Button variant="ghost" onClick={() => onClose()}>
          Close
        </Button>
      </div>

      <div style={{ padding: 14 }}>{children}</div>
    </dialog>
  );
}

