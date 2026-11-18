import uuid

import pytest
from fastapi.testclient import TestClient

import database
import gemini_service

PASSWORD = "Password123!"


@pytest.fixture(autouse=True)
def isolated_env(tmp_path, monkeypatch):
    """Every test gets its own empty database and never calls Gemini."""
    monkeypatch.setattr(database, "DB_PATH", str(tmp_path / "test.db"))
    # No API key -> the deterministic fallback engines are used.
    monkeypatch.setattr(gemini_service, "get_api_key", lambda: None)


@pytest.fixture
def make_client():
    """Factory for independent API clients (each has its own cookie jar)."""
    from main import app

    clients = []

    def _make():
        c = TestClient(app)
        c.__enter__()  # runs the startup event (init_db on the temp database)
        clients.append(c)
        return c

    yield _make
    for c in clients:
        c.__exit__(None, None, None)


def _register(client, name):
    email = f"{name.split()[0].lower()}_{uuid.uuid4().hex[:8]}@test.com"
    r = client.post("/api/auth/register", json={
        "name": name, "email": email,
        "password": PASSWORD, "confirm_password": PASSWORD,
    })
    assert r.status_code == 200, r.text
    client.email = email
    return client


@pytest.fixture
def anon(make_client):
    """A client that is not logged in."""
    return make_client()


@pytest.fixture
def client(make_client):
    """Logged-in user 1 (Sarah Miller)."""
    return _register(make_client(), "Sarah Miller")


@pytest.fixture
def client2(make_client):
    """Logged-in user 2 (David Kim), for isolation tests."""
    return _register(make_client(), "David Kim")


@pytest.fixture
def analyzed(client):
    """User 1 after a Frontend Developer career analysis (roadmap exists)."""
    r = client.post("/api/analyze-career", json={
        "target_role": "Frontend Developer",
        "target_company": "Stripe",
        "experience_level": "Junior",
        "skills": [
            {"name": "HTML5 / CSS3 / Modern Layouts", "level": "intermediate"},
            {"name": "JavaScript (ES2024+)", "level": "beginner"},
        ],
        "velocity_hrs": 12,
    })
    assert r.status_code == 200, r.text
    client.analysis = r.json()["data"]
    return client
