import React from "react";

export function SiteFooter(): JSX.Element {
  return (
    <footer className="container" style={{ paddingTop: 0 }}>
      <div
        className="glass"
        style={{
          padding: "14px 18px",
          borderRadius: 22,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 700 }}>
          Created with <span aria-hidden="true">&hearts;</span> by Aviral Sultaniya
        </div>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>MANABU admin command deck</div>
      </div>
    </footer>
  );
}
