"""GitHub OAuth helpers (authorization-code flow).

Security notes:
- The client SECRET lives only here (backend env) and is never sent to the
  browser or the React app.
- A random `state` parameter ties the /login redirect to the /callback hit
  (CSRF protection); it is stored in a short-lived HttpOnly cookie.
- BuildLog does NOT persist the GitHub access token — it is used once to
  read the profile, then discarded.
"""
import re
import secrets
from typing import Any, Optional

import httpx
from fastapi import HTTPException, status

from app.config import settings

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

# BuildLog usernames are ^[a-z0-9_]{3,30}$ — GitHub logins allow hyphens etc.
_USERNAME_CLEANUP = re.compile(r"[^a-z0-9_]+")


class GitHubOAuthError(Exception):
    """Raised when the OAuth flow fails; message is safe to show the user."""


def is_github_configured() -> bool:
    return bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET)


def generate_state() -> str:
    return secrets.token_urlsafe(32)


def build_authorize_url(state: str, redirect_uri: str) -> str:
    """The URL the browser is redirected to so the user approves BuildLog on GitHub."""
    from urllib.parse import urlencode

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "read:user user:email",
        "state": state,
    }
    return f"{GITHUB_AUTHORIZE_URL}?{urlencode(params)}"


async def exchange_code_for_token(code: str, redirect_uri: str) -> str:
    """Trade the one-time authorization code for a GitHub access token."""
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            GITHUB_TOKEN_URL,
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )

    if response.status_code != 200:
        raise GitHubOAuthError("Could not verify your GitHub login. Please try again.")

    data = response.json()
    token = data.get("access_token")
    if not token:
        # GitHub returns {"error": "bad_verification_code"} for invalid/expired codes
        raise GitHubOAuthError(
            "Your GitHub login session expired. Please try again."
            if data.get("error") == "bad_verification_code"
            else "GitHub did not approve the login. Please try again."
        )
    return token


async def fetch_github_profile(access_token: str) -> dict[str, Any]:
    """
    Fetch the GitHub user profile and, if the profile has no public email,
    the account's primary verified email (requires the user:email scope).
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        user_response = await client.get(GITHUB_USER_URL, headers=headers)
        if user_response.status_code != 200:
            raise GitHubOAuthError("Could not read your GitHub profile. Please try again.")
        profile: dict[str, Any] = user_response.json()

        if not profile.get("email"):
            emails_response = await client.get(GITHUB_EMAILS_URL, headers=headers)
            if emails_response.status_code == 200:
                emails: list[dict[str, Any]] = emails_response.json()
                primary = next(
                    (e for e in emails if e.get("primary") and e.get("verified")), None
                )
                if primary:
                    profile["email"] = primary.get("email")

    return profile


def suggest_username(github_login: str, github_id: int) -> str:
    """
    Turn a GitHub login into a valid BuildLog username suggestion.
    The user can change it freely during /setup (availability is re-checked there).
    """
    base = _USERNAME_CLEANUP.sub("_", (github_login or "").lower()).strip("_")[:28]
    if len(base) < 3:
        base = f"dev_{base}" if base else "builder"
    # Numeric suffix keeps it unique without a database roundtrip here;
    # /setup's live availability check catches any remaining conflict.
    return f"{base}_{str(github_id)[-4:]}"


def fallback_email(github_login: str, github_id: int) -> str:
    """
    Deterministic unique email for GitHub accounts that share no verified
    email with us (GitHub allows that). Follows GitHub's own noreply shape.
    """
    return f"{github_id}+{github_login}@users.noreply.github.com"
