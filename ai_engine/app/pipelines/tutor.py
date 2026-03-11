from app.models.schemas import TutorExplanationResponse


def generate_tutor_explanation(topic_id: str, learner_answer: str, correct_answer: str) -> TutorExplanationResponse:
    is_correct = learner_answer.strip().lower() == correct_answer.strip().lower()

    if is_correct:
        summary = f"Great work. Your answer for {topic_id} is correct."
        steps = [
            "You identified the right concept.",
            "You applied the method accurately.",
            "Keep practicing mixed-difficulty problems.",
        ]
        remediation = ["Attempt one hard challenge question."]
    else:
        summary = f"Your answer is not correct yet for {topic_id}, but the approach can be fixed."
        steps = [
            "Review the key definition and formula for this topic.",
            "Compare your steps with the canonical method.",
            "Re-solve the problem and verify each intermediate step.",
        ]
        remediation = [
            "Complete a 5-question remediation quiz.",
            "Study two flashcards focused on common mistakes.",
        ]

    return TutorExplanationResponse(summary=summary, step_by_step=steps, remediation_tasks=remediation)
