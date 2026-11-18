import pytest


@pytest.mark.parametrize("topic, renderer", [
    ("Binary Search Tree", "bst"),
    ("Binary Search", "binary_search"),  # regression: must not route to BST
    ("TCP Handshake", "tcp_handshake"),
    ("SQL INNER JOIN", "sql_join"),
    ("Neural Network Forward Propagation", "neural_network"),
    ("Quantum Teleportation Circuit", "concept_diagram"),  # unknown topic fallback
])
def test_topic_routes_to_expected_renderer(client, topic, renderer):
    r = client.post("/api/learning-studio/generate", json={"topic": topic, "difficulty": "intermediate"})
    assert r.status_code == 200
    spec = r.json()["spec"]
    assert spec["renderer_type"] == renderer
    assert len(spec["steps"]) >= 2
    assert "practice_exercise" in spec


def test_suggested_topics_differ_by_career(client):
    ai = client.get("/api/learning-studio/suggested-topics", params={"career": "AI/ML Engineer"}).json()["topics"]
    be = client.get("/api/learning-studio/suggested-topics", params={"career": "Backend Developer"}).json()["topics"]
    assert any("Neural" in t for t in ai)
    assert any("SQL" in t or "TCP" in t for t in be)
    assert ai != be


def _save_bst(client):
    spec = client.post("/api/learning-studio/generate", json={"topic": "Binary Search Tree"}).json()["spec"]
    r = client.post("/api/learning-studio/save", json={
        "topic": spec["topic"], "renderer_type": spec["renderer_type"],
        "difficulty": "intermediate", "spec": spec, "notes": "Key tree algorithms study",
    })
    assert r.status_code == 200
    return r.json()["saved"]["id"]


def test_save_list_and_delete_simulation(client):
    sim_id = _save_bst(client)
    saved = client.get("/api/learning-studio/saved").json()["saved_simulations"]
    assert any(s["id"] == sim_id for s in saved)

    assert client.delete(f"/api/learning-studio/saved/{sim_id}").status_code == 200
    saved = client.get("/api/learning-studio/saved").json()["saved_simulations"]
    assert not any(s["id"] == sim_id for s in saved)


def test_saved_simulations_are_private(client, client2):
    sim_id = _save_bst(client)
    theirs = client2.get("/api/learning-studio/saved").json()["saved_simulations"]
    assert not any(s["id"] == sim_id for s in theirs)
    assert client2.delete(f"/api/learning-studio/saved/{sim_id}").status_code == 404


def test_delete_missing_simulation_returns_404(client):
    assert client.delete("/api/learning-studio/saved/999999").status_code == 404


def test_activity_is_logged_and_counted(client):
    r = client.post("/api/learning-studio/activity", json={
        "topic": "Binary Search Tree", "activity_type": "quiz_completed",
        "difficulty": "intermediate", "score": 100, "details": {"passed": True},
    })
    assert r.status_code == 200
    history = client.get("/api/learning-studio/history").json()["history"]
    assert any(h["topic"] == "Binary Search Tree" and h["activity_type"] == "quiz_completed" for h in history)

    stats = client.get("/api/study/stats").json()["stats"]
    assert stats["activities_today"] >= 1
    assert {"current_streak", "daily_goal"} <= stats.keys()


def test_complete_roadmap_task_from_studio(analyzed):
    r = analyzed.post("/api/learning-studio/complete-task", json={
        "task_title": "Semantic HTML5", "topic": "HTML",
    })
    assert r.status_code == 200
    assert r.json()["updated"] is True
    phase = analyzed.get("/api/roadmap").json()["roadmap"][0]
    assert phase["tasks"][0]["done"] is True


def test_complete_task_with_no_match_changes_nothing(analyzed):
    r = analyzed.post("/api/learning-studio/complete-task", json={"task_title": "Underwater Basket Weaving"})
    assert r.status_code == 200
    assert r.json()["updated"] is False
