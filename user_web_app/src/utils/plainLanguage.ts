export type PlainLanguageView = {
  headline: string;
  bullets: string[];
  facts: Array<{ label: string; value: string }>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPlainValue(value: unknown): string {
  if (value === null || value === undefined) return "Not available";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "Not available";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (!value.length) return "None";
    return value.map((item) => formatPlainValue(item)).join(", ");
  }

  const record = asRecord(value);
  if (!record) return String(value);

  const entries = Object.entries(record).slice(0, 4);
  if (!entries.length) return "No details";
  return entries.map(([key, item]) => `${humanizeKey(key)}: ${formatPlainValue(item)}`).join(" | ");
}

export function describeApiResult(value: unknown): PlainLanguageView {
  const record = asRecord(value);
  if (!record) {
    return {
      headline: "The service returned a simple response.",
      bullets: [formatPlainValue(value)],
      facts: [],
    };
  }

  if ("nodes" in record || "edges" in record) {
    const nodes = Array.isArray(record.nodes) ? record.nodes : [];
    const edges = Array.isArray(record.edges) ? record.edges : [];
    return {
      headline: "The learning map loaded successfully.",
      bullets: [
        `${nodes.length} concept node${nodes.length === 1 ? "" : "s"} are available for this learner.`,
        `${edges.length} relationship link${edges.length === 1 ? "" : "s"} connect the current graph.`,
      ],
      facts: [
        { label: "Concept nodes", value: String(nodes.length) },
        { label: "Relationships", value: String(edges.length) },
      ],
    };
  }

  if ("rewards" in record) {
    const rewards = Array.isArray(record.rewards) ? record.rewards : [];
    return {
      headline: "Reward inventory loaded successfully.",
      bullets: rewards.length
        ? rewards.slice(0, 3).map((reward) => formatPlainValue(reward))
        : ["No reward items are available for this account yet."],
      facts: [{ label: "Reward count", value: String(rewards.length) }],
    };
  }

  if ("type" in record || "topic" in record) {
    return {
      headline: `${formatPlainValue(record.type ?? "Activity")} update received.`,
      bullets: [
        `Topic: ${formatPlainValue(record.topic)}.`,
        `Accuracy: ${formatPlainValue(record.accuracy)}.`,
        `Attempts: ${formatPlainValue(record.attempts)}.`,
      ],
      facts: Object.entries(record)
        .slice(0, 4)
        .map(([key, item]) => ({ label: humanizeKey(key), value: formatPlainValue(item) })),
    };
  }

  const facts = Object.entries(record)
    .slice(0, 6)
    .map(([key, item]) => ({ label: humanizeKey(key), value: formatPlainValue(item) }));

  return {
    headline: "The service responded successfully.",
    bullets: facts.map((fact) => `${fact.label}: ${fact.value}`),
    facts,
  };
}
