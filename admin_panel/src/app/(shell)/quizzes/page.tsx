"use client";

import React from "react";

import { SectionHeader } from "../../../components/common/SectionHeader";
import { DataTable } from "../../../components/tables/DataTable";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Select } from "../../../components/ui/Select";
import { Spinner } from "../../../components/ui/Spinner";
import { createAdminQuiz, deleteAdminQuiz, listAdminQuizzes, updateAdminQuiz, type AdminQuiz, type AdminQuizQuestion, type QuizPayload } from "../../../services/quiz";

type DifficultyValue = QuizPayload["difficulty"];

const DIFFICULTY_OPTIONS: Array<{ value: DifficultyValue; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" },
];

function blankQuestion(index: number): AdminQuizQuestion {
  return {
    prompt: `New question ${index + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answerIndex: 0,
    explanation: "",
    difficulty: "medium",
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeDraft(quiz?: AdminQuiz): QuizPayload & { id?: string } {
  if (!quiz) {
    return {
      title: "",
      slug: "",
      description: "",
      category: "",
      difficulty: "mixed",
      estimatedMinutes: 20,
      isSpecial: false,
      tags: [],
      questions: [blankQuestion(0), blankQuestion(1), blankQuestion(2)],
    };
  }

  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    description: quiz.description ?? "",
    category: quiz.category ?? "",
    difficulty: quiz.difficulty,
    estimatedMinutes: quiz.estimatedMinutes,
    isSpecial: quiz.isSpecial,
    tags: quiz.tags,
    questions: quiz.questions.map((question) => ({
      prompt: question.prompt,
      options: [...question.options],
      answerIndex: question.answerIndex,
      explanation: question.explanation ?? "",
      difficulty: question.difficulty,
    })),
  };
}

export default function QuizzesPage(): JSX.Element {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<AdminQuiz[]>([]);
  const [editing, setEditing] = React.useState<QuizPayload & { id?: string } | null>(null);

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setRows(await listAdminQuizzes());
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function saveDraft() {
    if (!editing) return;

    const payload: QuizPayload = {
      title: editing.title.trim(),
      slug: editing.slug.trim(),
      description: editing.description?.trim(),
      category: editing.category?.trim(),
      difficulty: editing.difficulty,
      estimatedMinutes: editing.estimatedMinutes,
      isSpecial: editing.isSpecial,
      tags: editing.tags,
      questions: editing.questions.map((question) => ({
        prompt: question.prompt.trim(),
        options: question.options.map((option) => option.trim()),
        answerIndex: question.answerIndex,
        explanation: question.explanation?.trim(),
        difficulty: question.difficulty,
      })),
    };

    if (!payload.title || !payload.slug || payload.questions.some((question) => !question.prompt || question.options.some((option) => !option))) {
      setError("Please complete the quiz title, slug, and every visible question option before saving.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const quiz = editing.id ? await updateAdminQuiz(editing.id, payload) : await createAdminQuiz(payload);
      setRows((previous) => {
        if (editing.id) {
          return previous.map((item) => (item.id === editing.id ? quiz : item));
        }
        return [quiz, ...previous];
      });
      setEditing(null);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeQuiz(quiz: AdminQuiz) {
    setBusy(true);
    setError(null);
    try {
      await deleteAdminQuiz(quiz.id);
      setRows((previous) => previous.filter((item) => item.id !== quiz.id));
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <SectionHeader
        title="Quizzes"
        subtitle="Create, edit, and delete persistent quizzes stored in the shared backend."
        right={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button variant="ghost" onClick={() => void load()} disabled={busy}>
              {busy ? <Spinner size={16} /> : null} Refresh
            </Button>
            <Button onClick={() => setEditing(makeDraft())}>Create quiz</Button>
          </div>
        }
      />

      <Card>
        {error ? (
          <div style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.10)" }}>
            <div style={{ fontWeight: 900 }}>Quiz manager issue</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>{error}</div>
          </div>
        ) : null}

        <DataTable<AdminQuiz>
          rows={rows}
          searchKeys={["title", "slug", "category", "difficulty"]}
          pageSize={10}
          columns={[
            { key: "title", header: "Title", render: (quiz) => <span style={{ fontWeight: 900 }}>{quiz.title}</span> },
            { key: "slug", header: "Slug", render: (quiz) => <span style={{ color: "var(--muted)" }}>{quiz.slug}</span> },
            { key: "category", header: "Category", render: (quiz) => <span>{quiz.category ?? "General"}</span> },
            {
              key: "difficulty",
              header: "Difficulty",
              render: (quiz) => <Badge tone={quiz.difficulty === "hard" ? "warning" : quiz.difficulty === "easy" ? "success" : "info"}>{quiz.difficulty}</Badge>,
            },
            { key: "questionCount", header: "Questions" },
            {
              key: "mix",
              header: "Mix",
              render: (quiz) => (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge tone="success">E {quiz.difficultyCounts.easy}</Badge>
                  <Badge tone="info">M {quiz.difficultyCounts.medium}</Badge>
                  <Badge tone="warning">H {quiz.difficultyCounts.hard}</Badge>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (quiz) => (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button variant="ghost" onClick={() => setEditing(makeDraft(quiz))}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => void removeQuiz(quiz)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal open={Boolean(editing)} title={editing?.id ? `Edit ${editing.title}` : "Create quiz"} onClose={() => setEditing(null)} width={980}>
        {editing ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 10 }}>
              <div style={{ gridColumn: "span 12" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Title</span>
                  <Input
                    value={editing.title}
                    onChange={(event) =>
                      setEditing((current) =>
                        current
                          ? {
                              ...current,
                              title: event.target.value,
                              slug: current.id ? current.slug : slugify(event.target.value),
                            }
                          : current
                      )
                    }
                  />
                </label>
              </div>
              <div style={{ gridColumn: "span 6" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Slug</span>
                  <Input value={editing.slug} onChange={(event) => setEditing((current) => (current ? { ...current, slug: slugify(event.target.value) } : current))} />
                </label>
              </div>
              <div style={{ gridColumn: "span 6" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Category</span>
                  <Input value={editing.category} onChange={(event) => setEditing((current) => (current ? { ...current, category: event.target.value } : current))} />
                </label>
              </div>
              <div style={{ gridColumn: "span 6" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Difficulty</span>
                  <Select value={editing.difficulty} onChange={(event) => setEditing((current) => (current ? { ...current, difficulty: event.target.value as DifficultyValue } : current))}>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
              <div style={{ gridColumn: "span 3" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Minutes</span>
                  <Input
                    value={String(editing.estimatedMinutes ?? 20)}
                    onChange={(event) =>
                      setEditing((current) => (current ? { ...current, estimatedMinutes: Math.max(5, Number(event.target.value || 20)) } : current))
                    }
                    inputMode="numeric"
                  />
                </label>
              </div>
              <div style={{ gridColumn: "span 3", display: "flex", alignItems: "flex-end" }}>
                <label style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--muted)" }}>
                  <input type="checkbox" checked={Boolean(editing.isSpecial)} onChange={(event) => setEditing((current) => (current ? { ...current, isSpecial: event.target.checked } : current))} />
                  Special quiz
                </label>
              </div>
              <div style={{ gridColumn: "span 12" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Description</span>
                  <Input value={editing.description} onChange={(event) => setEditing((current) => (current ? { ...current, description: event.target.value } : current))} />
                </label>
              </div>
              <div style={{ gridColumn: "span 12" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Tags (comma separated)</span>
                  <Input
                    value={(editing.tags ?? []).join(", ")}
                    onChange={(event) =>
                      setEditing((current) =>
                        current ? { ...current, tags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } : current
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Question builder</div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
                  Human-readable editor for prompt, four options, the correct answer, and explanation.
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Badge tone="info">{editing.questions.length} questions in this quiz</Badge>
                <Button variant="ghost" onClick={() => setEditing((current) => (current ? { ...current, questions: [...current.questions, blankQuestion(current.questions.length)] } : current))}>
                  Add question
                </Button>
              </div>
            </div>

            {editing.questions.length > 24 ? (
              <Card style={{ borderRadius: 18, background: "rgba(255,255,255,0.04)" }}>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  Large quiz detected. The editor shows the first 24 questions to keep the browser responsive. Hidden questions stay preserved unless you replace them.
                </div>
              </Card>
            ) : null}

            <div style={{ display: "grid", gap: 12, maxHeight: "52vh", overflow: "auto", paddingRight: 4 }}>
              {editing.questions.slice(0, 24).map((question, index) => (
                <Card key={`${editing.slug}_${index}`} style={{ borderRadius: 18, background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900 }}>Question {index + 1}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Select
                        value={question.difficulty}
                        onChange={(event) =>
                          setEditing((current) =>
                            current
                              ? {
                                  ...current,
                                  questions: current.questions.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, difficulty: event.target.value as AdminQuizQuestion["difficulty"] } : item
                                  ),
                                }
                              : current
                          )
                        }
                      >
                        <option value="easy">easy</option>
                        <option value="medium">medium</option>
                        <option value="hard">hard</option>
                      </Select>
                      <Button
                        variant="danger"
                        onClick={() =>
                          setEditing((current) =>
                            current && current.questions.length > 1
                              ? { ...current, questions: current.questions.filter((_item, itemIndex) => itemIndex !== index) }
                              : current
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    <Input
                      value={question.prompt}
                      onChange={(event) =>
                        setEditing((current) =>
                          current
                            ? {
                                ...current,
                                questions: current.questions.map((item, itemIndex) => (itemIndex === index ? { ...item, prompt: event.target.value } : item)),
                              }
                            : current
                        )
                      }
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                      {question.options.map((option, optionIndex) => (
                        <Input
                          key={`${editing.slug}_${index}_${optionIndex}`}
                          value={option}
                          onChange={(event) =>
                            setEditing((current) =>
                              current
                                ? {
                                    ...current,
                                    questions: current.questions.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...item,
                                            options: item.options.map((value, valueIndex) => (valueIndex === optionIndex ? event.target.value : value)),
                                          }
                                        : item
                                    ),
                                  }
                                : current
                            )
                          }
                        />
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 10 }}>
                      <div style={{ gridColumn: "span 4" }}>
                        <label style={{ display: "grid", gap: 6 }}>
                          <span style={{ color: "var(--muted)", fontSize: 12 }}>Correct option</span>
                          <Select
                            value={String(question.answerIndex)}
                            onChange={(event) =>
                              setEditing((current) =>
                                current
                                  ? {
                                      ...current,
                                      questions: current.questions.map((item, itemIndex) =>
                                        itemIndex === index ? { ...item, answerIndex: Number(event.target.value) } : item
                                      ),
                                    }
                                  : current
                              )
                            }
                          >
                            <option value="0">Option A</option>
                            <option value="1">Option B</option>
                            <option value="2">Option C</option>
                            <option value="3">Option D</option>
                          </Select>
                        </label>
                      </div>
                      <div style={{ gridColumn: "span 8" }}>
                        <label style={{ display: "grid", gap: 6 }}>
                          <span style={{ color: "var(--muted)", fontSize: 12 }}>Explanation</span>
                          <Input
                            value={question.explanation}
                            onChange={(event) =>
                              setEditing((current) =>
                                current
                                  ? {
                                      ...current,
                                      questions: current.questions.map((item, itemIndex) =>
                                        itemIndex === index ? { ...item, explanation: event.target.value } : item
                                      ),
                                    }
                                  : current
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={() => void saveDraft()} disabled={busy}>
                {busy ? <Spinner size={16} /> : null} Save quiz
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
