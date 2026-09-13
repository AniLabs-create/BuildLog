from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text

from app.database import Base


class GitHubIntegration(Base):
    """
    One row per BuildLog user who connected their GitHub account for
    INTEGRATION purposes (repo/activity sync, solution pushes).

    This is deliberately separate from users.github_id, which only records
    the login identity: this table additionally stores the scoped OAuth
    access token BuildLog needs to call the GitHub API on the user's behalf.

    Security:
    - access_token_encrypted holds the token encrypted at rest
      (app/utils/encryption.py). It is NEVER returned by any schema.
    """
    __tablename__ = "github_integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Stable identifiers and public profile info from GitHub
    github_user_id = Column(Integer, nullable=False, index=True)
    github_username = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)

    # The encrypted OAuth access token ("Connect GitHub" flow, repo scope)
    access_token_encrypted = Column(Text, nullable=False)
    # Space-separated scopes GitHub actually granted, e.g. "repo read:user"
    scopes = Column(String(500), nullable=True)

    connected_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_synced_at = Column(DateTime, nullable=True)

    # Snapshot of aggregate stats from the last repo sync (repository count,
    # total stars, ...) so profiles can show real numbers without live calls.
    stats_cache = Column(JSON, nullable=True)


class LeetCodeIntegration(Base):
    """
    One row per BuildLog user who connected a public LeetCode profile.

    LeetCode has no user-facing OAuth for this; the legitimate method is
    reading PUBLIC stats for a username the user provides. We therefore
    store only the username plus a cached snapshot of the last sync.
    """
    __tablename__ = "leetcode_integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    leetcode_username = Column(String(100), nullable=False)

    connected_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_synced_at = Column(DateTime, nullable=True)

    # Snapshot of the last successful public-profile sync (solved counts,
    # rating, etc.). JSON so the shape can grow without a migration.
    profile_cache = Column(JSON, nullable=True)
