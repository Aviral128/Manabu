import React from "react";

import { BackendQuizPlayer } from "../../../../components/quiz/BackendQuizPlayer";

type QuizSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function QuizSlugPage({ params }: QuizSlugPageProps): Promise<JSX.Element> {
  const { slug } = await params;
  return <BackendQuizPlayer slug={slug} />;
}
