def test_new_user_starts_clean(client):
    data = client.get("/api/profile").json()
    assert data["profile"]["readiness_score"] == 0
    assert data["analysis"] is None
    assert data["roadmap"] == []


def test_career_analysis_is_realistic(analyzed):
    result = analyzed.analysis
    assert 10 <= result["readiness_score"] <= 40
    assert result["matched_count"] == 2
    assert result["total_target_count"] == 9
    first_phase = result["roadmap_phases"][0]
    assert first_phase["progress_percent"] == 0
    assert all(not t["done"] for t in first_phase["tasks"])


def test_users_are_isolated(analyzed, client2):
    other = client2.get("/api/profile").json()
    assert other["profile"]["candidate_name"] == "David Kim"
    assert other["profile"]["readiness_score"] == 0
    assert other["analysis"] is None


def test_roadmap_task_toggle_persists(analyzed):
    r = analyzed.post("/api/roadmap/task/toggle", json={"phase_number": 1, "task_index": 0})
    assert r.status_code == 200
    assert r.json()["tasks"][0]["done"] is True
    phase = analyzed.get("/api/profile").json()["roadmap"][0]
    assert phase["tasks"][0]["done"] is True
    assert phase["progress_percent"] == 33


def test_toggle_unknown_phase_returns_404(analyzed):
    r = analyzed.post("/api/roadmap/task/toggle", json={"phase_number": 99, "task_index": 0})
    assert r.status_code == 404


def test_toggle_out_of_range_task_is_safe(analyzed):
    r = analyzed.post("/api/roadmap/task/toggle", json={"phase_number": 1, "task_index": 99})
    assert r.status_code == 200


def test_switch_target_career(analyzed):
    r = analyzed.post("/api/profile/update", json={
        "target_role": "AI/ML Engineer",
        "skills": [
            {"name": "Python & Scientific Computing", "level": "advanced"},
            {"name": "PyTorch / Deep Learning Frameworks", "level": "advanced"},
            {"name": "Vector Databases & HNSW Indexing", "level": "intermediate"},
        ],
    })
    assert r.status_code == 200
    data = analyzed.get("/api/profile").json()
    assert data["profile"]["target_role"] == "AI/ML Engineer"
    assert data["analysis"]["total_target_count"] == 8
    assert data["analysis"]["matched_count"] == 3


def test_interview_evaluation(client):
    r = client.post("/api/evaluate-interview", json={
        "scenario_title": "Low-Latency Vector Retrieval Engine",
        "candidate_answer": (
            "I would partition vectors using consistent hashing with tenant tags, "
            "build an HNSW index with M=16, and use Redis as an in-memory cache layer "
            "to maintain P99 latency below 10ms."
        ),
    })
    assert r.status_code == 200
    evaluation = r.json()["evaluation"]
    assert evaluation["overall_score"] > 0
    assert evaluation["strengths"]


def test_very_short_interview_answer_scores_zero(client):
    r = client.post("/api/evaluate-interview", json={"candidate_answer": "too short"})
    assert r.status_code in (200, 422)
    if r.status_code == 200:
        assert r.json()["evaluation"]["overall_score"] == 0


def test_analyze_career_validates_input(client):
    r = client.post("/api/analyze-career", json={"target_role": "Frontend Developer", "velocity_hrs": 999})
    assert r.status_code == 422
