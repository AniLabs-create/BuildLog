"""Comprehensive Portfolio API automated regression tests.
"""
from fastapi.testclient import TestClient
from app.main import app

def run_portfolio_tests():
    print("=== STARTING PORTFOLIO SYSTEM API TESTS ===")
    with TestClient(app) as client:
        # 1. Login or Signup test developer
        print("\n--- 1. Authenticating Developer ---")
        login_res = client.post("/api/auth/login", json={
            "identifier": "nizam_dev",
            "password": "supersecretpassword123"
        })
        if login_res.status_code != 200:
            signup_res = client.post("/api/auth/signup", json={
                "username": "portfolio_dev",
                "email": "portfolio_dev@buildlog.app",
                "password": "supersecretpassword123"
            })
            token = signup_res.json()["access_token"]
        else:
            token = login_res.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        me_res = client.get("/api/auth/me", headers=headers)
        username = me_res.json()["username"]
        print(f"Logged in as @{username}")

        # 2. Check Entitlements (Default Free)
        print("\n--- 2. Checking Entitlements ---")
        ent_res = client.get("/api/entitlements", headers=headers)
        assert ent_res.status_code == 200, f"Entitlements failed: {ent_res.text}"
        ent_data = ent_res.json()
        print("Default Entitlements:", ent_data)
        assert "portfolio_basic" in ent_data["features"]
        assert ent_data["features"]["portfolio_basic"] is True

        # 3. Test Import from BuildLog
        print("\n--- 3. Testing BuildLog Data Import Engine ---")
        import_res = client.post("/api/portfolios/import-buildlog?template_id=noir", headers=headers)
        assert import_res.status_code == 200, f"Import failed: {import_res.text}"
        imported_data = import_res.json()
        print(f"Imported Portfolio Title: {imported_data['title']}, Template: {imported_data['template_id']}")
        assert "profile" in imported_data
        assert "hero" in imported_data
        assert "skills" in imported_data
        assert "projects" in imported_data

        # 4. Create Portfolio
        print("\n--- 4. Testing Create Portfolio ---")
        create_payload = {
            "title": "Senior Systems Architect Portfolio",
            "slug": "systems-architect",
            "template_id": "minimal",
            "initial_data": imported_data,
        }
        create_res = client.post("/api/portfolios", json=create_payload, headers=headers)
        assert create_res.status_code == 201, f"Create portfolio failed: {create_res.text}"
        portfolio = create_res.json()
        portfolio_id = portfolio["id"]
        portfolio_slug = portfolio["slug"]
        print(f"Created Portfolio ID={portfolio_id}, Slug={portfolio_slug}")
        assert portfolio["status"] == "draft"

        # 5. List Portfolios
        print("\n--- 5. Testing List Portfolios ---")
        list_res = client.get("/api/portfolios", headers=headers)
        assert list_res.status_code == 200
        portfolios_list = list_res.json()
        assert len(portfolios_list) >= 1
        print(f"Found {len(portfolios_list)} user portfolios.")

        # 6. Update Portfolio & Save Version
        print("\n--- 6. Testing Update Portfolio & Version Snapshot ---")
        update_payload = {
            "title": "Principal Engineer Portfolio",
            "template_id": "noir",
            "hero_data": {
                "headline": "Engineering High-Performance Distributed Systems",
                "subheadline": "Specialized in Python, FastAPI, and resilient infrastructure.",
                "availability_badge": "Available for High-Impact Roles",
            },
            "save_version": True,
            "version_message": "Upgraded headline & switched to Noir theme",
        }
        update_res = client.put(f"/api/portfolios/{portfolio_id}", json=update_payload, headers=headers)
        assert update_res.status_code == 200
        updated_pf = update_res.json()
        assert updated_pf["template_id"] == "noir"
        assert updated_pf["hero_data"]["headline"] == "Engineering High-Performance Distributed Systems"
        print("Portfolio update OK.")

        # 7. Check Version History
        print("\n--- 7. Testing Version History ---")
        versions_res = client.get(f"/api/portfolios/{portfolio_id}/versions", headers=headers)
        assert versions_res.status_code == 200
        versions = versions_res.json()
        assert len(versions) >= 2, f"Expected at least 2 versions, got {len(versions)}"
        print(f"Recorded {len(versions)} versions.")

        # 8. Restore Version
        print("\n--- 8. Testing Restore Version ---")
        v_to_restore = versions[-1]["id"]  # initial version
        restore_res = client.post(f"/api/portfolios/{portfolio_id}/versions/{v_to_restore}/restore", headers=headers)
        assert restore_res.status_code == 200
        restored_pf = restore_res.json()
        assert restored_pf["template_id"] == "minimal"
        print("Version restored successfully.")

        # 9. Test Publishing & Public Endpoint
        print("\n--- 9. Testing Publish & Public Portfolio ---")
        # Verify non-published is 404 for unauthenticated viewer
        unpub_public = client.get(f"/api/p/{username}/{portfolio_slug}")
        assert unpub_public.status_code == 404, "Draft portfolio should not be publicly accessible"

        # Publish portfolio
        pub_res = client.post(f"/api/portfolios/{portfolio_id}/publish", headers=headers)
        assert pub_res.status_code == 200
        assert pub_res.json()["status"] == "published"

        # Now verify public access
        pub_public = client.get(f"/api/p/{username}/{portfolio_slug}")
        assert pub_public.status_code == 200, f"Public portfolio failed: {pub_public.text}"
        pub_data = pub_public.json()
        assert pub_data["portfolio"]["title"] is not None
        assert pub_data["owner"]["username"] == username
        print(f"Public portfolio verified at /p/{username}/{portfolio_slug}")

        # 10. Test AI Paywall on Free tier
        print("\n--- 10. Testing AI Paywall on Free Tier ---")
        # Ensure Free
        client.post("/api/entitlements/demo-toggle", json={"is_pro": False, "tier": "free"}, headers=headers)
        ai_free_res = client.post(f"/api/portfolios/{portfolio_id}/ai/chat", json={"prompt": "Make my portfolio look like terminal"}, headers=headers)
        assert ai_free_res.status_code == 403, "Free user should be blocked by paywall"
        print("AI Free user paywall check OK (403 returned).")

        # 11. Test Unlock Demo Pro & AI Agent
        print("\n--- 11. Testing Demo Pro Unlock & AI Agent ---")
        pro_toggle_res = client.post("/api/entitlements/demo-toggle", json={"is_pro": True, "tier": "pro_demo"}, headers=headers)
        assert pro_toggle_res.status_code == 200
        assert pro_toggle_res.json()["is_pro"] is True
        assert pro_toggle_res.json()["features"]["portfolio_ai"] is True

        # Now run AI request
        ai_pro_res = client.post(f"/api/portfolios/{portfolio_id}/ai/chat", json={"prompt": "Switch to terminal template and update headline to systems engineer"}, headers=headers)
        assert ai_pro_res.status_code == 200, f"AI request failed: {ai_pro_res.text}"
        ai_response = ai_pro_res.json()
        print("AI Agent message:", ai_response["message"])
        assert len(ai_response["actions"]) >= 1

        # Apply AI Action
        action_to_apply = ai_response["actions"][0]
        apply_res = client.post(f"/api/portfolios/{portfolio_id}/ai/apply", json={"action": action_to_apply}, headers=headers)
        assert apply_res.status_code == 200
        print("AI Action applied successfully.")

        # 12. Cleanup (Delete portfolio)
        print("\n--- 12. Testing Delete Portfolio ---")
        del_res = client.delete(f"/api/portfolios/{portfolio_id}", headers=headers)
        assert del_res.status_code == 204
        print("Portfolio deletion OK.")

        print("\n=======================================================")
        print("ALL PORTFOLIO BACKEND TESTS PASSED 100% SUCCESSFULLY!")
        print("=======================================================")

if __name__ == "__main__":
    run_portfolio_tests()
