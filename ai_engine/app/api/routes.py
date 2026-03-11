from fastapi import APIRouter
from app.models.schemas import (
    KnowledgeGraphRequest,
    LearningPlanRequest,
    QuestionGenerationRequest,
    TutorExplanationRequest,
    WeakTopicRequest,
)
from app.pipelines.knowledge_graph import recommend_path
from app.pipelines.personalization import build_learning_plan
from app.pipelines.question_generator import generate_questions
from app.pipelines.tutor import generate_tutor_explanation
from app.pipelines.weak_topic_detector import detect_weak_topics

router = APIRouter()


@router.post("/weak-topics")
def weak_topics(payload: WeakTopicRequest) -> dict:
    weak_topics_list, confidence = detect_weak_topics(payload.history)
    return {
        "user_id": payload.user_id,
        "weak_topics": weak_topics_list,
        "confidence": confidence,
    }


@router.post("/question-generation")
def question_generation(payload: QuestionGenerationRequest) -> dict:
    return {
        "topic_id": payload.topic_id,
        "difficulty": payload.difficulty,
        "questions": [q.model_dump() for q in generate_questions(payload.topic_id, payload.difficulty, payload.count)],
    }


@router.post("/tutor-explanation")
def tutor_explanation(payload: TutorExplanationRequest) -> dict:
    result = generate_tutor_explanation(payload.topic_id, payload.learner_answer, payload.correct_answer)
    return result.model_dump()


@router.post("/personalized-plan")
def personalized_plan(payload: LearningPlanRequest) -> dict:
    result = build_learning_plan(payload.user_id, payload.weak_topics, payload.available_minutes_per_day)
    return result.model_dump()


@router.post("/knowledge-graph")
def knowledge_graph(payload: KnowledgeGraphRequest) -> dict:
    result = recommend_path(payload.user_id, payload.mastered_topics, payload.target_topic)
    return result.model_dump()
