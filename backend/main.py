import os
import json
import re
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Any

from database import (
    init_db,
    get_connection,
    create_user,
    authenticate_user,
    create_session,
    get_session_user,
    delete_session,
    save_simulation,
    get_saved_simulations,
    delete_saved_simulation,
    record_learning_activity,
    get_learning_history
)
import gemini_service

app = FastAPI(title="AI Career Navigator API", version="2.0.0")

# Proper CORS for HttpOnly cookies across local ports
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# ==================== Dependencies ====================

def get_current_user(request: Request) -> dict:
    session_token = request.cookies.get("session_id")
    if not session_token:
        # Also check Authorization header as fallback: Bearer <token>
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ", 1)[1].strip()

    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in."
        )

    user = get_session_user(session_token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please sign in again."
        )
    return user

# ==================== Request Models ====================

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def validate_email(email: str) -> str:
    cleaned = email.strip().lower()
    if not EMAIL_REGEX.match(cleaned):
        raise HTTPException(status_code=400, detail="Invalid email address format.")
    return cleaned

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=60)
    email: str
    password: str = Field(..., min_length=6)
    confirm_password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SkillProficiency(BaseModel):
    name: str
    level: str = "intermediate" # "beginner" | "intermediate" | "advanced" | "expert"

class CareerAnalysisRequest(BaseModel):
    target_role: str = Field(..., example="Frontend Developer")
    target_company: Optional[str] = Field(default="Stripe")
    domain: Optional[str] = Field(default="general")
    experience_level: Optional[str] = Field(default="Junior")
    skills: List[Any] = Field(default=[]) # list of strings or {"name": "...", "level": "..."}
    github_repo: Optional[str] = Field(default="")
    education: Optional[str] = Field(default="")
    interests: Optional[str] = Field(default="")
    velocity_hrs: int = Field(default=10, ge=1, le=60)

class ProfileUpdateRequest(BaseModel):
    candidate_name: Optional[str] = None
    target_role: Optional[str] = None
    target_company: Optional[str] = None
    experience_level: Optional[str] = None
    velocity_hrs: Optional[int] = None
    github_repo: Optional[str] = None
    education: Optional[str] = None
    interests: Optional[str] = None
    skills: Optional[List[Any]] = None

class InterviewEvaluationRequest(BaseModel):
    scenario_title: Optional[str] = None
    candidate_answer: str = Field(..., min_length=5)

class ToggleTaskRequest(BaseModel):
    phase_number: int
    task_index: int

class SimulationGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    difficulty: Optional[str] = "intermediate"
    career_context: Optional[str] = None

class SimulationSaveRequest(BaseModel):
    topic: str
    normalized_topic: Optional[str] = None
    concept_category: Optional[str] = None
    renderer_type: str
    difficulty: Optional[str] = "intermediate"
    spec: dict
    notes: Optional[str] = ""

class LearningActivityRequest(BaseModel):
    topic: str
    activity_type: str
    difficulty: Optional[str] = "intermediate"
    score: Optional[int] = 0
    details: Optional[dict] = None
    roadmap_task_title: Optional[str] = ""
    simulation_id: Optional[int] = None

class CompleteRoadmapTaskRequest(BaseModel):
    task_title: str
    phase_number: Optional[int] = None
    topic: Optional[str] = None

# ==================== Auth Endpoints ====================

