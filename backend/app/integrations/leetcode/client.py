"""LeetCode public-data client.

Uses LeetCode's public GraphQL endpoint — the legitimate method for public
profile stats. No passwords, cookies, sessions, or private endpoints. If
LeetCode blocks or changes the endpoint, the integration degrades to a
friendly error rather than showing fake data.
"""
from typing import Any, Optional

import httpx

LEETCODE_GRAPHQL = "https://leetcode.com/graphql"
LEETCODE_PROFILE_URL = "https://leetcode.com/u/{username}/"

HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "BuildLog/1.0 (+https://buildlog.app)",
}


class LeetCodeError(Exception):
    """Raised when LeetCode data can't be fetched; message is user-safe."""


def _query(query: str, variables: dict[str, Any]) -> dict[str, Any]:
    try:
        response = httpx.post(
            LEETCODE_GRAPHQL,
            json={"query": query, "variables": variables},
            headers=HEADERS,
            timeout=20,
        )
    except httpx.HTTPError:
        raise LeetCodeError("Could not reach LeetCode. Check your connection and try again.")

    if response.status_code != 200:
        raise LeetCodeError("LeetCode returned an unexpected error. Please try again later.")

    data = response.json()
    if data.get("errors"):
        raise LeetCodeError("LeetCode could not find that username.")
    return data.get("data") or {}


def fetch_public_profile(username: str) -> dict[str, Any]:
    """Public solved counts and ranking for a username. Omits unavailable values."""
    data = _query(
        """
        query publicProfile($username: String!) {
          allQuestionsCount { difficulty count }
          matchedUser(username: $username) {
            username
            profile { ranking reputation }
            submitStatsGlobal { acSubmissionNum { difficulty count } }
          }
        }
        """,
        {"username": username},
    )

    matched = data.get("matchedUser")
    if not matched:
        raise LeetCodeError(f"No LeetCode user named '{username}' was found.")

    counts = {
        item["difficulty"]: item["count"]
        for item in (data.get("allQuestionsCount") or [])
    }
    solved = {
        item["difficulty"]: item["count"]
        for item in ((matched.get("submitStatsGlobal") or {}).get("acSubmissionNum") or [])
    }
    profile_info = matched.get("profile") or {}

    result: dict[str, Any] = {
        "username": matched.get("username") or username,
        "profile_url": LEETCODE_PROFILE_URL.format(username=username),
    }
    if "All" in solved:
        result["solved"] = solved["All"]
    for level in ("Easy", "Medium", "Hard"):
        if level in solved:
            result[level.lower()] = solved[level]
    if ranking := profile_info.get("ranking"):
        result["ranking"] = ranking
    # Keep total question counts for a progress ratio in the UI
    for level in ("Easy", "Medium", "Hard", "All"):
        if level in counts:
            result[f"total_{level.lower()}"] = counts[level]
    return result


def fetch_recent_solved(username: str, limit: int = 20) -> list[dict[str, Any]]:
    """Recently accepted (public) submissions. Returns [] if unavailable."""
    data = _query(
        """
        query recentAc($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
        """,
        {"username": username, "limit": limit},
    )
    return data.get("recentAcSubmissionList") or []
