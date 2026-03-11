from typing import List
from app.models.schemas import TopicPerformance


def detect_weak_topics(history: List[TopicPerformance], threshold: float = 0.70) -> tuple[list[str], float]:
    if not history:
        return ([], 0.0)

    weighted_scores: list[tuple[str, float]] = []
    for item in history:
        penalty = 0.15 if item.attempts < 3 else 0.0
        score = (item.accuracy * item.recency_weight) - penalty
        weighted_scores.append((item.topic_id, score))

    weak_topics = [topic for topic, score in weighted_scores if score < threshold]
    confidence = min(1.0, 0.5 + len(history) * 0.03)
    return (weak_topics, confidence)
