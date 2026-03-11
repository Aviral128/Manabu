"""Local fallback AI server for environments without external Python dependencies.

This server mirrors key MANABU AI endpoints so local integration can run even when
FastAPI/scikit-learn packages cannot be installed.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

HOST = "0.0.0.0"
PORT = 7100


def _json_response(handler: BaseHTTPRequestHandler, status: int, payload: dict[str, Any]) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _weak_topics(payload: dict[str, Any]) -> dict[str, Any]:
    history = payload.get("history", [])
    weak = []
    for item in history:
        accuracy = float(item.get("accuracy", 0.0))
        attempts = int(item.get("attempts", 0))
        score = accuracy - (0.15 if attempts < 3 else 0.0)
        if score < 0.7:
            weak.append(item.get("topic_id", "unknown"))
    confidence = min(1.0, 0.5 + len(history) * 0.03)
    return {
        "user_id": payload.get("user_id", "unknown"),
        "weak_topics": weak,
        "confidence": confidence,
    }


def _question_generation(payload: dict[str, Any]) -> dict[str, Any]:
    topic_id = str(payload.get("topic_id", "general_topic"))
    difficulty = str(payload.get("difficulty", "medium"))
    count = int(payload.get("count", 5))
    questions = []
    for idx in range(max(1, min(count, 30))):
        questions.append(
            {
                "question_id": f"{topic_id}_{difficulty}_{idx}",
                "stem": f"[{difficulty.upper()}] {topic_id} practice question #{idx + 1}",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer_index": 1,
                "explanation": "Local fallback explanation. Replace with model-backed output.",
            }
        )
    return {
        "topic_id": topic_id,
        "difficulty": difficulty,
        "questions": questions,
    }


def _tutor_explanation(payload: dict[str, Any]) -> dict[str, Any]:
    learner_answer = str(payload.get("learner_answer", "")).strip().lower()
    correct_answer = str(payload.get("correct_answer", "")).strip().lower()
    topic_id = str(payload.get("topic_id", "topic"))

    if learner_answer == correct_answer:
        return {
            "summary": f"Great work. Your answer for {topic_id} is correct.",
            "step_by_step": [
                "You selected the right concept.",
                "You executed the method correctly.",
                "Try a harder variation to consolidate mastery.",
            ],
            "remediation_tasks": ["Attempt one hard challenge question."],
        }

    return {
        "summary": f"Your answer is not correct yet for {topic_id}, but it can be corrected.",
        "step_by_step": [
            "Review the relevant formula and concept.",
            "Compare your approach with a canonical solution.",
            "Re-solve and verify each intermediate step.",
        ],
        "remediation_tasks": [
            "Complete a 5-question remediation quiz.",
            "Review two flashcards about common mistakes.",
        ],
    }


def _personalized_plan(payload: dict[str, Any]) -> dict[str, Any]:
    weak_topics = payload.get("weak_topics", []) or ["enrichment_topic"]
    minutes = int(payload.get("available_minutes_per_day", 30))
    per_topic = max(10, minutes // max(1, len(weak_topics)))

    daily_plan = []
    for topic in weak_topics:
        daily_plan.append(
            {
                "topic": topic,
                "activities": [
                    {"type": "micro_lesson", "minutes": min(20, per_topic)},
                    {"type": "adaptive_quiz", "minutes": min(20, per_topic)},
                    {"type": "flashcards", "minutes": min(10, per_topic)},
                ],
            }
        )

    return {"user_id": payload.get("user_id", "unknown"), "daily_plan": daily_plan}


def _knowledge_graph(payload: dict[str, Any]) -> dict[str, Any]:
    target = str(payload.get("target_topic", "linear_equations"))
    mastered = set(payload.get("mastered_topics", []))
    dependencies = {
        "linear_equations": ["algebra", "fractions"],
        "quadratic_equations": ["linear_equations"],
        "coordinate_geometry": ["geometry_basics"],
    }
    prereq = [topic for topic in dependencies.get(target, []) if topic not in mastered]
    return {
        "user_id": payload.get("user_id", "unknown"),
        "prerequisite_path": prereq,
        "recommended_next": ["adaptive_quiz", "ai_tutor_session", "revision_set"],
    }


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            _json_response(self, 200, {"status": "ok", "service": "ai-engine-fallback", "timestamp": _now_iso()})
            return

        _json_response(self, 404, {"error": "not_found"})

    def do_POST(self) -> None:  # noqa: N802
        raw_length = self.headers.get("Content-Length", "0")
        length = int(raw_length)
        raw_body = self.rfile.read(length) if length > 0 else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            _json_response(self, 400, {"error": "invalid_json"})
            return

        route_handlers = {
            "/v1/ai/weak-topics": _weak_topics,
            "/v1/ai/question-generation": _question_generation,
            "/v1/ai/tutor-explanation": _tutor_explanation,
            "/v1/ai/personalized-plan": _personalized_plan,
            "/v1/ai/knowledge-graph": _knowledge_graph,
        }

        handler = route_handlers.get(self.path)
        if handler is None:
            _json_response(self, 404, {"error": "not_found"})
            return

        try:
            result = handler(payload)
            _json_response(self, 200, result)
        except Exception as exc:  # pragma: no cover
            _json_response(self, 500, {"error": "internal_error", "message": str(exc)})


if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), Handler)
    print(f"MANABU local AI fallback server running on http://{HOST}:{PORT}")
    server.serve_forever()
