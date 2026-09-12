from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get("/health")
    assert res.status_code == 200, f"Health failed: {res.text}"
    print("Health check OK:", res.json())

    print("\n--- 2. Testing User Signup ---")
    signup_data = {
        "username": "nizam_dev",
        "email": "nizam@buildlog.dev",
        "password": "supersecretpassword123"
    }
    # If user exists from previous run, that's fine; let's test login or unique user
    res = client.post("/api/auth/signup", json=signup_data)
    if res.status_code == 400 and "already" in res.text:
        print("User already registered, proceeding to login...")
    else:
        assert res.status_code == 201, f"Signup failed: {res.text}"
        print("Signup OK. User ID:", res.json()["user"]["id"])

    print("\n--- 3. Testing User Login ---")
    login_data = {
        "identifier": "nizam_dev",
        "password": "supersecretpassword123"
    }
    res = client.post("/api/auth/login", json=login_data)
    assert res.status_code == 200, f"Login failed: {res.text}"
    token_data = res.json()
    token = token_data["access_token"]
    print("Login OK. Received JWT token.")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 4. Testing GET /api/auth/me ---")
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200, f"Get me failed: {res.text}"
    user_id = res.json()["id"]
    print(f"Auth Me OK: username={res.json()['username']}, id={user_id}")

    print("\n--- 5. Testing Create Project ---")
    project_payload = {
        "name": "SmartShortlist",
        "description": "AI hackathon candidate parser with PDF extraction.",
        "status": "Building",
        "tech_stack": ["Python", "FastAPI", "React"],
        "github_url": "https://github.com/nizam/smartshortlist",
        "demo_url": "https://smartshortlist.dev"
    }
    res = client.post("/api/projects", json=project_payload, headers=headers)
    assert res.status_code == 201, f"Create project failed: {res.text}"
    project_id = res.json()["id"]
    print(f"Create Project OK: ID={project_id}, Name={res.json()['name']}")

    print("\n--- 6. Testing List Projects ---")
    res = client.get("/api/projects", headers=headers)
    assert res.status_code == 200, f"List projects failed: {res.text}"
    projects = res.json()
    assert len(projects) >= 1, "No projects returned"
    print(f"List Projects OK: Found {len(projects)} projects.")

    print("\n--- 7. Testing Create Build Log ---")
    log_payload = {
        "built": "Added PDF text extraction API with binary stream support.",
        "learned": "How PDF fonts encode character mapping tables.",
        "problems": "Scanned images return zero character streams.",
        "next_steps": "Add Tesseract OCR pipeline."
    }
    res = client.post(f"/api/projects/{project_id}/logs", json=log_payload, headers=headers)
    assert res.status_code == 201, f"Create build log failed: {res.text}"
    log_id = res.json()["id"]
    print(f"Create Build Log OK: ID={log_id}")

    print("\n--- 8. Testing List Project Logs ---")
    res = client.get(f"/api/projects/{project_id}/logs", headers=headers)
    assert res.status_code == 200, f"List logs failed: {res.text}"
    logs = res.json()
    assert len(logs) >= 1, "No logs returned"
    print(f"List Logs OK: Found {len(logs)} logs.")

    print("\n--- 9. Testing Streak Calculation ---")
    res = client.get("/api/stats/streak", headers=headers)
    assert res.status_code == 200, f"Streak failed: {res.text}"
    streak_data = res.json()
    print("Streak Calculation OK:", streak_data)
    assert streak_data["current_streak"] >= 1, "Streak should be at least 1 after logging today"

    print("\n--- 10. Testing Dashboard Summary ---")
    res = client.get("/api/stats/dashboard", headers=headers)
    assert res.status_code == 200, f"Dashboard summary failed: {res.text}"
    dash_data = res.json()
    print("Dashboard Summary OK:", dash_data)
    assert dash_data["project_count"] >= 1
    assert dash_data["log_count"] >= 1

    print("\n==========================================")
    print("ALL BACKEND TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
