"use client";

import React from "react";

export type RequestLogEntry = {
  id: string;
  ts: string;
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  ok: boolean;
  error?: string;
  requestBody?: string;
  responseBody?: string;
};

const KEY = "manabu_dev_logs_v1";
const LIMIT = 250;

function isAdminViewer(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((item) => item === "manabu_role=admin");
}

function safeParse(raw: string | null): RequestLogEntry[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as RequestLogEntry[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function appendLog(entry: RequestLogEntry) {
  if (typeof window === "undefined") return;
  if (!isAdminViewer()) return;
  const current = safeParse(localStorage.getItem(KEY));
  const next = [entry, ...current].slice(0, LIMIT);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("manabu_dev_logs_updated"));
}

export function clearLogs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("manabu_dev_logs_updated"));
}

export function loadLogs(): RequestLogEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(KEY));
}

export function useLogs() {
  const [logs, setLogs] = React.useState<RequestLogEntry[]>([]);

  React.useEffect(() => {
    const update = () => setLogs(loadLogs());
    update();
    window.addEventListener("manabu_dev_logs_updated", update);
    return () => window.removeEventListener("manabu_dev_logs_updated", update);
  }, []);

  return { logs, clearLogs };
}
