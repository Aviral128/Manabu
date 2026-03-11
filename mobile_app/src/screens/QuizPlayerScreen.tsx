import React from "react";
import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Loader } from "../components/Loader";
import { ScreenShell } from "../components/ScreenShell";
import type { RootStackParamList } from "../navigation/types";
import { getQuiz, submitQuizAttempt, type MobileQuizAttempt, type MobileQuizDetails } from "../services/quizzes";
import { theme } from "../theme/tokens";

export function QuizPlayerScreen({ route }: NativeStackScreenProps<RootStackParamList, "QuizPlayer">) {
  const [loading, setLoading] = React.useState(true);
  const [quiz, setQuiz] = React.useState<MobileQuizDetails | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<MobileQuizAttempt | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getQuiz(route.params.slug);
        if (alive) setQuiz(data);
      } catch (nextError) {
        if (alive) setError((nextError as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [route.params.slug]);

  if (loading) {
    return <Loader label="Preparing quiz..." />;
  }

  if (!quiz) {
    return (
      <ScreenShell>
        <Card>
          <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>{error ?? "Quiz unavailable."}</Text>
        </Card>
      </ScreenShell>
    );
  }

  const current = quiz.questions[index];

  async function finishQuiz() {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);
    try {
      const orderedAnswers = quiz.questions.map((_item, answerIndex) => answers[answerIndex] ?? -1);
      const nextResult = await submitQuizAttempt(quiz.id, orderedAnswers);
      setResult(nextResult);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenShell>
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "800" }}>{quiz.title}</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>
          Question {Math.min(index + 1, quiz.questions.length)} of {quiz.questions.length}
        </Text>
      </Card>

      {!result ? (
        <Card>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "800" }}>{current.prompt}</Text>
          <View style={{ gap: 10, marginTop: 16 }}>
            {current.options.map((option, optionIndex) => {
              const selected = answers[index] === optionIndex;
              return (
                <Pressable
                  key={`${current.id}_${optionIndex}`}
                  onPress={() => setAnswers((previous) => ({ ...previous, [index]: optionIndex }))}
                  style={{
                    borderWidth: 1,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: selected ? "rgba(73,183,255,0.18)" : "rgba(255,255,255,0.04)",
                    borderRadius: theme.radius.md,
                    padding: theme.spacing.md,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
            <Button title="Prev" variant="ghost" onPress={() => setIndex((value) => Math.max(0, value - 1))} />
            {index < quiz.questions.length - 1 ? (
              <Button title="Next" variant="ghost" onPress={() => setIndex((value) => Math.min(quiz.questions.length - 1, value + 1))} />
            ) : (
              <Button title={submitting ? "Submitting..." : "Finish"} onPress={() => void finishQuiz()} disabled={submitting} />
            )}
          </View>
          {error ? <Text style={{ color: theme.colors.danger, marginTop: 12 }}>{error}</Text> : null}
        </Card>
      ) : (
        <Card>
          <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "800" }}>Results</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: 8 }}>
            Score {result.score}% • {result.correctAnswers}/{result.totalQuestions} correct • XP {result.xpEarned}
          </Text>
          <View style={{ gap: 10, marginTop: 16 }}>
            {result.review.slice(0, 6).map((item) => (
              <View key={item.questionId} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md }}>
                <Text style={{ color: theme.colors.text, fontWeight: "700" }}>{item.prompt}</Text>
                <Text style={{ color: item.isCorrect ? theme.colors.success : theme.colors.danger, marginTop: 6 }}>
                  {item.isCorrect ? "Correct" : "Incorrect"}
                </Text>
                {item.explanation ? <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>{item.explanation}</Text> : null}
              </View>
            ))}
          </View>
        </Card>
      )}
    </ScreenShell>
  );
}
