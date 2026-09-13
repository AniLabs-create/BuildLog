"""GitHub data sync: repositories -> Projects, public events -> ExternalActivity.

Deduplication rules:
- Projects are matched by (user_id, external_provider='github', external_id=repo id),
  so re-syncing never creates duplicates.
- External activities are matched by the unique (user_id, source, external_id)
  constraint; existing ids are fetched first and skipped.
"""
from datetime import datetime

from sqlalchemy.orm import Session

from app.integrations.github import client
from app.models.integration import GitHubIntegration
from app.models.project import Project
from app.models.external_activity import ExternalActivity
from app.utils.slug import generate_unique_slug


def sync_repositories(db: Session, integration: GitHubIntegration) -> dict:
    """Sync the user's own GitHub repos into BuildLog Projects."""
    token = client.decrypt_token(integration)
    repos = client.list_owned_repositories(token, integration.github_username)

    created = 0
    updated = 0
    total_stars = 0

    for repo in repos:
        total_stars += repo.get("stargazers_count", 0)
        external_id = str(repo["id"])

        project = (
            db.query(Project)
            .filter(
                Project.user_id == integration.user_id,
                Project.external_provider == "github",
                Project.external_id == external_id,
            )
            .first()
        )

        # Real GitHub data -> BuildLog fields (no invented values)
        tech_stack: list[str] = []
        if repo.get("language"):
            tech_stack.append(repo["language"])
        for topic in repo.get("topics") or []:
            if topic not in tech_stack:
                tech_stack.append(topic)

        if project is None:
            project = Project(
                user_id=integration.user_id,
                name=repo["name"],
                slug=generate_unique_slug(repo["name"], db),
                description=repo.get("description") or "Imported from GitHub.",
                # Derived from real signals only: archived -> Abandoned
                status="Abandoned" if repo.get("archived") else "Building",
                visibility="private" if repo.get("private") else "public",
                source="github",
                external_provider="github",
                external_id=external_id,
            )
            created += 1
        elif repo.get("archived"):
            project.status = "Abandoned"
        updated += 1

        project.description = repo.get("description") or project.description
        project.github_url = repo.get("html_url")
        project.tech_stack = tech_stack
        project.stars = repo.get("stargazers_count", 0)
        project.forks = repo.get("forks_count", 0)
        project.last_synced_at = datetime.utcnow()

    integration.last_synced_at = datetime.utcnow()
    integration.stats_cache = {
        "repositories": len(repos),
        "stars": total_stars,
    }
    db.commit()
    return {"repositories": len(repos), "created": created, "updated": updated}


def sync_activity(db: Session, integration: GitHubIntegration) -> int:
    """Sync the user's public GitHub events into ExternalActivity."""
    events = client.list_public_events(integration.github_username)

    existing_ids = {
        row[0]
        for row in db.query(ExternalActivity.external_id)
        .filter(
            ExternalActivity.user_id == integration.user_id,
            ExternalActivity.source == "github",
        )
        .all()
    }

    new_count = 0
    for event in events:
        external_id = str(event.get("id"))
        if not external_id or external_id in existing_ids:
            continue

        event_type = event.get("type", "")
        repo_name = (event.get("repo") or {}).get("name", "")
        payload = event.get("payload") or {}

        # Map event types to short human-readable titles (real data only)
        if event_type == "PushEvent":
            size = payload.get("size", len(payload.get("commits") or []))
            title = f"Pushed {size} commit{'s' if size != 1 else ''} to {repo_name}"
            activity_type = "push"
        elif event_type == "WatchEvent":
            title = f"Starred {repo_name}"
            activity_type = "star"
        elif event_type == "CreateEvent":
            ref_type = payload.get("ref_type", "repository")
            title = f"Created {ref_type} {payload.get('ref') or repo_name}"
            activity_type = "create"
        elif event_type == "ReleaseEvent":
            release = payload.get("release") or {}
            title = f"Released {release.get('tag_name', '')} in {repo_name}".strip()
            activity_type = "release"
        elif event_type == "PullRequestEvent":
            action = payload.get("action", "updated")
            pr = payload.get("pull_request") or {}
            title = f"{action.capitalize()} pull request in {repo_name}"
            activity_type = "pull_request"
        elif event_type == "IssuesEvent":
            action = payload.get("action", "updated")
            title = f"{action.capitalize()} issue in {repo_name}"
            activity_type = "issue"
        else:
            continue  # skip exotic events rather than inventing descriptions

        occurred_at = event.get("created_at")
        parsed_at = (
            datetime.strptime(occurred_at, "%Y-%m-%dT%H:%M:%SZ")
            if occurred_at else datetime.utcnow()
        )

        db.add(ExternalActivity(
            user_id=integration.user_id,
            source="github",
            type=activity_type,
            external_id=external_id,
            repository=repo_name or None,
            title=title,
            url=(event.get("repo") or {}).get("html_url"),
            occurred_at=parsed_at,
            payload=None,
        ))
        existing_ids.add(external_id)
        new_count += 1

    db.commit()
    return new_count
