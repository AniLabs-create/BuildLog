"""LeetCode integration provider — username-based public data connection."""
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.integrations.base import BaseIntegration, registry
from app.integrations.leetcode import client
from app.models.external_activity import ExternalActivity
from app.models.integration import LeetCodeIntegration


class LeetCodeIntegrationProvider(BaseIntegration):
    provider = "leetcode"
    display_name = "LeetCode"

    def _get_row(self, db: Session, user_id: int) -> Optional[LeetCodeIntegration]:
        return (
            db.query(LeetCodeIntegration)
            .filter(LeetCodeIntegration.user_id == user_id)
            .first()
        )

    def is_connected(self, db: Session, user_id: int) -> bool:
        return self._get_row(db, user_id) is not None

    def disconnect(self, db: Session, user_id: int) -> None:
        """Remove the connection. Activity history is intentionally kept."""
        integration = self._get_row(db, user_id)
        if integration:
            db.delete(integration)
            db.commit()

    def connect(self, db: Session, user_id: int, username: str) -> dict:
        """Validate the username against LeetCode, then store the connection."""
        username = username.strip()
        profile = client.fetch_public_profile(username)  # raises LeetCodeError if unknown

        integration = self._get_row(db, user_id)
        if integration:
            integration.leetcode_username = profile["username"]
            integration.last_synced_at = datetime.now(timezone.utc)
            integration.profile_cache = profile
        else:
            integration = LeetCodeIntegration(
                user_id=user_id,
                leetcode_username=profile["username"],
                last_synced_at=datetime.now(timezone.utc),
                profile_cache=profile,
            )
            db.add(integration)
        db.commit()
        return profile

    def sync(self, db: Session, user_id: int) -> Dict[str, Any]:
        integration = self._get_row(db, user_id)
        if not integration:
            raise KeyError("LeetCode is not connected")

        profile = client.fetch_public_profile(integration.leetcode_username)
        integration.last_synced_at = datetime.now(timezone.utc)
        integration.profile_cache = profile
        new_solved = self._sync_solved_activity(db, integration)
        db.commit()
        return {"username": integration.leetcode_username, "new_activity": new_solved, **profile}

    def _sync_solved_activity(self, db: Session, integration: LeetCodeIntegration) -> int:
        """Store recently solved problems as ExternalActivity (deduplicated)."""
        recent = client.fetch_recent_solved(integration.leetcode_username)

        existing_ids = {
            row[0]
            for row in db.query(ExternalActivity.external_id)
            .filter(
                ExternalActivity.user_id == integration.user_id,
                ExternalActivity.source == "leetcode",
            )
            .all()
        }

        new_count = 0
        for item in recent:
            slug = item.get("titleSlug")
            if not slug:
                continue
            external_id = f"ac-{item.get('id') or slug}"
            if external_id in existing_ids:
                continue

            timestamp = item.get("timestamp")
            occurred_at = (
                datetime.fromtimestamp(int(timestamp), tz=timezone.utc).replace(tzinfo=None)
                if timestamp else datetime.utcnow()
            )
            title = item.get("title") or slug

            db.add(ExternalActivity(
                user_id=integration.user_id,
                source="leetcode",
                type="solve",
                external_id=external_id,
                repository=None,
                title=f'Solved "{title}"',
                url=f"https://leetcode.com/problems/{slug}/",
                occurred_at=occurred_at,
                payload=None,
            ))
            existing_ids.add(external_id)
            new_count += 1

        return new_count

    def status(self, db: Session, user_id: int) -> Optional[Dict[str, Any]]:
        integration = self._get_row(db, user_id)
        if not integration:
            return None
        return {
            "username": integration.leetcode_username,
            "connected_at": integration.connected_at.isoformat(),
            "last_synced_at": (
                integration.last_synced_at.isoformat() if integration.last_synced_at else None
            ),
            "stats": integration.profile_cache or {},
        }


leetcode_integration = LeetCodeIntegrationProvider()
registry.register(leetcode_integration)
