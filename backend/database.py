import sqlite3
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "career_navigator.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        bytes.fromhex(salt),
        100000
    ).hex()
    return hashed, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    hashed, _ = hash_password(password, salt)
    return secrets.compare_digest(hashed, stored_hash)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Active Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Career Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS career_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        candidate_name TEXT NOT NULL DEFAULT 'New Candidate',
        track_name TEXT NOT NULL DEFAULT 'Software Engineering',
        target_role TEXT NOT NULL DEFAULT 'Frontend Developer',
        target_company TEXT NOT NULL DEFAULT 'Tech Leader',
        runway_weeks INTEGER NOT NULL DEFAULT 8,
        experience_level TEXT NOT NULL DEFAULT 'Junior',
        domain TEXT NOT NULL DEFAULT 'general',
        velocity_hrs INTEGER NOT NULL DEFAULT 10,
        github_repo TEXT DEFAULT '',
        education TEXT DEFAULT '',
        interests TEXT DEFAULT '',
        skills_json TEXT DEFAULT '[]',
        readiness_score INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Career Analyses Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS career_analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        profile_id INTEGER,
        target_role TEXT NOT NULL,
        target_company TEXT NOT NULL,
        readiness_score INTEGER NOT NULL DEFAULT 0,
        matched_count INTEGER NOT NULL DEFAULT 0,
        total_target_count INTEGER NOT NULL DEFAULT 0,
        critical_gaps_count INTEGER NOT NULL DEFAULT 0,
        alignment_percent INTEGER NOT NULL DEFAULT 0,
        codebase_breakdown TEXT NOT NULL DEFAULT '[]',
        critical_gaps TEXT NOT NULL DEFAULT '[]',
        strong_matches TEXT NOT NULL DEFAULT '[]',
        in_progress_skills TEXT NOT NULL DEFAULT '[]',
        pro_insight TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT 'deterministic_engine',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(profile_id) REFERENCES career_profiles(id) ON DELETE CASCADE
    );
    """)

    # Roadmap Phases Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roadmap_phases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        analysis_id INTEGER,
        phase_number INTEGER NOT NULL,
        phase_title TEXT NOT NULL,
        phase_subtitle TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        progress_percent INTEGER NOT NULL DEFAULT 0,
        tasks TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(analysis_id) REFERENCES career_analyses(id) ON DELETE CASCADE
    );
    """)

    # Interview Evaluations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        scenario_title TEXT NOT NULL,
        candidate_answer TEXT NOT NULL,
        overall_score INTEGER NOT NULL DEFAULT 0,
        distributed_score INTEGER NOT NULL DEFAULT 0,
        latency_score INTEGER NOT NULL DEFAULT 0,
        tenancy_score INTEGER NOT NULL DEFAULT 0,
        memory_score INTEGER NOT NULL DEFAULT 0,
        strengths TEXT NOT NULL DEFAULT '[]',
        blindspots TEXT NOT NULL DEFAULT '[]',
        critique_summary TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT 'deterministic_engine',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Saved Learning Simulations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        topic TEXT NOT NULL,
        normalized_topic TEXT NOT NULL,
        concept_category TEXT NOT NULL,
        renderer_type TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'intermediate',
        spec_json TEXT NOT NULL,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Learning Activities / History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        simulation_id INTEGER,
        topic TEXT NOT NULL,
        activity_type TEXT NOT NULL, -- 'opened' | 'saved' | 'practice_attempt' | 'practice_completed'
        difficulty TEXT DEFAULT 'intermediate',
        score INTEGER DEFAULT 0,
        details_json TEXT DEFAULT '{}',
        roadmap_task_title TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(simulation_id) REFERENCES saved_simulations(id) ON DELETE SET NULL
    );
    """)

    # AI Resumes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL DEFAULT 'My Professional Resume',
        target_role TEXT NOT NULL DEFAULT 'Frontend Developer',
        template TEXT NOT NULL DEFAULT 'modern',
        resume_data_json TEXT NOT NULL DEFAULT '{}',
        share_token TEXT UNIQUE,
        is_public INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    conn.commit()

    # Perform Safe Migrations to ensure all columns exist
    migrate_columns(cursor)
    conn.commit()
    conn.close()

def migrate_columns(cursor):
    """Safely adds missing columns to existing SQLite tables if needed."""
    def get_columns(table):
        cursor.execute(f"PRAGMA table_info({table})")
        return [row["name"] for row in cursor.fetchall()]

    profile_cols = get_columns("career_profiles")
    if "user_id" not in profile_cols:
        cursor.execute("ALTER TABLE career_profiles ADD COLUMN user_id INTEGER;")
    if "skills_json" not in profile_cols:
        cursor.execute("ALTER TABLE career_profiles ADD COLUMN skills_json TEXT DEFAULT '[]';")
    if "education" not in profile_cols:
        cursor.execute("ALTER TABLE career_profiles ADD COLUMN education TEXT DEFAULT '';")
    if "interests" not in profile_cols:
        cursor.execute("ALTER TABLE career_profiles ADD COLUMN interests TEXT DEFAULT '';")

    analysis_cols = get_columns("career_analyses")
    if "user_id" not in analysis_cols:
        cursor.execute("ALTER TABLE career_analyses ADD COLUMN user_id INTEGER;")

    roadmap_cols = get_columns("roadmap_phases")
    if "user_id" not in roadmap_cols:
        cursor.execute("ALTER TABLE roadmap_phases ADD COLUMN user_id INTEGER;")

    interview_cols = get_columns("interview_evaluations")
    if "user_id" not in interview_cols:
        cursor.execute("ALTER TABLE interview_evaluations ADD COLUMN user_id INTEGER;")

# ==================== User & Session Management ====================

def create_user(email: str, name: str, password: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    if cursor.fetchone():
        conn.close()
        raise ValueError("An account with this email already exists.")

    pwd_hash, salt = hash_password(password)
    cursor.execute("""
    INSERT INTO users (email, name, password_hash, salt)
    VALUES (?, ?, ?, ?);
    """, (email.strip().lower(), name.strip(), pwd_hash, salt))
    user_id = cursor.lastrowid

    # Create clean empty profile for the new user (0% score)
    cursor.execute("""
    INSERT INTO career_profiles (
        user_id, candidate_name, track_name, target_role, target_company,
        runway_weeks, experience_level, domain, velocity_hrs, github_repo,
        education, interests, skills_json, readiness_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id,
        name.strip(),
        "Software Engineering",
        "",
        "",
        8,
        "Junior",
        "general",
        10,
        "",
        "",
        "",
        "[]",
        0
    ))

    conn.commit()
    conn.close()

    return {"id": user_id, "email": email.strip().lower(), "name": name.strip()}

