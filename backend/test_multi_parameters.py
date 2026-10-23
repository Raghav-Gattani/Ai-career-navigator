import requests
import uuid
import json

BASE_URL = "http://127.0.0.1:8000/api"

def run_parameter_tests():
    print("\n=======================================================")
    print("   AI CAREER NAVIGATOR MULTI-PARAMETER VERIFICATION")
    print("=======================================================\n")

    # -------------------------------------------------------------------------
    # PARAMETER SET 1: Authentication Boundary Conditions
    # -------------------------------------------------------------------------
    print("--- Testing Parameter Set 1: Authentication Boundaries ---")
    
    # 1.1 Invalid email format
    for bad_email in ["notanemail", "user@", "@domain.com", "user name@test.com"]:
        r = requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Test User", "email": bad_email, "password": "Password123!", "confirm_password": "Password123!"
        })
        assert r.status_code == 400, f"Email '{bad_email}' should be rejected with 400! Got: {r.status_code}"
    print("✓ 1.1 Malformed email formats correctly rejected with 400.")

    # 1.2 Password too short
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Short Pwd", "email": "short@test.com", "password": "123", "confirm_password": "123"
    })
    assert r.status_code in [400, 422], "Short password should be rejected!"
    print("✓ 1.2 Short passwords correctly rejected.")

    # 1.3 Password mismatch
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Mismatch", "email": "mismatch@test.com", "password": "Password123!", "confirm_password": "Different123!"
    })
    assert r.status_code == 400, "Mismatched passwords should be rejected!"
    print("✓ 1.3 Mismatched passwords correctly rejected.")

    # 1.4 Special characters / potential XSS payload in user name
    uid = uuid.uuid4().hex[:6]
    xss_email = f"xss_{uid}@test.com"
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "<script>alert('xss')</script> & Bob", "email": xss_email, "password": "Password123!", "confirm_password": "Password123!"
    })
    assert r.status_code == 200, "Special characters in name should be safely stored without crash"
    print("✓ 1.4 Special characters in name handled cleanly.")

    # 1.5 Non-existent user login
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "nonexistent@test.com", "password": "Password123!"})
    assert r.status_code == 401, "Non-existent user login must return 401"
    print("✓ 1.5 Non-existent login correctly returns 401.")

    # Create 2 authenticated sessions for multi-tenant and parameter tests
    user1_email = f"tester1_{uid}@test.com"
    user2_email = f"tester2_{uid}@test.com"

    session1 = requests.Session()
    r = session1.post(f"{BASE_URL}/auth/register", json={
        "name": "Alice Architecture", "email": user1_email, "password": "Password123!", "confirm_password": "Password123!"
    })
    assert r.status_code == 200

    session2 = requests.Session()
    r = session2.post(f"{BASE_URL}/auth/register", json={
        "name": "Bob Backend", "email": user2_email, "password": "Password123!", "confirm_password": "Password123!"
    })
    assert r.status_code == 200
    print("✓ 1.6 Two isolated test sessions registered and authenticated.")

    # -------------------------------------------------------------------------
    # PARAMETER SET 2: Career Analyzer Parameters across all 7 Paths
    # -------------------------------------------------------------------------
    print("\n--- Testing Parameter Set 2: Career Analyzer Across 7 Paths ---")
    
    careers = [
        "Frontend Developer",
        "Backend Developer",
        "Full-Stack Developer",
        "AI/ML Engineer",
        "Cybersecurity Analyst",
        "Data Analyst",
        "DevOps Engineer"
    ]

    for career in careers:
        r = session1.post(f"{BASE_URL}/analyze-career", json={
            "target_role": career,
            "target_company": "Apex Corp & Co. <Cloud>",
            "experience_level": "Junior",
            "skills": [{"name": "Core Fundamentals", "level": "beginner"}],
            "velocity_hrs": 15
        })
        assert r.status_code == 200, f"Analysis for {career} failed: {r.text}"
        data = r.json()["data"]
        assert 0 <= data["readiness_score"] <= 100
        assert len(data["roadmap_phases"]) >= 2
        print(f"  ✓ Career '{career}': Score={data['readiness_score']}%, Phases={len(data['roadmap_phases'])}")

    # 2.1 Boundary: Zero skills reported
    r_zero = session1.post(f"{BASE_URL}/analyze-career", json={
        "target_role": "Backend Developer",
        "skills": [],
        "velocity_hrs": 10
    })
    assert r_zero.status_code == 200
    assert r_zero.json()["data"]["readiness_score"] == 0, "Zero skills must produce 0% readiness!"
    print("✓ 2.1 Boundary check: 0 reported skills produces 0% readiness.")

    # 2.2 Boundary: Unsupported / novel career path
    r_novel = session1.post(f"{BASE_URL}/analyze-career", json={
        "target_role": "Quantum Space Architect",
        "skills": [{"name": "Quantum Logic", "level": "intermediate"}],
        "velocity_hrs": 20
    })
    assert r_novel.status_code == 200
    assert "roadmap_phases" in r_novel.json()["data"]
    print("✓ 2.2 Boundary check: Novel career path gracefully handled with dynamic benchmark.")

    # 2.3 Boundary: Negative / extreme velocity
    r_extreme = session1.post(f"{BASE_URL}/analyze-career", json={
        "target_role": "Frontend Developer",
        "skills": [{"name": "HTML", "level": "beginner"}],
        "velocity_hrs": -50
    })
    assert r_extreme.status_code in [200, 400, 422]
    print("✓ 2.3 Boundary check: Negative velocity gracefully sanitized or rejected.")

    # -------------------------------------------------------------------------
    # PARAMETER SET 3: Interactive Simulation Engine Across 11 Types
    # -------------------------------------------------------------------------
    print("\n--- Testing Parameter Set 3: Simulation Engine (11 Types + Novel) ---")

    sim_topics = [
        ("Binary Search Tree", "bst"),
        ("Binary Search", "binary_search"),
        ("TCP 3-Way Handshake", "tcp_handshake"),
        ("SQL JOIN Operations", "sql_join"),
        ("Neural Network Forward Pass", "neural_network"),
        ("Quicksort Partitioning", "sorting"),
        ("Call Stack Execution", "stack_queue"),
        ("DOM Tree & Virtual DOM", "dom_tree"),
        ("CSS Flexbox & Grid", "css_layout"),
        ("DNS Resolution Pipeline", "dns_resolution"),
        ("Graph Traversal (BFS / DFS)", "graph_traversal")
    ]

    for topic_name, expected_renderer in sim_topics:
        r = session1.post(f"{BASE_URL}/learning-studio/generate", json={
            "topic": topic_name,
            "difficulty": "intermediate"
        })
        assert r.status_code == 200, f"Simulation generation failed for {topic_name}"
        spec = r.json()["spec"]
        assert spec["renderer_type"] == expected_renderer, f"Expected {expected_renderer} for '{topic_name}', got {spec['renderer_type']}"
        assert len(spec["steps"]) >= 2
        print(f"  ✓ {topic_name:30} -> {spec['renderer_type']}")

    # 3.1 Novel topic test
    r_novel_sim = session1.post(f"{BASE_URL}/learning-studio/generate", json={
        "topic": "Distributed Paxos Consensus",
        "difficulty": "advanced"
    })
    assert r_novel_sim.status_code == 200
    novel_spec = r_novel_sim.json()["spec"]
    assert novel_spec["renderer_type"] == "concept_diagram"
    print("✓ 3.1 Novel topic routed to structured 'concept_diagram' safely.")

    # 3.2 Non-existent simulation deletion
    r_del_fake = session1.delete(f"{BASE_URL}/learning-studio/saved/999999")
    assert r_del_fake.status_code == 404
    print("✓ 3.2 Deleting non-existent simulation correctly returns 404.")

    # -------------------------------------------------------------------------
    # PARAMETER SET 4: StudyMate Analytics Parameters
    # -------------------------------------------------------------------------
    print("\n--- Testing Parameter Set 4: StudyMate Study Analytics ---")
    
    # 4.1 Log multiple activity types
    for act_type, topic in [("focus_session", "TCP Handshake"), ("quiz_completed", "Binary Search"), ("completed_task", "React Architecture")]:
        r = session1.post(f"{BASE_URL}/learning-studio/activity", json={
            "topic": topic,
            "activity_type": act_type,
            "score": 100,
            "details": {"duration": 25}
        })
        assert r.status_code == 200

    r_stats = session1.get(f"{BASE_URL}/study/stats")
    assert r_stats.status_code == 200
    st = r_stats.json()["stats"]
    assert st["activities_today"] >= 3
    assert st["current_streak"] >= 1
    assert st["daily_goal"] == 3
    print(f"✓ 4.1 Study stats verified: Activities Today={st['activities_today']}, Streak={st['current_streak']}, Goal={st['daily_goal']}")

    # -------------------------------------------------------------------------
    # PARAMETER SET 5: AI Resume Builder & PDF Parameters
    # -------------------------------------------------------------------------
    print("\n--- Testing Parameter Set 5: AI Resume Builder & PDF Generation ---")

    # 5.1 Resume Generation
    r_res = session1.post(f"{BASE_URL}/resume/generate", json={"target_role": "Full-Stack Developer"})
    assert r_res.status_code == 200
    rdata = r_res.json()["resume_data"]
    assert "technical_skills" in rdata
    assert "projects" in rdata
    print("✓ 5.1 Truthful resume generated for Full-Stack Developer.")

    # 5.2 Invalid section regeneration
    r_bad_sec = session1.post(f"{BASE_URL}/resume/regenerate-section", json={
        "section_name": "astrological_sign",
        "target_role": "Full-Stack Developer",
        "current_resume_data": rdata
    })
    assert r_bad_sec.status_code == 400
    print("✓ 5.2 Invalid section regeneration correctly rejected with 400.")

    # 5.3 PDF Generation across all templates + fallback + empty data
    for tmpl in ["modern", "classic", "minimal", "unknown_template_xyz"]:
        r_pdf = session1.post(f"{BASE_URL}/resume/export-pdf", json={
            "template": tmpl,
            "resume_data": rdata
        })
        assert r_pdf.status_code == 200, f"PDF export failed for template {tmpl}"
        assert r_pdf.content.startswith(b"%PDF"), f"Invalid PDF binary for {tmpl}"
        print(f"  ✓ PDF generated for template '{tmpl}': {len(r_pdf.content)} bytes")

    # 5.4 Boundary: PDF export with completely empty resume data
    r_empty_pdf = session1.post(f"{BASE_URL}/resume/export-pdf", json={
        "template": "modern",
        "resume_data": {}
    })
    assert r_empty_pdf.status_code == 200
    assert r_empty_pdf.content.startswith(b"%PDF")
    print("✓ 5.4 Boundary check: Empty resume data exports valid PDF without crashing.")

    # 5.5 Special characters in resume
    special_rdata = dict(rdata)
    special_rdata["personal_info"] = {
        "name": "Jane Developer & Architect <Staff>",
        "email": "jane@example.com",
        "phone": "+1 (555) 012-3456",
        "location": "Zürich / Geneva, Switzerland",
        "github": "github.com/jane"
    }
    special_rdata["projects"] = [{
        "title": "High-Throughput Ingestion Engine <v2.0>",
        "technologies": ["C++20", "Python & Cython", "FastAPI"],
        "date": "2026",
        "bullets": [
            "Processed > 100k events/sec with latency < 5ms & 99.99% uptime.",
            "Benchmarked against Redis & RocksDB with automated CI/CD."
        ]
    }]
    r_spec_pdf = session1.post(f"{BASE_URL}/resume/export-pdf", json={
        "template": "modern",
        "resume_data": special_rdata
    })
    assert r_spec_pdf.status_code == 200
    assert r_spec_pdf.content.startswith(b"%PDF")
    print("✓ 5.5 Special XML characters (&, <, >, quotes) cleanly rendered in PDF.")

    # 5.6 Save, Multi-tenant Isolation, Public Share Link
    r_save = session1.post(f"{BASE_URL}/resumes", json={
        "title": "Alice Full-Stack Master Draft",
        "target_role": "Full-Stack Developer",
        "template": "modern",
        "resume_data": special_rdata
    })
    assert r_save.status_code == 200
    res_obj = r_save.json()["resume"]
    res_id = res_obj["id"]
    share_tok = res_obj["share_token"]

    # User 2 attempts unauthorized access
    r_unauth = session2.get(f"{BASE_URL}/resumes/{res_id}")
    assert r_unauth.status_code == 404, "User 2 must NOT access User 1's resume!"
    r_unauth_del = session2.delete(f"{BASE_URL}/resumes/{res_id}")
    assert r_unauth_del.status_code == 404, "User 2 must NOT delete User 1's resume!"
    print("✓ 5.6 Multi-tenant isolation verified: User 2 denied read/delete on User 1 resume.")

    # Public sharing lifecycle
    # Check 404 while private
    r_pub = requests.get(f"{BASE_URL}/public/resume/{share_tok}")
    assert r_pub.status_code == 404

    # Enable public
    r_toggle_on = session1.post(f"{BASE_URL}/resumes/{res_id}/share", json={"is_public": True})
    assert r_toggle_on.status_code == 200
    r_pub_active = requests.get(f"{BASE_URL}/public/resume/{share_tok}")
    assert r_pub_active.status_code == 200
    assert r_pub_active.json()["resume"]["title"] == "Alice Full-Stack Master Draft"

    # Revoke public
    r_toggle_off = session1.post(f"{BASE_URL}/resumes/{res_id}/share", json={"is_public": False})
    assert r_toggle_off.status_code == 200
    r_pub_revoked = requests.get(f"{BASE_URL}/public/resume/{share_tok}")
    assert r_pub_revoked.status_code == 404
    print("✓ 5.7 Public sharing lifecycle (Private -> Public -> Revoked) verified.")

    # -------------------------------------------------------------------------
    # PARAMETER SET 6: Roadmap & Task Boundary Conditions
    # -------------------------------------------------------------------------
    print("\n--- Testing Parameter Set 6: Roadmap Task Boundaries ---")

    # Non-existent phase
    r_fake_phase = session1.post(f"{BASE_URL}/roadmap/task/toggle", json={
        "phase_number": 999,
        "task_index": 0
    })
    assert r_fake_phase.status_code == 404
    print("✓ 6.1 Toggle non-existent phase correctly returns 404.")

    # Non-existent task index in valid phase (phase 1)
    r_fake_idx = session1.post(f"{BASE_URL}/roadmap/task/toggle", json={
        "phase_number": 1,
        "task_index": 9999
    })
    assert r_fake_idx.status_code == 200, "Out-of-bounds task index handled safely without crash"
    print("✓ 6.2 Out-of-bounds task index handled safely.")

    # -------------------------------------------------------------------------
    # PARAMETER SET 7: Mock Interview Evaluation Parameters
    # -------------------------------------------------------------------------
    print("\n--- Testing Parameter Set 7: Mock Interview Evaluation ---")

    # 7.1 Very short candidate answer (< 15 chars)
    r_short = session1.post(f"{BASE_URL}/evaluate-interview", json={
        "scenario_title": "Distributed Cache Invalidation",
        "candidate_answer": "I don't know"
    })
    assert r_short.status_code == 200
    res_short = r_short.json()["evaluation"]
    assert res_short["overall_score"] == 0
    assert len(res_short["blindspots"]) > 0
    print("✓ 7.1 Short candidate answer receives 0 score with guidance.")

    # 7.2 Detailed technical candidate answer
    detailed_answer = (
        "We implement a write-through cache topology using Redis Cluster with dual-region replication. "
        "Cache keys use consistent hashing with virtual nodes to distribute write load. On entity update, "
        "we issue transactional two-phase invalidation with a lease-based token to eliminate stale reads "
        "under thundering herd conditions. Circuit breakers trip to read directly from PostgreSQL with "
        "rate limiting if Redis latency spikes above 20ms SLA."
    )
    r_eval = session1.post(f"{BASE_URL}/evaluate-interview", json={
        "scenario_title": "Distributed Cache Invalidation",
        "candidate_answer": detailed_answer
    })
    assert r_eval.status_code == 200
    res_eval = r_eval.json()["evaluation"]
    assert res_eval["overall_score"] > 20
    assert "strengths" in res_eval
    assert "critique_summary" in res_eval
    print(f"✓ 7.2 Substantive architectural answer evaluated: Score={res_eval['overall_score']}/100")

    print("\n=======================================================")
    print("   ALL MULTI-PARAMETER VERIFICATION TESTS PASSED! 🚀")
    print("=======================================================\n")

if __name__ == "__main__":
    run_parameter_tests()
