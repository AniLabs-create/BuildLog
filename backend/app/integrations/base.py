"""Integration provider architecture.

Every external platform (GitHub, LeetCode, and future ones like GitLab or
Codeforces) implements the BaseIntegration interface and registers itself
in the registry. Routes and services then talk to integrations through the
registry — never by importing concrete classes directly — so adding a new
platform means adding one package and one register() call.

Interface contract:
- is_connected(db, user_id): whether the user has connected this provider
- disconnect(db, user_id): remove the connection (keep user content)
- sync(db, user_id): pull fresh external data; returns a summary dict
- status(db, user_id): connection metadata for the Settings UI
"""
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session


class BaseIntegration:
    """Abstract base class every integration provider must implement."""

    # Unique provider key used in URLs, e.g. "github" -> /api/integrations/github/...
    provider: str = "base"
    # Human-readable name for UI and error messages
    display_name: str = "Base"

    def is_connected(self, db: Session, user_id: int) -> bool:
        raise NotImplementedError

    def disconnect(self, db: Session, user_id: int) -> None:
        """Remove the connection. Must NOT delete synced user content."""
        raise NotImplementedError

    def sync(self, db: Session, user_id: int) -> Dict[str, Any]:
        """Pull fresh external data into BuildLog. Returns a sync summary."""
        raise NotImplementedError

    def status(self, db: Session, user_id: int) -> Optional[Dict[str, Any]]:
        """Connection info for the Settings UI, or None if not connected."""
        raise NotImplementedError


class IntegrationRegistry:
    """Maps provider keys -> integration instances."""

    def __init__(self) -> None:
        self._providers: Dict[str, BaseIntegration] = {}

    def register(self, integration: BaseIntegration) -> None:
        if integration.provider in self._providers:
            raise ValueError(f"Integration '{integration.provider}' already registered")
        self._providers[integration.provider] = integration

    def get(self, provider: str) -> BaseIntegration:
        if provider not in self._providers:
            raise KeyError(f"Unknown integration provider: {provider}")
        return self._providers[provider]

    def has(self, provider: str) -> bool:
        return provider in self._providers

    def names(self) -> list[str]:
        return list(self._providers.keys())


# Single registry instance shared by the whole application.
# Concrete providers register themselves in their own modules (Phases 2+).
registry = IntegrationRegistry()