def authenticate_user(email: str, password: str) -> dict | None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name, password_hash, salt FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return None
    if not verify_password(password, user["password_hash"], user["salt"]):
        return None

    return {"id": user["id"], "email": user["email"], "name": user["name"]}

def create_session(user_id: int, days_valid: int = 7) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=days_valid)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO sessions (session_token, user_id, expires_at)
    VALUES (?, ?, ?);
    """, (token, user_id, expires_at.isoformat()))
    conn.commit()
    conn.close()
    return token

def get_session_user(session_token: str) -> dict | None:
    if not session_token:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.session_token, s.expires_at, u.id, u.email, u.name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ?;
    """, (session_token,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    
    expires_at = datetime.fromisoformat(row["expires_at"])
    if expires_at < datetime.utcnow():
        delete_session(session_token)
        return None

    return {"id": row["id"], "email": row["email"], "name": row["name"]}

def delete_session(session_token: str):
    if not session_token:
        return
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE session_token = ?", (session_token,))
    conn.commit()
    conn.close()

# ==================== Learning Studio Persistence ====================

def save_simulation(user_id: int, topic: str, normalized_topic: str, concept_category: str, renderer_type: str, difficulty: str, spec_dict: dict, notes: str = "") -> dict:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO saved_simulations (
        user_id, topic, normalized_topic, concept_category, renderer_type, difficulty, spec_json, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id, topic, normalized_topic, concept_category, renderer_type, difficulty, json.dumps(spec_dict), notes
    ))
    sim_id = cursor.lastrowid
    conn.commit()

    # Record activity
    cursor.execute("""
    INSERT INTO learning_activities (
        user_id, simulation_id, topic, activity_type, difficulty, details_json
    ) VALUES (?, ?, ?, 'saved', ?, ?);
    """, (user_id, sim_id, topic, difficulty, json.dumps({"action": "Saved simulation to workspace library"})))
    conn.commit()
    conn.close()

    return {"id": sim_id, "topic": topic, "renderer_type": renderer_type}

def get_saved_simulations(user_id: int) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, topic, normalized_topic, concept_category, renderer_type, difficulty, spec_json, notes, created_at, updated_at
    FROM saved_simulations
    WHERE user_id = ?
    ORDER BY id DESC;
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        try:
            spec = json.loads(r["spec_json"])
        except Exception:
            spec = {}
        result.append({
            "id": r["id"],
            "topic": r["topic"],
            "normalized_topic": r["normalized_topic"],
            "concept_category": r["concept_category"],
            "renderer_type": r["renderer_type"],
            "difficulty": r["difficulty"],
            "spec": spec,
            "notes": r["notes"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"]
        })
    return result

def delete_saved_simulation(user_id: int, simulation_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM saved_simulations WHERE id = ? AND user_id = ?;", (simulation_id, user_id))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def record_learning_activity(user_id: int, topic: str, activity_type: str, difficulty: str = "intermediate", score: int = 0, details: dict = None, roadmap_task_title: str = "", simulation_id: int = None) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO learning_activities (
        user_id, simulation_id, topic, activity_type, difficulty, score, details_json, roadmap_task_title
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id, simulation_id, topic, activity_type, difficulty, score, json.dumps(details or {}), roadmap_task_title
    ))
    activity_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return activity_id

