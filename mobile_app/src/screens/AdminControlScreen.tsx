import React from "react";
import { Text } from "react-native";

import { Card } from "../components/Card";
import { Loader } from "../components/Loader";
import { ScreenShell } from "../components/ScreenShell";
import { fetchAdminSummary } from "../services/quizzes";
import { theme } from "../theme/tokens";

export function AdminControlScreen() {
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<Awaited<ReturnType<typeof fetchAdminSummary>> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminSummary();
        if (alive) setSummary(data);
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
    return <Loader label="Loading admin summary..." />;
  }

  return (
    <ScreenShell>
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text style={{ color: theme.colors.text, fontSize: 30, fontWeight: "800" }}>Admin control center</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>
          A compact mobile summary of the shared backend admin metrics.
        </Text>
      </Card>
      {error ? (
        <Card>
          <Text style={{ color: theme.colors.danger }}>{error}</Text>
        </Card>
      ) : null}
      {summary ? (
        <Card>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "800" }}>Live metrics</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>Users: {summary.users}</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>Active users: {summary.activeUsers}</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>Suspended users: {summary.suspendedUsers}</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>Quizzes: {summary.quizzes}</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>Attempts: {summary.attempts}</Text>
          <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>Monitoring events: {summary.monitoringEvents}</Text>
        </Card>
      ) : null}
    </ScreenShell>
  );
}
