import networkx as nx
from app.models.schemas import KnowledgeGraphResponse


def recommend_path(user_id: str, mastered_topics: list[str], target_topic: str) -> KnowledgeGraphResponse:
    graph = nx.DiGraph()
    graph.add_edges_from(
        [
            ("arithmetic", "fractions"),
            ("fractions", "algebra"),
            ("algebra", "linear_equations"),
            ("linear_equations", "quadratic_equations"),
            ("geometry_basics", "coordinate_geometry"),
        ]
    )

    prerequisites = []
    for node in nx.ancestors(graph, target_topic) if target_topic in graph.nodes else []:
        if node not in mastered_topics:
            prerequisites.append(node)

    recommended = [topic for topic in ["adaptive_quiz", "ai_tutor_session", "revision_set"]]

    return KnowledgeGraphResponse(
        user_id=user_id,
        prerequisite_path=sorted(prerequisites),
        recommended_next=recommended,
    )
