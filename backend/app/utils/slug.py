import re
from typing import Optional

from sqlalchemy.orm import Session

from app.models.project import Project


def slugify(text: str) -> str:
    """
    Convert an arbitrary project name into a URL-safe slug.

    "Smart Shortlist AI!" -> "smart-shortlist-ai"

    Keeps only lowercase letters, numbers, and single hyphens so the slug
    is safe to use in URLs like /u/nizam/smart-shortlist-ai.
    """
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    # Keep slugs short enough for URLs and database column limits
    return slug[:100] or "project"


def generate_unique_slug(
    name: str,
    db: Session,
    exclude_project_id: Optional[int] = None,
) -> str:
    """
    Generate a URL slug for a project name, guaranteeing it is not already
    taken by another project. If "smart-shortlist" exists, the next project
    with the same name becomes "smart-shortlist-2", then "-3", and so on.
    """
    base_slug = slugify(name)
    candidate = base_slug
    counter = 2

    while True:
        query = db.query(Project).filter(Project.slug == candidate)
        if exclude_project_id is not None:
            query = query.filter(Project.id != exclude_project_id)

        if query.first() is None:
            return candidate

        candidate = f"{base_slug}-{counter}"
        counter += 1
