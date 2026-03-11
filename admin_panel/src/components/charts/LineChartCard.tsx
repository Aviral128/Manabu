"use client";

import React from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "../ui/Card";

type Point = { label: string; value: number };

export function LineChartCard({
  title,
  subtitle,
  data,
  color = "var(--primary2)",
}: {
  title: string;
  subtitle?: string;
  data: Point[];
  color?: string;
}): JSX.Element {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>{title}</div>
          {subtitle ? <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{subtitle}</div> : null}
        </div>
      </div>

      <div style={{ height: 220, marginTop: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(127, 140, 160, 0.18)" strokeDasharray="4 10" />
            <XAxis dataKey="label" stroke="rgba(127, 140, 160, 0.65)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(127, 140, 160, 0.65)" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 14,
                border: "1px solid var(--border)",
                background: "var(--panelSolid)",
                color: "var(--text)",
              }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

