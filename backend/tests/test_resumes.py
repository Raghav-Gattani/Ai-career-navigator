import pytest


@pytest.fixture
def resume_data(client):
    r = client.post("/api/resume/generate", json={"target_role": "Frontend Developer"})
    assert r.status_code == 200
    return r.json()["resume_data"]


@pytest.fixture
def saved_resume(client, resume_data):
    r = client.post("/api/resumes", json={
        "title": "Sarah Miller - Senior Frontend Track",
        "target_role": "Frontend Developer",
        "template": "modern",
        "resume_data": resume_data,
    })
    assert r.status_code == 200
    return r.json()["resume"]


def test_generate_resume_uses_candidate_name(client):
    r = client.post("/api/resume/generate", json={"target_role": "Frontend Developer"})
    assert r.status_code == 200
    data = r.json()["resume_data"]
    assert data["personal_info"]["name"] == "Sarah Miller"
    for section in ("summary", "technical_skills", "projects"):
        assert section in data


def test_regenerate_section(client, resume_data):
    r = client.post("/api/resume/regenerate-section", json={
        "section_name": "summary", "target_role": "Frontend Developer",
        "current_resume_data": resume_data, "instructions": "Emphasize responsive design",
    })
    assert r.status_code == 200
    body = r.json()
    assert body["section_name"] == "summary"
    assert len(body["section_data"]) > 10


def test_regenerate_invalid_section_rejected(client, resume_data):
    r = client.post("/api/resume/regenerate-section", json={
        "section_name": "not_a_section", "target_role": "Frontend Developer",
        "current_resume_data": resume_data,
    })
    assert r.status_code == 400


def test_save_and_list_resume(client, saved_resume):
    assert saved_resume["is_public"] is False
    listed = client.get("/api/resumes").json()["resumes"]
    assert any(r["id"] == saved_resume["id"] for r in listed)


def test_resume_is_private_to_owner(client2, saved_resume):
    rid = saved_resume["id"]
    assert client2.get(f"/api/resumes/{rid}").status_code == 404
    assert client2.delete(f"/api/resumes/{rid}").status_code == 404
    assert client2.post(f"/api/resumes/{rid}/share", json={"is_public": True}).status_code == 404


def test_public_share_lifecycle(client, anon, saved_resume):
    rid, token = saved_resume["id"], saved_resume["share_token"]
    public_url = f"/api/public/resume/{token}"

    assert anon.get(public_url).status_code == 404  # private by default

    on = client.post(f"/api/resumes/{rid}/share", json={"is_public": True})
    assert on.status_code == 200 and on.json()["share"]["is_public"] is True
    public = anon.get(public_url)
    assert public.status_code == 200
    assert public.json()["resume"]["title"] == "Sarah Miller - Senior Frontend Track"

    off = client.post(f"/api/resumes/{rid}/share", json={"is_public": False})
    assert off.status_code == 200
    assert anon.get(public_url).status_code == 404  # revoked


def test_export_pdf(client, resume_data):
    r = client.post("/api/resume/export-pdf", json={"template": "modern", "resume_data": resume_data})
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content.startswith(b"%PDF")
    assert len(r.content) > 1000


def test_delete_resume(client, saved_resume):
    rid = saved_resume["id"]
    assert client.delete(f"/api/resumes/{rid}").status_code == 200
    assert client.get(f"/api/resumes/{rid}").status_code == 404
