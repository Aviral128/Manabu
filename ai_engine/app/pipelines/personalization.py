from app.models.schemas import LearningPlanResponse


def build_learning_plan(user_id: str, weak_topics: list[str], available_minutes_per_day: int) -> LearningPlanResponse:
    if not weak_topics:
        weak_topics = ["enrichment_topic"]

    minutes_per_topic = max(10, available_minutes_per_day // max(1, len(weak_topics)))

    schedule = []
    for topic in weak_topics:
        schedule.append(
            {
                "topic": topic,
                "activities": [
                    {"type": "micro_lesson", "minutes": min(20, minutes_per_topic)},
                    {"type": "adaptive_quiz", "minutes": min(20, minutes_per_topic)},
                    {"type": "flashcards", "minutes": min(10, minutes_per_topic)},
                ],
            }
        )

    return LearningPlanResponse(user_id=user_id, daily_plan=schedule)