def get_learning_history(user_id: int, limit: int = 20) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, simulation_id, topic, activity_type, difficulty, score, details_json, roadmap_task_title, created_at
    FROM learning_activities
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT ?;
    """, (user_id, limit))
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        try:
            details = json.loads(r["details_json"] or "{}")
        except Exception:
            details = {}
        result.append({
            "id": r["id"],
            "simulation_id": r["simulation_id"],
            "topic": r["topic"],
            "activity_type": r["activity_type"],
            "difficulty": r["difficulty"],
            "score": r["score"],
            "details": details,
            "roadmap_task_title": r["roadmap_task_title"],
            "created_at": r["created_at"]
        })
    return result

# ==================== AI Resume Builder Persistence ====================

def save_resume(user_id: int, title: str, target_role: str, template: str, resume_data: dict, resume_id: int = None) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.utcnow().isoformat()

    if resume_id:
        cursor.execute("""
        UPDATE resumes SET
            title = ?,
            target_role = ?,
            template = ?,
            resume_data_json = ?,
            updated_at = ?
        WHERE id = ? AND user_id = ?;
        """, (title, target_role, template, json.dumps(resume_data), now_str, resume_id, user_id))
        if cursor.rowcount == 0:
            conn.close()
            return None
        saved_id = resume_id
    else:
        share_token = secrets.token_urlsafe(16)
        cursor.execute("""
        INSERT INTO resumes (
            user_id, title, target_role, template, resume_data_json, share_token, is_public, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?);
        """, (user_id, title, target_role, template, json.dumps(resume_data), share_token, now_str, now_str))
        saved_id = cursor.lastrowid

    conn.commit()
    cursor.execute("SELECT * FROM resumes WHERE id = ?;", (saved_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "title": row["title"],
        "target_role": row["target_role"],
        "template": row["template"],
        "resume_data": json.loads(row["resume_data_json"] or "{}"),
        "share_token": row["share_token"],
        "is_public": bool(row["is_public"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

def get_user_resumes(user_id: int) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, user_id, title, target_role, template, share_token, is_public, created_at, updated_at
    FROM resumes
    WHERE user_id = ?
    ORDER BY updated_at DESC;
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    return [{
        "id": r["id"],
        "user_id": r["user_id"],
        "title": r["title"],
        "target_role": r["target_role"],
        "template": r["template"],
        "share_token": r["share_token"],
        "is_public": bool(r["is_public"]),
        "created_at": r["created_at"],
        "updated_at": r["updated_at"]
    } for r in rows]

def get_user_resume(user_id: int, resume_id: int) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resumes WHERE id = ? AND user_id = ?;", (resume_id, user_id))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "title": row["title"],
        "target_role": row["target_role"],
        "template": row["template"],
        "resume_data": json.loads(row["resume_data_json"] or "{}"),
        "share_token": row["share_token"],
        "is_public": bool(row["is_public"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

def delete_user_resume(user_id: int, resume_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM resumes WHERE id = ? AND user_id = ?;", (resume_id, user_id))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def toggle_resume_public(user_id: int, resume_id: int, is_public: bool) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM resumes WHERE id = ? AND user_id = ?;", (resume_id, user_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    share_token = row["share_token"]
    if not share_token:
        share_token = secrets.token_urlsafe(16)

    cursor.execute("""
    UPDATE resumes SET is_public = ?, share_token = ?, updated_at = ? WHERE id = ? AND user_id = ?;
    """, (1 if is_public else 0, share_token, datetime.utcnow().isoformat(), resume_id, user_id))
    conn.commit()
    conn.close()
    return {"id": resume_id, "is_public": is_public, "share_token": share_token}

def get_public_resume(share_token: str) -> dict:
    if not share_token or len(share_token) < 8:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT title, target_role, template, resume_data_json, updated_at FROM resumes WHERE share_token = ? AND is_public = 1;", (share_token,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "title": row["title"],
        "target_role": row["target_role"],
        "template": row["template"],
        "resume_data": json.loads(row["resume_data_json"] or "{}"),
        "updated_at": row["updated_at"]
    }

def get_user_study_stats(user_id: int) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT created_at, activity_type, score FROM learning_activities
    WHERE user_id = ?
    ORDER BY created_at DESC;
    """, (user_id,))
    rows = cursor.fetchall()

    now = datetime.utcnow()
    today_str = now.date().isoformat()

    unique_dates = set()
    activities_today = 0
    total_sessions = len(rows)

    for r in rows:
        created = r["created_at"]
        if not created:
            continue
        try:
            d_str = str(created).split(" ")[0].split("T")[0]
            unique_dates.add(d_str)
            if d_str == today_str:
                activities_today += 1
        except Exception:
            continue

    streak = 0
    check_date = now.date()
    if check_date.isoformat() not in unique_dates:
        check_date = check_date - timedelta(days=1)

    while check_date.isoformat() in unique_dates:
        streak += 1
        check_date = check_date - timedelta(days=1)

    conn.close()
    return {
        "current_streak": max(1 if activities_today > 0 else 0, streak),
        "activities_today": activities_today,
        "daily_goal": 3,
        "total_sessions": total_sessions
    }

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
