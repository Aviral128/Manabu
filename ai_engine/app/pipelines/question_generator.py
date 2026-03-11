from app.models.schemas import QuestionItem


def generate_questions(topic_id: str, difficulty: str, count: int) -> list[QuestionItem]:
    questions: list[QuestionItem] = []
    for idx in range(count):
        questions.append(
            QuestionItem(
                question_id=f"{topic_id}_{difficulty}_{idx}",
                stem=f"[{difficulty.upper()}] {topic_id} practice question #{idx + 1}",
                options=["Option A", "Option B", "Option C", "Option D"],
                answer_index=1,
                explanation="This is a deterministic placeholder. Replace with an LLM generation pipeline.",
            )
        )
    return questions
