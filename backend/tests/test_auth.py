import pytest

from tests.conftest import PASSWORD


def test_health(anon):
    r = anon.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"
    assert len(r.json()["supported_careers"]) == 7


def test_register_and_session_cookie(anon):
    r = anon.post("/api/auth/register", json={
        "name": "Sarah Miller", "email": "sarah@test.com",
        "password": PASSWORD, "confirm_password": PASSWORD,
    })
    assert r.status_code == 200
    assert r.json()["user"]["name"] == "Sarah Miller"
    assert "session_id" in anon.cookies


def test_duplicate_registration_rejected(client, anon):
    r = anon.post("/api/auth/register", json={
        "name": "Duplicate", "email": client.email,
        "password": PASSWORD, "confirm_password": PASSWORD,
    })
    assert r.status_code == 400


@pytest.mark.parametrize("bad_email", ["notanemail", "user@", "@domain.com", "user name@test.com"])
def test_invalid_email_rejected(anon, bad_email):
    r = anon.post("/api/auth/register", json={
        "name": "Test User", "email": bad_email,
        "password": PASSWORD, "confirm_password": PASSWORD,
    })
    assert r.status_code == 400


def test_password_mismatch_rejected(anon):
    r = anon.post("/api/auth/register", json={
        "name": "Test User", "email": "mismatch@test.com",
        "password": PASSWORD, "confirm_password": "Different123!",
    })
    assert r.status_code == 400


def test_wrong_password_login_rejected(client, anon):
    r = anon.post("/api/auth/login", json={"email": client.email, "password": "WrongPassword!"})
    assert r.status_code == 401


def test_login_sets_session_cookie(client, anon):
    r = anon.post("/api/auth/login", json={"email": client.email, "password": PASSWORD})
    assert r.status_code == 200
    assert "session_id" in anon.cookies


def test_protected_endpoint_requires_login(anon):
    assert anon.get("/api/profile").status_code == 401


def test_logout_revokes_session(client):
    assert client.get("/api/profile").status_code == 200
    assert client.post("/api/auth/logout").status_code == 200
    assert client.get("/api/profile").status_code == 401
