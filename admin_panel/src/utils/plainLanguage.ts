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
    if (value.length === 0) return "None";
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

  if ("scheduled" in record && "audience" in record) {
    return {
      headline: "The daily challenge campaign has been scheduled successfully.",
      bullets: [`The notification will target ${formatPlainValue(record.audience)}.`],
      facts: [
        { label: "Scheduled", value: formatPlainValue(record.scheduled) },
        { label: "Audience", value: formatPlainValue(record.audience) },
      ],
    };
  }

  if ("enqueued" in record && "channel" in record) {
    return {
      headline: "Reminder notifications have been queued for delivery.",
      bullets: [`${formatPlainValue(record.enqueued)} reminders are ready to go through ${formatPlainValue(record.channel)}.`],
      facts: [
        { label: "Queued reminders", value: formatPlainValue(record.enqueued) },
        { label: "Delivery channel", value: formatPlainValue(record.channel) },
      ],
    };
  }

  if ("delivered" in record && "provider" in record) {
    return {
      headline: "The achievement notification flow completed successfully.",
      bullets: [`Delivery provider: ${formatPlainValue(record.provider)}.`],
      facts: [
        { label: "Delivered", value: formatPlainValue(record.delivered) },
        { label: "Provider", value: formatPlainValue(record.provider) },
      ],
    };
  }

  if ("battleId" in record && "state" in record) {
    return {
      headline: "A new multiplayer battle has been created.",
      bullets: [
        `Battle ${formatPlainValue(record.battleId)} is currently ${formatPlainValue(record.state)}.`,
        `Mode: ${formatPlainValue(record.mode)}.`,
      ],
      facts: [
        { label: "Battle ID", value: formatPlainValue(record.battleId) },
        { label: "Mode", value: formatPlainValue(record.mode) },
        { label: "State", value: formatPlainValue(record.state) },
      ],
    };
  }

  if ("user_id" in record && Array.isArray(record.weak_topics)) {
    const weakTopics = record.weak_topics as unknown[];
    return {
      headline: `The AI detected ${weakTopics.length} weak topic${weakTopics.length === 1 ? "" : "s"} for ${formatPlainValue(record.user_id)}.`,
      bullets: [
        weakTopics.length ? `Current focus area: ${formatPlainValue(weakTopics)}.` : "No weak topics were returned.",
        `Confidence score: ${formatPlainValue(record.confidence)}.`,
      ],
      facts: [
        { label: "Learner", value: formatPlainValue(record.user_id) },
        { label: "Weak topics", value: formatPlainValue(record.weak_topics) },
        { label: "Confidence", value: formatPlainValue(record.confidence) },
      ],
    };
  }

  if ("quizSessionId" in record || "sessionId" in record) {
    const sessionId = record.quizSessionId ?? record.sessionId;
    return {
      headline: "Quiz session created successfully.",
      bullets: [
        `Session ID: ${formatPlainValue(sessionId)}.`,
        `The quiz is ready for the next learner flow.`,
      ],
      facts: [
        { label: "Session", value: formatPlainValue(sessionId) },
        { label: "Topic", value: formatPlainValue(record.topic) },
        { label: "Question count", value: formatPlainValue(record.questionCount) },
      ],
    };
  }

  if ("userId" in record && Array.isArray(record.friends)) {
    const friends = record.friends as unknown[];
    return {
      headline: `${formatPlainValue(record.userId)} currently has ${friends.length} tracked friend connection${friends.length === 1 ? "" : "s"}.`,
      bullets: friends.slice(0, 3).map((friend) => formatPlainValue(friend)),
      facts: [
        { label: "User", value: formatPlainValue(record.userId) },
        { label: "Friend count", value: String(friends.length) },
      ],
    };
  }

  if ("period" in record && Array.isArray(record.entries)) {
    const entries = record.entries as unknown[];
    const leader = asRecord(entries[0]);
    return {
      headline: `${formatPlainValue(record.period)} leaderboard loaded successfully.`,
      bullets: leader ? [`Top learner: ${formatPlainValue(leader.userId)} with ${formatPlainValue(leader.xp)} XP.`] : ["No leaderboard entries were returned."],
      facts: [
        { label: "Period", value: formatPlainValue(record.period) },
        { label: "Entries", value: String(entries.length) },
      ],
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

export function explainAiPayload(tool: string, value: unknown): PlainLanguageView {
  const record = asRecord(value);
  if (!record) {
    return {
      headline: "The request body could not be read as a valid object yet.",
      bullets: ["Fix the JSON format to unlock a clearer explanation."],
      facts: [],
    };
  }

  if (tool === "weak_topics") {
    const history = Array.isArray(record.history) ? record.history : [];
    const first = asRecord(history[0]);
    return {
      headline: `This request asks the AI to inspect ${formatPlainValue(record.user_id)} and identify weak areas from recent practice.`,
      bullets: [
        `Practice records included: ${history.length}.`,
        first
          ? `Example entry: ${formatPlainValue(first.topic_id)} at ${Math.round(Number(first.accuracy ?? 0) * 100)}% accuracy after ${formatPlainValue(first.attempts)} attempt(s).`
          : "No history items are in the payload yet.",
      ],
      facts: [
        { label: "Learner", value: formatPlainValue(record.user_id) },
        { label: "History items", value: String(history.length) },
      ],
    };
  }

  if (tool === "question_generation") {
    return {
      headline: `This request tells the AI to generate ${formatPlainValue(record.count)} question(s) for ${formatPlainValue(record.topic_id)}.`,
      bullets: [`Requested difficulty: ${formatPlainValue(record.difficulty)}.`],
      facts: [
        { label: "Topic", value: formatPlainValue(record.topic_id) },
        { label: "Difficulty", value: formatPlainValue(record.difficulty) },
        { label: "Count", value: formatPlainValue(record.count) },
      ],
    };
  }

  if (tool === "tutor_explanation") {
    return {
      headline: "This request asks the AI tutor to explain a question and compare the learner answer with the correct answer.",
      bullets: [
        `Question: ${formatPlainValue(record.question_id)}.`,
        `Learner answered ${formatPlainValue(record.learner_answer)} while the correct answer is ${formatPlainValue(record.correct_answer)}.`,
      ],
      facts: [
        { label: "Question", value: formatPlainValue(record.question_id) },
        { label: "Topic", value: formatPlainValue(record.topic_id) },
      ],
    };
  }

  if (tool === "personalized_plan") {
    return {
      headline: `This request asks the AI to build a daily study plan for ${formatPlainValue(record.user_id)}.`,
      bullets: [
        `Weak topics submitted: ${formatPlainValue(record.weak_topics)}.`,
        `Available study time: ${formatPlainValue(record.available_minutes_per_day)} minutes per day.`,
      ],
      facts: [
        { label: "Learner", value: formatPlainValue(record.user_id) },
        { label: "Minutes per day", value: formatPlainValue(record.available_minutes_per_day) },
      ],
    };
  }

  if (tool === "knowledge_graph") {
    return {
      headline: "This request asks the AI to map what the learner already knows and what should come next.",
      bullets: [
        `Mastered topics: ${formatPlainValue(record.mastered_topics)}.`,
        `Target topic: ${formatPlainValue(record.target_topic)}.`,
      ],
      facts: [
        { label: "Learner", value: formatPlainValue(record.user_id) },
        { label: "Target topic", value: formatPlainValue(record.target_topic) },
      ],
    };
  }

  return describeApiResult(value);
}
