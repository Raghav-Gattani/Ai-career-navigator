import requests
import sys
import uuid

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=== STARTING AI CAREER NAVIGATOR AUTOMATED TEST SUITE ===")
    
    # 1. Health check
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health_data = r.json()
    assert health_data["status"] == "healthy"
    assert len(health_data["supported_careers"]) == 7
    print("✓ Health check passed. Supported careers:", health_data["supported_careers"])

    # 2. Registration
    uid = uuid.uuid4().hex[:8]
    email1 = f"candidate1_{uid}@test.com"
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Sarah Miller",
        "email": email1,
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    assert r.status_code == 200, f"Registration failed: {r.text}"
    user1_data = r.json()
    assert user1_data["user"]["name"] == "Sarah Miller"
    print("✓ User 1 registration passed.")

    # 3. Duplicate registration check
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Duplicate Sarah",
        "email": email1,
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    assert r.status_code == 400, f"Duplicate registration should fail: {r.status_code}"
    print("✓ Duplicate registration correctly rejected with 400.")

    # 4. Wrong password login
    r = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email1,
        "password": "WrongPassword!"
    })
    assert r.status_code == 401, f"Invalid login should fail with 401: {r.status_code}"
    print("✓ Invalid login correctly rejected with 401.")

    # 5. Successful login session for User 1
    session1 = requests.Session()
    r = session1.post(f"{BASE_URL}/auth/login", json={
        "email": email1,
        "password": "Password123!"
    })
    assert r.status_code == 200, f"Login failed: {r.text}"
    assert "session_id" in session1.cookies, "HttpOnly session cookie missing!"
    print("✓ User 1 login passed with HttpOnly session cookie.")

    # 6. Verify User 1 initial clean state (0% readiness, no fake high scores)
    r = session1.get(f"{BASE_URL}/profile")
    assert r.status_code == 200, f"Profile fetch failed: {r.text}"
    profile_data = r.json()
    assert profile_data["profile"]["readiness_score"] == 0, f"New user must start with 0% readiness! Got: {profile_data['profile']['readiness_score']}"
    assert profile_data["analysis"] is None, "New user must start with no fake completed analysis!"
    assert len(profile_data["roadmap"]) == 0, "New user must start with clean roadmap until target selected!"
    print("✓ User 1 clean initial state verified: 0% readiness, no fake scores.")

    # 7. Register User 2 and verify isolation
    email2 = f"candidate2_{uid}@test.com"
    session2 = requests.Session()
    r = session2.post(f"{BASE_URL}/auth/register", json={
        "name": "David Kim",
        "email": email2,
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    assert r.status_code == 200
    print("✓ User 2 registration passed.")

    # 8. User 1 performs career analysis for Frontend Developer with 2 self-reported skills
    r = session1.post(f"{BASE_URL}/analyze-career", json={
        "target_role": "Frontend Developer",
        "target_company": "Stripe",
        "experience_level": "Junior",
        "skills": [
            {"name": "HTML5 / CSS3 / Modern Layouts", "level": "intermediate"},
            {"name": "JavaScript (ES2024+)", "level": "beginner"}
        ],
        "velocity_hrs": 12
    })
    assert r.status_code == 200, f"Analysis failed: {r.text}"
    analysis_res = r.json()["data"]
    # 2 skills matched out of 9, readiness should be realistic (~15-30%), NOT 80-100%!
    readiness = analysis_res["readiness_score"]
    assert 10 <= readiness <= 40, f"Readiness for 2 beginner/intermediate skills should be 10-40%! Got: {readiness}"
    assert analysis_res["matched_count"] == 2
    assert analysis_res["total_target_count"] == 9
    assert analysis_res["roadmap_phases"][0]["progress_percent"] == 0
    assert all(not t["done"] for t in analysis_res["roadmap_phases"][0]["tasks"])
    print(f"✓ Career Analysis for Frontend Developer passed. Realistic readiness: {readiness}%, matched: 2/9, all tasks undone.")

    # 9. Verify User 2's profile is still clean and unaffected by User 1's analysis
    r = session2.get(f"{BASE_URL}/profile")
    u2_profile = r.json()
    assert u2_profile["profile"]["candidate_name"] == "David Kim"
    assert u2_profile["profile"]["readiness_score"] == 0
    assert u2_profile["analysis"] is None
    print("✓ Multi-tenant isolation verified: User 2 unaffected by User 1 data.")

    # 10. Toggle task completion for User 1
    r = session1.post(f"{BASE_URL}/roadmap/task/toggle", json={
        "phase_number": 1,
        "task_index": 0
    })
    assert r.status_code == 200
    tasks = r.json()["tasks"]
    assert tasks[0]["done"] is True
    print("✓ Task toggle passed: Phase 1 Task 0 marked done.")

    # Check that roadmap phase progress updated in profile
    r = session1.get(f"{BASE_URL}/profile")
    phases = r.json()["roadmap"]
    assert phases[0]["tasks"][0]["done"] is True
    assert phases[0]["progress_percent"] == 33
    print("✓ Progress persistence verified: 33% phase progress saved.")

    # 11. Switch target career to AI/ML Engineer
    r = session1.post(f"{BASE_URL}/profile/update", json={
        "target_role": "AI/ML Engineer",
        "skills": [
            {"name": "Python & Scientific Computing", "level": "advanced"},
            {"name": "PyTorch / Deep Learning Frameworks", "level": "advanced"},
            {"name": "Vector Databases & HNSW Indexing", "level": "intermediate"}
        ]
    })
    assert r.status_code == 200
    u1_updated = session1.get(f"{BASE_URL}/profile").json()
    assert u1_updated["profile"]["target_role"] == "AI/ML Engineer"
    assert u1_updated["analysis"]["total_target_count"] == 8 # AI/ML has 8 targets
    assert u1_updated["analysis"]["matched_count"] == 3
    print(f"✓ Career Switch to AI/ML Engineer verified. New targets: 8, matched: 3, role: {u1_updated['profile']['target_role']}")

    # 12. Evaluate Mock Interview
    r = session1.post(f"{BASE_URL}/evaluate-interview", json={
        "scenario_title": "Low-Latency Vector Retrieval Engine",
        "candidate_answer": "I would partition vectors using consistent hashing with tenant tags, build an HNSW index with M=16, and use Redis as an in-memory cache layer to maintain P99 latency below 10ms."
    })
    assert r.status_code == 200
    eval_res = r.json()["evaluation"]
    assert eval_res["overall_score"] > 0
    assert len(eval_res["strengths"]) > 0
    print(f"✓ Mock Interview evaluated: Score {eval_res['overall_score']}/100, Critique: {eval_res['critique_summary']}")

    # ==================== LEARNING STUDIO TESTS ====================

    # 13. Test BST Simulation Spec Generation
    r = session1.post(f"{BASE_URL}/learning-studio/generate", json={
        "topic": "Binary Search Tree",
        "difficulty": "intermediate"
    })
    assert r.status_code == 200, f"BST generation failed: {r.text}"
    bst_spec = r.json()["spec"]
    assert bst_spec["renderer_type"] == "bst"
    assert "initial_nodes" in bst_spec.get("initial_data", {}) or "initial_values" in bst_spec.get("parameters", {})
    assert len(bst_spec["steps"]) >= 3
    assert "practice_exercise" in bst_spec
    print(f"✓ Test 1: BST simulation spec validated. Renderer: {bst_spec['renderer_type']}, Steps: {len(bst_spec['steps'])}")

    # 13B. REGRESSION TEST: Test Array Binary Search vs BST Disambiguation
    r_bsearch = session1.post(f"{BASE_URL}/learning-studio/generate", json={
        "topic": "Binary Search",
        "difficulty": "beginner"
    })
    assert r_bsearch.status_code == 200, f"Binary Search generation failed: {r_bsearch.text}"
    bsearch_spec = r_bsearch.json()["spec"]
    assert bsearch_spec["renderer_type"] == "binary_search", f"Binary search must route to binary_search renderer! Got: {bsearch_spec['renderer_type']}"
    assert "sorted_array" in bsearch_spec.get("initial_data", {})
    # Verify practice exercise options format
    assert len(bsearch_spec["practice_exercise"]["options"]) == 4
    for opt in bsearch_spec["practice_exercise"]["options"]:
        assert isinstance(opt, (str, dict)), "Options must be safe strings or dicts"
    print("✓ Test 1B: Regression verified — Binary Search routes to array binary_search (not BST), with sorted_array & safe options.")

    # 14. Test TCP Handshake Spec Generation
    r = session1.post(f"{BASE_URL}/learning-studio/generate", json={
        "topic": "TCP Handshake",
        "difficulty": "intermediate"
    })
    assert r.status_code == 200, f"TCP generation failed: {r.text}"
    tcp_spec = r.json()["spec"]
    assert tcp_spec["renderer_type"] == "tcp_handshake"
    assert len(tcp_spec["steps"]) >= 3
    print(f"✓ Test 2: TCP Handshake simulation spec validated. Steps: {len(tcp_spec['steps'])}")

    # 15. Test SQL JOIN Spec Generation
    r = session1.post(f"{BASE_URL}/learning-studio/generate", json={
        "topic": "SQL INNER JOIN",
        "difficulty": "intermediate"
    })
    assert r.status_code == 200, f"SQL JOIN generation failed: {r.text}"
    sql_spec = r.json()["spec"]
    assert sql_spec["renderer_type"] == "sql_join"
    assert len(sql_spec["steps"]) >= 2
    print(f"✓ Test 3: SQL JOIN simulation spec validated. Renderer: {sql_spec['renderer_type']}")

    # 16. Test Neural Network Forward Propagation Spec Generation
    r = session1.post(f"{BASE_URL}/learning-studio/generate", json={
        "topic": "Neural Network Forward Propagation",
        "difficulty": "advanced"
    })
    assert r.status_code == 200, f"Neural Network generation failed: {r.text}"
    nn_spec = r.json()["spec"]
    assert nn_spec["renderer_type"] == "neural_network"
    assert len(nn_spec["steps"]) >= 2
    print(f"✓ Test 4: Neural Network simulation spec validated. Renderer: {nn_spec['renderer_type']}")

    # 17. Test Career-Specific Suggested Topics
    r_ai = session1.get(f"{BASE_URL}/learning-studio/suggested-topics?career=AI/ML Engineer")
    assert r_ai.status_code == 200
    ai_topics = r_ai.json()["topics"]
    assert any("Neural" in t or "Vector" in t for t in ai_topics)

    r_be = session1.get(f"{BASE_URL}/learning-studio/suggested-topics?career=Backend Developer")
    assert r_be.status_code == 200
    be_topics = r_be.json()["topics"]
    assert any("SQL" in t or "TCP" in t for t in be_topics)
    print("✓ Test 5: Dynamic suggested topics for AI/ML vs Backend confirmed distinct.")

    # 18. Test Save Simulation to User Library
    r = session1.post(f"{BASE_URL}/learning-studio/save", json={
        "topic": bst_spec["topic"],
        "renderer_type": bst_spec["renderer_type"],
        "difficulty": "intermediate",
        "spec": bst_spec,
        "notes": "Key tree algorithms study"
    })
    assert r.status_code == 200, f"Save simulation failed: {r.text}"
    saved_sim_id = r.json()["saved"]["id"]

    # Verify retrieved from saved endpoint
    r = session1.get(f"{BASE_URL}/learning-studio/saved")
    assert r.status_code == 200
    saved_list = r.json()["saved_simulations"]
    assert any(s["id"] == saved_sim_id for s in saved_list)
    print(f"✓ Test 6: Simulation saved to library (ID={saved_sim_id}) and retrieved.")

    # 19. Test Multi-Tenant Isolation for Saved Simulations
    r2_saved = session2.get(f"{BASE_URL}/learning-studio/saved")
    assert r2_saved.status_code == 200
    user2_sims = r2_saved.json()["saved_simulations"]
    assert not any(s["id"] == saved_sim_id for s in user2_sims), "User 2 must NOT see User 1's saved simulation!"
    print("✓ Test 7: Multi-tenant library isolation verified. User 2 has 0 access to User 1's saved items.")

    # 20. Test Record Practice Activity & History
    r = session1.post(f"{BASE_URL}/learning-studio/activity", json={
        "topic": "Binary Search Tree",
        "activity_type": "quiz_completed",
        "difficulty": "intermediate",
        "score": 100,
        "details": {"passed": True}
    })
    assert r.status_code == 200
    r_hist = session1.get(f"{BASE_URL}/learning-studio/history")
    assert r_hist.status_code == 200
    history = r_hist.json()["history"]
    assert any(h["topic"] == "Binary Search Tree" and h["activity_type"] == "quiz_completed" for h in history)
    print("✓ Test 8: Practice activity successfully logged and retrieved in learning history.")

    # 21. Test Complete Linked Roadmap Task from Learning Studio
    r_comp = session1.post(f"{BASE_URL}/learning-studio/complete-task", json={
        "task_title": "PyTorch",
        "topic": "Deep Learning"
    })
    assert r_comp.status_code == 200
    print(f"✓ Test 9: Task completion from Learning Studio response: {r_comp.json()}")

    # 22. Test Fallback for arbitrary/custom topic
    r = session1.post(f"{BASE_URL}/learning-studio/generate", json={
        "topic": "Quantum Teleportation Circuit",
        "difficulty": "advanced"
    })
    assert r.status_code == 200
    custom_spec = r.json()["spec"]
    assert custom_spec["topic"] != ""
    assert custom_spec["renderer_type"] == "concept_diagram", f"Unknown topic must receive concept_diagram renderer! Got: {custom_spec['renderer_type']}"
    assert len(custom_spec["steps"]) >= 2
    assert "practice_exercise" in custom_spec
    print("✓ Test 10: Custom arbitrary topic handled cleanly with safe structured concept_diagram specification.")

    # 23. Test Delete Saved Simulation
    r_del = session1.delete(f"{BASE_URL}/learning-studio/saved/{saved_sim_id}")
    assert r_del.status_code == 200
    r_after = session1.get(f"{BASE_URL}/learning-studio/saved")
    assert not any(s["id"] == saved_sim_id for s in r_after.json()["saved_simulations"])
    print("✓ Test 11: Saved simulation deleted cleanly from library.")

    # 24. Test Logout
    r = session1.post(f"{BASE_URL}/auth/logout")
    assert r.status_code == 200
    r = session1.get(f"{BASE_URL}/profile")
    assert r.status_code == 401, f"Access after logout should be 401! Got: {r.status_code}"
    print("✓ Logout verified: session revoked and subsequent calls return 401.")

    print("\nALL 24 COMPREHENSIVE TESTS PASSED SUCCESSFULLY! 🚀")

if __name__ == "__main__":
    run_tests()
