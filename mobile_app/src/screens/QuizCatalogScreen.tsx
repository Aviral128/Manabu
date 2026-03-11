import React from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Loader } from "../components/Loader";
import { ScreenShell } from "../components/ScreenShell";
import type { RootStackParamList } from "../navigation/types";
import { listQuizzes, type MobileQuizSummary } from "../services/quizzes";
import { theme } from "../theme/tokens";

export function QuizCatalogScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "QuizCatalog">) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quizzes, setQuizzes] = React.useState<MobileQuizSummary[]>([]);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listQuizzes();
        if (alive) setQuizzes(data);
      } catch (nextError) {
        if (alive) setError((nextError as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <Loader label="Loading quiz catalog..." />;
  }

  return (
    <ScreenShell>
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text style={{ color: theme.colors.text, fontSize: 30, fontWeight: "800" }}>Quiz catalog</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>
          Every quiz here is loaded from the shared MANABU backend and graded server-side.
        </Text>
      </Card>

      {error ? (
        <Card>
          <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>{error}</Text>
        </Card>
      ) : null}

      <View style={{ gap: 12 }}>
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "800" }}>{quiz.title}</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 8 }}>{quiz.description}</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>
              {quiz.questionCount} questions • {quiz.estimatedMinutes} min • {quiz.category ?? "General"}
            </Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <Button title="Start quiz" onPress={() => navigation.navigate("QuizPlayer", { slug: quiz.slug, title: quiz.title })} />
            </View>
          </Card>
        ))}
      </View>
    </ScreenShell>
  );
}
