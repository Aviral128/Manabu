export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return `${Math.round(value * 100)}%`;
}

export function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "-";
  return `${Math.round(ms)}ms`;
}

