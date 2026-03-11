from pydantic import BaseModel, Field
from typing import List


class TopicPerformance(BaseModel):
    topic_id: str
    accuracy: float = Field(ge=0.0, le=1.0)
    attempts: int = Field(ge=0)
    recency_weight: float = Field(default=1.0, ge=0.1, le=5.0)


class WeakTopicRequest(BaseModel):
    user_id: str
    history: List[TopicPerformance]


class WeakTopicResponse(BaseModel):
    user_id: str
    weak_topics: List[str]
    confidence: float = Field(ge=0.0, le=1.0)


class QuestionGenerationRequest(BaseModel):
    topic_id: str
    difficulty: str
    count: int = Field(default=5, ge=1, le=30)


class QuestionItem(BaseModel):
    question_id: str
    stem: str
    options: List[str]
    answer_index: int
    explanation: str


class TutorExplanationRequest(BaseModel):
    question_id: str
    learner_answer: str
    correct_answer: str
    topic_id: str


class TutorExplanationResponse(BaseModel):
    summary: str
    step_by_step: List[str]
    remediation_tasks: List[str]


class LearningPlanRequest(BaseModel):
    user_id: str
    weak_topics: List[str]
    available_minutes_per_day: int = Field(ge=5, le=480)


class LearningPlanResponse(BaseModel):
    user_id: str
    daily_plan: List[dict]


class KnowledgeGraphRequest(BaseModel):
    user_id: str
    mastered_topics: List[str]
    target_topic: str


class KnowledgeGraphResponse(BaseModel):
    user_id: str
    prerequisite_path: List[str]
    recommended_next: List[str]
