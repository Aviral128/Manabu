import React from "react";

import { ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function NotFound(): JSX.Element {
  return (
    <main className="container">
      <Card style={{ borderRadius: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, margin: 0 }}>Page not found</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>This page does not exist.</p>
        <ButtonLink href="/" variant="ghost">
          Go home
        </ButtonLink>
      </Card>
    </main>
  );
}