@app.post("/api/auth/register")
def register(req: RegisterRequest, response: Response):
    valid_email = validate_email(req.email)
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    try:
        user = create_user(email=valid_email, name=req.name, password=req.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    token = create_session(user["id"])
    response.set_cookie(
        key="session_id",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False, # local development
        max_age=7 * 24 * 3600,
        path="/"
    )
    return {"success": True, "user": user, "token": token}

@app.post("/api/auth/login")
def login(req: LoginRequest, response: Response):
    valid_email = validate_email(req.email)
    user = authenticate_user(email=valid_email, password=req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_session(user["id"])
    response.set_cookie(
        key="session_id",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=7 * 24 * 3600,
        path="/"
    )
    return {"success": True, "user": user, "token": token}

@app.post("/api/auth/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get("session_id")
    if token:
        delete_session(token)
    response.delete_cookie("session_id", path="/")
    return {"success": True, "message": "Signed out successfully"}

@app.get("/api/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}

# ==================== Health & Meta Endpoints ====================

@app.get("/api/health")
def health_check():
    has_key = bool(gemini_service.get_api_key())
    return {
        "status": "healthy",
        "service": "AI Career Navigator Backend",
        "gemini_configured": has_key,
        "database": "SQLite initialized",
        "supported_careers": list(gemini_service.CAREER_REQUIREMENT_MAP.keys())
    }

# ==================== User Career Data Endpoints ====================

@app.get("/api/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM career_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    profile_row = cursor.fetchone()

    # If user doesn't have a profile record yet, create an empty one
    if not profile_row:
        cursor.execute("""
        INSERT INTO career_profiles (
            user_id, candidate_name, track_name, target_role, target_company,
            runway_weeks, experience_level, domain, velocity_hrs, github_repo,
            education, interests, skills_json, readiness_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            user_id, current_user["name"], "General Track", "", "", 8,
            "Junior", "general", 10, "", "", "", "[]", 0
        ))
        conn.commit()
        cursor.execute("SELECT * FROM career_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
        profile_row = cursor.fetchone()

    profile = dict(profile_row)
    try:
        profile["skills"] = json.loads(profile.get("skills_json") or "[]")
    except Exception:
        profile["skills"] = []

    # Get latest analysis for this user
    cursor.execute("SELECT * FROM career_analyses WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    analysis_row = cursor.fetchone()

    # Get roadmap phases for this user
    cursor.execute("SELECT * FROM roadmap_phases WHERE user_id = ? ORDER BY phase_number ASC", (user_id,))
    phase_rows = cursor.fetchall()

    # Get latest interview evaluation for this user
    cursor.execute("SELECT * FROM interview_evaluations WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    interview_row = cursor.fetchone()

    conn.close()

    parsed_phases = []
    for p in phase_rows:
        try:
            tasks = json.loads(p["tasks"])
        except Exception:
            tasks = []
        parsed_phases.append({
            "id": p["id"],
            "phase_number": p["phase_number"],
            "phase_title": p["phase_title"],
            "phase_subtitle": p["phase_subtitle"],
            "status": p["status"],
            "progress_percent": p["progress_percent"],
            "tasks": tasks
        })

    analysis_data = None
    if analysis_row:
        analysis_data = {
            "id": analysis_row["id"],
            "target_role": analysis_row["target_role"],
            "target_company": analysis_row["target_company"],
            "readiness_score": analysis_row["readiness_score"],
            "matched_count": analysis_row["matched_count"],
            "total_target_count": analysis_row["total_target_count"],
            "critical_gaps_count": analysis_row["critical_gaps_count"],
            "alignment_percent": analysis_row["alignment_percent"],
            "codebase_breakdown": json.loads(analysis_row["codebase_breakdown"] or "[]"),
            "critical_gaps": json.loads(analysis_row["critical_gaps"] or "[]"),
            "strong_matches": json.loads(analysis_row["strong_matches"] or "[]"),
            "in_progress_skills": json.loads(analysis_row["in_progress_skills"] or "[]"),
            "pro_insight": analysis_row["pro_insight"],
            "source": analysis_row["source"],
            "created_at": analysis_row["created_at"]
        }

    interview_data = None
    if interview_row:
        interview_data = {
            "id": interview_row["id"],
            "scenario_title": interview_row["scenario_title"],
            "overall_score": interview_row["overall_score"],
            "distributed_score": interview_row["distributed_score"],
            "latency_score": interview_row["latency_score"],
            "tenancy_score": interview_row["tenancy_score"],
            "memory_score": interview_row["memory_score"],
            "strengths": json.loads(interview_row["strengths"] or "[]"),
            "blindspots": json.loads(interview_row["blindspots"] or "[]"),
            "critique_summary": interview_row["critique_summary"],
            "source": interview_row["source"],
            "created_at": interview_row["created_at"]
        }

    recent_activities = get_learning_history(user_id, limit=6)
    saved_sims = get_saved_simulations(user_id)
    saved_count = len(saved_sims)

    return {
        "profile": profile,
        "analysis": analysis_data,
        "roadmap": parsed_phases,
        "interview": interview_data,
        "recent_activities": recent_activities,
        "saved_simulations_count": saved_count
    }

@app.post("/api/analyze-career")
def analyze_career(req: CareerAnalysisRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    # Run dynamic calculation / Gemini analysis
    result = gemini_service.analyze_career_gap(
        target_role=req.target_role,
        target_company=req.target_company or "Target Tech Benchmark",
        domain=req.domain or "general",
        level=req.experience_level or "Junior",
        skills=req.skills,
        github_repo=req.github_repo or "",
        velocity_hrs=req.velocity_hrs
    )

    conn = get_connection()
    cursor = conn.cursor()

    # Update or insert career profile for this user
    cursor.execute("""
    UPDATE career_profiles SET
        target_role = ?,
        target_company = ?,
        domain = ?,
        experience_level = ?,
        velocity_hrs = ?,
        github_repo = ?,
        education = ?,
        interests = ?,
        skills_json = ?,
        readiness_score = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?;
    """, (
        req.target_role,
        req.target_company or "Target Tech Benchmark",
        req.domain or "general",
        req.experience_level or "Junior",
        req.velocity_hrs,
        req.github_repo or "",
        req.education or "",
        req.interests or "",
        json.dumps(req.skills),
        result["readiness_score"],
        user_id
    ))

    # Get profile ID
    cursor.execute("SELECT id FROM career_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    profile_row = cursor.fetchone()
    profile_id = profile_row["id"] if profile_row else None

    # Insert new analysis record
    cursor.execute("""
    INSERT INTO career_analyses (
        user_id, profile_id, target_role, target_company, readiness_score,
        matched_count, total_target_count, critical_gaps_count, alignment_percent,
        codebase_breakdown, critical_gaps, strong_matches, in_progress_skills,
        pro_insight, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id,
        profile_id,
        req.target_role,
        req.target_company or "Target Tech Benchmark",
        result["readiness_score"],
        result["matched_count"],
        result["total_target_count"],
        result["critical_gaps_count"],
        result["alignment_percent"],
        json.dumps(result["codebase_breakdown"]),
        json.dumps(result["critical_gaps"]),
        json.dumps(result["strong_matches"]),
        json.dumps(result["in_progress_skills"]),
        result["pro_insight"],
        result["source"]
    ))
    analysis_id = cursor.lastrowid

    # Replace roadmap phases for this user with fresh uncompleted phases
    cursor.execute("DELETE FROM roadmap_phases WHERE user_id = ?;", (user_id,))
    for phase in result.get("roadmap_phases", []):
        cursor.execute("""
        INSERT INTO roadmap_phases (
            user_id, analysis_id, phase_number, phase_title, phase_subtitle,
            status, progress_percent, tasks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            user_id,
            analysis_id,
            phase["phase_number"],
            phase["phase_title"],
            phase["phase_subtitle"],
            phase["status"],
            phase.get("progress_percent", 0),
            json.dumps(phase.get("tasks", []))
        ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "analysis_id": analysis_id,
        "data": result
    }

@app.post("/api/profile/update")
def update_profile(req: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM career_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    current = cursor.fetchone()
    if not current:
        conn.close()
        raise HTTPException(status_code=404, detail="Profile not found")

    target_role = req.target_role if req.target_role is not None else current["target_role"]
    target_company = req.target_company if req.target_company is not None else current["target_company"]
    level = req.experience_level if req.experience_level is not None else current["experience_level"]
    velocity = req.velocity_hrs if req.velocity_hrs is not None else current["velocity_hrs"]
    repo = req.github_repo if req.github_repo is not None else current["github_repo"]
    education = req.education if req.education is not None else current["education"]
    interests = req.interests if req.interests is not None else current["interests"]
    
    if req.skills is not None:
        skills = req.skills
    else:
        try:
            skills = json.loads(current["skills_json"] or "[]")
        except Exception:
            skills = []

    # Recalculate gaps and readiness dynamically
    result = gemini_service.calculate_career_gap(
        target_role=target_role or "Frontend Developer",
        target_company=target_company or "Target Tech Benchmark",
        domain=current["domain"] or "general",
        level=level or "Junior",
        user_skills=skills,
        github_repo=repo or "",
        velocity_hrs=velocity or 10
    )

    cursor.execute("""
    UPDATE career_profiles SET
        candidate_name = COALESCE(?, candidate_name),
        target_role = ?,
        target_company = ?,
        experience_level = ?,
        velocity_hrs = ?,
        github_repo = ?,
        education = ?,
        interests = ?,
        skills_json = ?,
        readiness_score = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?;
    """, (
        req.candidate_name,
        target_role,
        target_company,
        level,
        velocity,
        repo,
        education,
        interests,
        json.dumps(skills),
        result["readiness_score"],
        user_id
    ))

    # Update or insert analysis
    cursor.execute("SELECT id FROM career_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    profile_id = cursor.fetchone()["id"]

    cursor.execute("""
    INSERT INTO career_analyses (
        user_id, profile_id, target_role, target_company, readiness_score,
        matched_count, total_target_count, critical_gaps_count, alignment_percent,
        codebase_breakdown, critical_gaps, strong_matches, in_progress_skills,
        pro_insight, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id,
        profile_id,
        target_role,
        target_company,
        result["readiness_score"],
        result["matched_count"],
        result["total_target_count"],
        result["critical_gaps_count"],
        result["alignment_percent"],
        json.dumps(result["codebase_breakdown"]),
        json.dumps(result["critical_gaps"]),
        json.dumps(result["strong_matches"]),
        json.dumps(result["in_progress_skills"]),
        result["pro_insight"],
        result["source"]
    ))
    analysis_id = cursor.lastrowid

    # If target role changed, update roadmap phases
    if req.target_role and req.target_role != current["target_role"]:
        cursor.execute("DELETE FROM roadmap_phases WHERE user_id = ?;", (user_id,))
        for phase in result.get("roadmap_phases", []):
            cursor.execute("""
            INSERT INTO roadmap_phases (
                user_id, analysis_id, phase_number, phase_title, phase_subtitle,
                status, progress_percent, tasks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                user_id,
                analysis_id,
                phase["phase_number"],
                phase["phase_title"],
                phase["phase_subtitle"],
                phase["status"],
                phase.get("progress_percent", 0),
                json.dumps(phase.get("tasks", []))
            ))

    conn.commit()
    conn.close()

    return {"success": True, "analysis": result}

@app.get("/api/roadmap")
def get_roadmap(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM roadmap_phases WHERE user_id = ? ORDER BY phase_number ASC", (user_id,))
    phases = cursor.fetchall()
    conn.close()

    result = []
    for p in phases:
        try:
            tasks = json.loads(p["tasks"])
        except Exception:
            tasks = []
        result.append({
            "id": p["id"],
            "phase_number": p["phase_number"],
            "phase_title": p["phase_title"],
            "phase_subtitle": p["phase_subtitle"],
            "status": p["status"],
            "progress_percent": p["progress_percent"],
            "tasks": tasks
        })
    return {"roadmap": result}

@app.post("/api/roadmap/task/toggle")
def toggle_roadmap_task(req: ToggleTaskRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, tasks FROM roadmap_phases
    WHERE user_id = ? AND phase_number = ?
    ORDER BY id DESC LIMIT 1
    """, (user_id, req.phase_number))
    phase = cursor.fetchone()
    if not phase:
        conn.close()
        raise HTTPException(status_code=404, detail="Roadmap phase not found for this user")

    try:
        tasks = json.loads(phase["tasks"])
    except Exception:
        tasks = []

    if 0 <= req.task_index < len(tasks):
        tasks[req.task_index]["done"] = not tasks[req.task_index].get("done", False)

        done_count = sum(1 for t in tasks if t.get("done"))
        new_progress = int((done_count / len(tasks)) * 100) if tasks else 0

        cursor.execute("""
        UPDATE roadmap_phases SET
            tasks = ?,
            progress_percent = ?
        WHERE id = ?;
        """, (json.dumps(tasks), new_progress, phase["id"]))
        conn.commit()

    conn.close()
    return {"success": True, "tasks": tasks}

@app.post("/api/evaluate-interview")
def evaluate_interview(req: InterviewEvaluationRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT target_role FROM career_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    p_row = cursor.fetchone()
    target_role = p_row["target_role"] if p_row else "Frontend Developer"

    scenario = req.scenario_title
    if not scenario:
        config = gemini_service.get_career_config(target_role)
        scenario = config["interview_scenario"]

    result = gemini_service.evaluate_interview_response(
        scenario_title=scenario,
        candidate_answer=req.candidate_answer,
        target_role=target_role
    )

    cursor.execute("""
    INSERT INTO interview_evaluations (
        user_id, scenario_title, candidate_answer, overall_score,
        distributed_score, latency_score, tenancy_score, memory_score,
        strengths, blindspots, critique_summary, source
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id,
        scenario,
        req.candidate_answer,
        result["overall_score"],
        result["distributed_score"],
        result["latency_score"],
        result["tenancy_score"],
        result["memory_score"],
        json.dumps(result["strengths"]),
        json.dumps(result["blindspots"]),
        result["critique_summary"],
        result["source"]
    ))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "evaluation": result
    }

# ==================== Learning Studio Endpoints ====================

@app.post("/api/learning-studio/generate")
def generate_simulation(req: SimulationGenerateRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT target_role FROM career_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    p_row = cursor.fetchone()
    conn.close()

    career = req.career_context or (p_row["target_role"] if p_row and p_row["target_role"] else "Frontend Developer")
    spec = gemini_service.generate_simulation_spec(
        topic=req.topic,
        difficulty=req.difficulty or "intermediate",
        target_career=career
    )
    if "topic" not in spec:
        spec["topic"] = spec.get("normalized_topic", req.topic)
    if "summary" not in spec:
        spec["summary"] = spec.get("concise_explanation") or spec.get("description") or ""

    # Record view/generate activity
    try:
        record_learning_activity(
            user_id=user_id,
            topic=spec.get("topic", req.topic),
            activity_type="generated",
            difficulty=req.difficulty or "intermediate",
            details={"renderer_type": spec.get("renderer_type"), "category": spec.get("concept_category")}
        )
    except Exception as e:
        print(f"Warning: Failed to record activity: {e}")

    return {"success": True, "spec": spec}

@app.post("/api/learning-studio/save")
def save_user_simulation(req: SimulationSaveRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    norm = req.normalized_topic or req.spec.get("normalized_topic") or req.topic.lower().strip()
    category = req.concept_category or req.spec.get("concept_category") or "General"

    saved = save_simulation(
        user_id=user_id,
        topic=req.topic,
        normalized_topic=norm,
        concept_category=category,
        renderer_type=req.renderer_type,
        difficulty=req.difficulty or "intermediate",
        spec_dict=req.spec,
        notes=req.notes or ""
    )
    return {"success": True, "saved": saved}

@app.get("/api/learning-studio/saved")
def get_user_saved_simulations(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    saved = get_saved_simulations(user_id)
    return {"success": True, "saved_simulations": saved}

@app.delete("/api/learning-studio/saved/{simulation_id}")
def delete_user_simulation(simulation_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    success = delete_saved_simulation(user_id, simulation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Saved simulation not found or unauthorized")
    return {"success": True}

@app.post("/api/learning-studio/activity")
def log_learning_activity(req: LearningActivityRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    activity_id = record_learning_activity(
        user_id=user_id,
        topic=req.topic,
        activity_type=req.activity_type,
        difficulty=req.difficulty or "intermediate",
        score=req.score or 0,
        details=req.details or {},
        roadmap_task_title=req.roadmap_task_title or "",
        simulation_id=req.simulation_id
    )
    return {"success": True, "activity_id": activity_id}

@app.get("/api/learning-studio/history")
def get_user_learning_history(limit: int = 20, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    history = get_learning_history(user_id, limit=limit)
    return {"success": True, "history": history}

@app.get("/api/learning-studio/suggested-topics")
def get_career_suggested_topics(career: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_role = career
    if not target_role:
        user_id = current_user["id"]
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT target_role FROM career_profiles WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
        p_row = cursor.fetchone()
        conn.close()
        target_role = p_row["target_role"] if p_row and p_row["target_role"] else "Frontend Developer"

    topics = gemini_service.get_suggested_topics_for_career(target_role)
    return {"success": True, "career": target_role, "topics": topics}

@app.post("/api/learning-studio/complete-task")
def complete_roadmap_task_from_simulation(req: CompleteRoadmapTaskRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, phase_number, tasks FROM roadmap_phases WHERE user_id = ? ORDER BY phase_number ASC", (user_id,))
    phases = cursor.fetchall()

    updated = False
    target_phase_id = None
    target_tasks = []
    clean_target = req.task_title.strip().lower()

    for p in phases:
        if req.phase_number is not None and p["phase_number"] != req.phase_number:
            continue
        try:
            tasks = json.loads(p["tasks"] or "[]")
        except Exception:
            tasks = []

        for t in tasks:
            t_title = t.get("title", "").lower()
            if clean_target in t_title or t_title in clean_target:
                t["done"] = True
                updated = True
                target_phase_id = p["id"]
                target_tasks = tasks
                break
        if updated:
            done_count = sum(1 for t in target_tasks if t.get("done"))
            new_prog = int((done_count / len(target_tasks)) * 100) if target_tasks else 0
            cursor.execute("UPDATE roadmap_phases SET tasks = ?, progress_percent = ? WHERE id = ?", (
                json.dumps(target_tasks), new_prog, target_phase_id
            ))
            conn.commit()
            break

    conn.close()

    if updated:
        record_learning_activity(
            user_id=user_id,
            topic=req.topic or req.task_title,
            activity_type="completed_task",
            roadmap_task_title=req.task_title,
            details={"completed": True}
        )
        return {"success": True, "task_title": req.task_title, "updated": True}
    return {"success": False, "message": "No matching roadmap task found", "updated": False}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
