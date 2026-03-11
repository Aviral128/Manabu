from app.pipelines.weak_topic_detector import detect_weak_topics
from app.models.schemas import TopicPerformance


def test_detect_weak_topics_with_sparse_attempts() -> None:
    history = [
        TopicPerformance(topic_id="algebra", accuracy=0.9, attempts=6, recency_weight=1.0),
        TopicPerformance(topic_id="geometry", accuracy=0.6, attempts=2, recency_weight=1.0),
    ]

    weak, confidence = detect_weak_topics(history)

    assert "geometry" in weak
    assert confidence >= 0.5
