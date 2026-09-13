"""GitHub integration provider — implements the BaseIntegration interface
using the GitHubIntegration table and the client/sync helpers."""
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.config import settings
from app.integrations.base import BaseIntegration
from app.integrations.github import client, sync as github_sync
from app.models.integration import GitHubIntegration


class GitHubIntegrationProvider(BaseIntegration):
    provider = "github"
    display_name = "GitHub"

    def _get_row(self, db: Session, user_id: int) -> Optional[GitHubIntegration]:
        return (
            db.query(GitHubIntegration)
            .filter(GitHubIntegration.user_id == user_id)
            .first()
        )

    def is_connected(self, db: Session, user_id: int) -> bool:
        return self._get_row(db, user_id) is not None

    def disconnect(self, db: Session, user_id: int) -> None:
        """
        Revoke the stored token on GitHub (best effort) and delete the row.
        Synced Projects and ExternalActivity rows are intentionally KEPT —
        they are the user's content.
        """
        integration = self._get_row(db, user_id)
        if not integration:
            return
        try:
            token = client.decrypt_token(integration)
            client.revoke_token(
                settings.GITHUB_CLIENT_ID, settings.GITHUB_CLIENT_SECRET, token
            )
        except Exception:
            pass  # best-effort; expired/rotated tokens fail revocation harmlessly
        db.delete(integration)
        db.commit()

    def sync(self, db: Session, user_id: int) -> Dict[str, Any]:
        integration = self._get_row(db, user_id)
        if not integration:
            raise KeyError("GitHub is not connected")
        repo_summary = github_sync.sync_repositories(db, integration)
        new_events = github_sync.sync_activity(db, integration)
        return {**repo_summary, "new_activity": new_events}

    def status(self, db: Session, user_id: int) -> Optional[Dict[str, Any]]:
        integration = self._get_row(db, user_id)
        if not integration:
            return None
        return {
            "username": integration.github_username,
            "avatar_url": integration.avatar_url,
            "scopes": integration.scopes,
            "connected_at": integration.connected_at.isoformat(),
            "last_synced_at": (
                integration.last_synced_at.isoformat() if integration.last_synced_at else None
            ),
            "stats": integration.stats_cache or {},
        }


# Self-register so `registry.get("github")` works everywhere
from app.integrations.base import registry  # noqa: E402  (avoid circular import)

github_integration = GitHubIntegrationProvider()
registry.register(github_integration)
