"""Thin GitHub API client used by the integration.

All calls run on the backend with the user's stored, encrypted token —
the token never leaves the server. Every function raises GitHubApiError
with a user-friendly message so routes can return clean errors.
"""
from typing import Any, Optional

import httpx

from app.utils.encryption import decrypt_secret

GITHUB_API = "https://api.github.com"


class GitHubApiError(Exception):
    """Raised when a GitHub API call fails; message is safe to show users."""


def _headers(access_token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _friendly(status: int) -> str:
    if status == 401:
        return "Your GitHub connection expired. Disconnect and reconnect GitHub."
    if status == 403:
        return "GitHub rate limit or permission problem. Try again in a few minutes."
    if status == 404:
        return "That resource was not found on GitHub (it may be private or deleted)."
    return "GitHub returned an unexpected error. Please try again."


def _get(url: str, access_token: str) -> Any:
    try:
        response = httpx.get(url, headers=_headers(access_token), timeout=20)
    except httpx.HTTPError:
        raise GitHubApiError("Could not reach GitHub. Check your connection and try again.")
    if response.status_code != 200:
        raise GitHubApiError(_friendly(response.status_code))
    return response.json()


def decrypt_token(integration) -> str:
    """Decrypt a GitHubIntegration row's stored token."""
    return decrypt_secret(integration.access_token_encrypted)


def get_authenticated_user(access_token: str) -> dict[str, Any]:
    """The GitHub account the token belongs to (sanity check after connect)."""
    return _get(f"{GITHUB_API}/user", access_token)


def list_owned_repositories(access_token: str, username: str, max_pages: int = 3) -> list[dict[str, Any]]:
    """The user's own repositories, most recently pushed first (up to 3 pages of 100)."""
    repos: list[dict[str, Any]] = []
    for page in range(1, max_pages + 1):
        data = _get(
            f"{GITHUB_API}/users/{username}/repos?per_page=100&page={page}&sort=pushed&type=owner",
            access_token,
        )
        repos.extend(data)
        if len(data) < 100:
            break
    return repos


def list_public_events(username: str, max_pages: int = 2) -> list[dict[str, Any]]:
    """Public activity events for a user (no token needed — public data)."""
    events: list[dict[str, Any]] = []
    try:
        with httpx.Client(timeout=20, headers={"Accept": "application/vnd.github+json"}) as client:
            for page in range(1, max_pages + 1):
                response = client.get(
                    f"{GITHUB_API}/users/{username}/events/public?per_page=100&page={page}"
                )
                if response.status_code != 200:
                    break
                events.extend(response.json())
                if len(response.json()) < 100:
                    break
    except httpx.HTTPError:
        raise GitHubApiError("Could not reach GitHub. Check your connection and try again.")
    return events


def push_file(
    access_token: str,
    owner: str,
    repo: str,
    path: str,
    content: str,
    commit_message: str,
    branch: Optional[str] = None,
) -> dict[str, Any]:
    """
    Create or update a single file in the user's repository
    (GitHub Contents API). Returns the commit details from GitHub.
    """
    import base64

    body: dict[str, Any] = {
        "message": commit_message,
        "content": base64.b64encode(content.encode("utf-8")).decode("ascii"),
    }
    if branch:
        body["branch"] = branch

    url = f"{GITHUB_API}/repos/{owner}/{repo}/contents/{path}"
    try:
        response = httpx.put(url, json=body, headers=_headers(access_token), timeout=30)
    except httpx.HTTPError:
        raise GitHubApiError("Could not reach GitHub. Check your connection and try again.")

    if response.status_code not in (200, 201):
        raise GitHubApiError(_friendly(response.status_code))
    data = response.json()
    return {
        "commit_url": data.get("commit", {}).get("html_url"),
        "commit_sha": data.get("commit", {}).get("sha"),
    }


def revoke_token(client_id: str, client_secret: str, access_token: str) -> None:
    """Best-effort revoke of the stored token on disconnect (never raises)."""
    try:
        httpx.delete(
            f"{GITHUB_API}/applications/{client_id}/token",
            json={"access_token": access_token},
            auth=(client_id, client_secret),
            timeout=15,
        )
    except httpx.HTTPError:
        pass  # revocation is best-effort; the local row is deleted regardless
