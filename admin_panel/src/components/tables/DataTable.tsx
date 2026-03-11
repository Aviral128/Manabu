"use client";

import React from "react";

import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { Input } from "../ui/Input";

export type Column<T> = {
  key: string;
  header: string;
  width?: number | string;
  render?: (row: T) => React.ReactNode;
};

export function DataTable<T extends { [key: string]: unknown }>({
  rows,
  columns,
  searchKeys,
  pageSize = 10,
  right,
  initialQuery = "",
}: {
  rows: T[];
  columns: Array<Column<T>>;
  searchKeys: string[];
  pageSize?: number;
  right?: React.ReactNode;
  initialQuery?: string;
}): JSX.Element {
  const [query, setQuery] = React.useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 180);
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
    );
  }, [debouncedQuery, rows, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery, pageSize]);

  React.useEffect(() => {
    setPage((current) => Math.min(current, Math.max(1, Math.ceil(filtered.length / pageSize))));
  }, [filtered.length, pageSize]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ width: 320, maxWidth: "55vw" }}>
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search table"
          />
        </div>
        {right ? <div style={{ display: "flex", gap: 10 }}>{right}</div> : null}
      </div>

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: "left",
                    padding: "12px 12px",
                    fontSize: 12,
                    color: "var(--muted)",
                    borderBottom: "1px solid var(--border)",
                    width: col.width,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "12px 12px",
                      borderBottom: "1px solid var(--border)",
                      verticalAlign: "top",
                    }}
                  >
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 18, color: "var(--muted)" }}>
                  No results.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          {filtered.length} items | Page {safePage} of {totalPages}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            style={{
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--text)",
              cursor: safePage <= 1 ? "not-allowed" : "pointer",
              opacity: safePage <= 1 ? 0.6 : 1,
            }}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            style={{
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--text)",
              cursor: safePage >= totalPages ? "not-allowed" : "pointer",
              opacity: safePage >= totalPages ? 0.6 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

