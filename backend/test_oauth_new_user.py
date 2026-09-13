"""Regression test for the NEW-USER GitHub OAuth path.

Mocks only the two outbound GitHub calls (token exchange + profile fetch)
with async stand-ins; everything else — state verification, user creation,
commit, JWT, and the ensuing authenticated session — runs through the real
production code path.

Run:  DATABASE_URL=sqlite:///./test_oauth.db python test_oauth_new_user.py
"""
from unittest.mock import patch

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User

FRESH_GITHUB_PROFILE = {
    "id": 987654321,
    "login": "brand_new_gh_user",
    "email": None,  # no public email -> fallback email must be used
    "name": "Brand New",
    "avatar_url": "https://avatars.githubusercontent.com/u/987654321",
    "html_url": "https://github.com/brand_new_gh_user",
}


async def fake_exchange(code, redirect_uri):
    assert code.startswith("test-code-")
    return "gho_fake_access_token"


async def fake_profile(token):
    assert token == "gho_fake_access_token"
    return dict(FRESH_GITHUB_PROFILE)


def check(name, cond, extra=""):
    print(("PASS " if cond else "FAIL ") + name + (" | " + str(extra) if extra else ""))


with patch("app.routes.auth.github_oauth.exchange_code_for_token", fake_exchange), \
     patch("app.routes.auth.github_oauth.fetch_github_profile", fake_profile):

    with TestClient(app) as client:
        # Step 1: login page sets the state cookie
        r = client.get("/api/auth/github/login", follow_redirects=False)
        check("login 302 to GitHub", r.status_code == 302 and "github.com" in r.headers.get("location", ""))
        state = r.cookies.get("oauth_state")
        check("state cookie set", bool(state))

        # Step 2: callback with the code — new user path
        r = client.get(
            "/api/auth/github/callback?code=test-code-123&state=" + state,
            follow_redirects=False,
        )
        check("callback 302", r.status_code == 302)
        location = r.headers.get("location", "")
        check("redirects to /oauth/callback with token", "/oauth/callback#token=" in location, location[:80])
        token = location.split("#token=")[1]

        # Step 3: the token must authenticate the NEW user immediately
        r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        check("/auth/me 200 with new token", r.status_code == 200, r.text[:120])
        me = r.json()
        check("user is the new GitHub user", me["username"].startswith("brand_new_gh_user"))
        check("setup incomplete (must go to /setup)", me["profile_setup_complete"] is False)
        check("fallback email used (no public email)", "users.noreply.github.com" in me["email"])

        # Step 4: SECOND login for the same GitHub identity -> same user (no duplicate)
        r = client.get("/api/auth/github/login", follow_redirects=False)
        state2 = r.cookies.get("oauth_state")
        r = client.get(
            "/api/auth/github/callback?code=test-code-456&state=" + state2,
            follow_redirects=False,
        )
        token2 = r.headers.get("location", "").split("#token=")[1]
        r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token2}"})
        check("second login reuses account (no duplicate)", r.json()["id"] == me["id"])

        db = SessionLocal()
        users_with_gh = db.query(User).filter(User.github_id == 987654321).count()
        db.close()
        check("exactly one DB row for the GitHub identity", users_with_gh == 1, users_with_gh)

        # cleanup
        db = SessionLocal()
        u = db.query(User).filter(User.github_id == 987654321).first()
        if u:
            db.delete(u)
            db.commit()
        db.close()

print("=== NEW-USER OAUTH REGRESSION TEST COMPLETE ===")
