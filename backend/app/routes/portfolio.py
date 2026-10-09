"""Portfolio API routes: CRUD, BuildLog import, versioning, publishing,
public rendering, and AI Portfolio Agent interactions.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.portfolio import Portfolio, PortfolioVersion
from app.schemas.portfolio import (
    PortfolioCreateRequest,
    PortfolioUpdateRequest,
    PortfolioResponse,
    PortfolioSummaryResponse,
    PortfolioVersionResponse,
    PublicPortfolioResponse,
)
from app.utils.dependencies import get_current_user, get_optional_current_user
from app.utils.slug import slugify
from app.services.portfolio_intelligence import build_portfolio_from_buildlog
from app.services.entitlements import check_can_use_ai
from app.services.ai_portfolio_agent import (
    process_portfolio_ai_request,
    apply_action_to_portfolio,
    VALID_TEMPLATE_IDS,
)

router = APIRouter(prefix="/portfolios", tags=["portfolios"])
public_portfolio_router = APIRouter(prefix="/p", tags=["public_portfolios"])


def _generate_portfolio_slug(db: Session, user_id: int, base_name: str, exclude_id: Optional[int] = None) -> str:
    """Generate a clean slug unique among this user's portfolios."""
    base = slugify(base_name) or "portfolio"
    candidate = base
    counter = 2

    while True:
        q = db.query(Portfolio).filter(Portfolio.user_id == user_id, Portfolio.slug == candidate)
        if exclude_id is not None:
            q = q.filter(Portfolio.id != exclude_id)
        if q.first() is None:
            return candidate
        candidate = f"{base}-{counter}"
        counter += 1


def _save_portfolio_snapshot(db: Session, portfolio: Portfolio, message: str = "Saved snapshot") -> PortfolioVersion:
    """Creates a new historical snapshot version for the portfolio."""
    latest_v = (
        db.query(PortfolioVersion.version_num)
        .filter(PortfolioVersion.portfolio_id == portfolio.id)
        .order_by(PortfolioVersion.version_num.desc())
        .first()
    )
    next_num = (latest_v[0] + 1) if latest_v else 1

    snapshot_data = {
        "title": portfolio.title,
        "slug": portfolio.slug,
        "status": portfolio.status,
        "template_id": portfolio.template_id,
        "profile_data": portfolio.profile_data,
        "hero_data": portfolio.hero_data,
        "about_data": portfolio.about_data,
        "skills_data": portfolio.skills_data,
        "experience_data": portfolio.experience_data,
        "education_data": portfolio.education_data,
        "projects_data": portfolio.projects_data,
        "achievements_data": portfolio.achievements_data,
        "social_links": portfolio.social_links,
        "contact_data": portfolio.contact_data,
        "theme_data": portfolio.theme_data,
    }

    version = PortfolioVersion(
        portfolio_id=portfolio.id,
        version_num=next_num,
        message=message,
        snapshot=snapshot_data,
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version


# ---------- 1. List user portfolios ----------
@router.get("", response_model=List[PortfolioSummaryResponse])
def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all portfolios owned by the current user."""
    portfolios = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == current_user.id)
        .order_by(Portfolio.updated_at.desc())
        .all()
    )

    summaries = []
    for p in portfolios:
        projects_cnt = len(p.projects_data) if isinstance(p.projects_data, list) else 0
        skills_cnt = len(p.skills_data) if isinstance(p.skills_data, list) else 0
        summaries.append(PortfolioSummaryResponse(
            id=p.id,
            user_id=p.user_id,
            title=p.title,
            slug=p.slug,
            status=p.status,
            template_id=p.template_id,
            project_count=projects_cnt,
            skills_count=skills_cnt,
            published_at=p.published_at,
            created_at=p.created_at,
            updated_at=p.updated_at,
        ))
    return summaries


# ---------- 2. Import from BuildLog helper ----------
@router.post("/import-buildlog", response_model=Dict[str, Any])
def import_buildlog_data(
    template_id: str = "minimal",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Intelligently generates a complete starter portfolio structure from the user's
    existing BuildLog account, projects, build logs, and connected platforms.
    """
    if template_id not in VALID_TEMPLATE_IDS:
        template_id = "minimal"
    return build_portfolio_from_buildlog(current_user, db, template_id=template_id)


# ---------- 3. Create portfolio ----------
@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    req: PortfolioCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new portfolio."""
    tpl = req.template_id if req.template_id in VALID_TEMPLATE_IDS else "minimal"
    
    # Use provided initial_data or generate intelligent starter data from BuildLog
    if req.initial_data:
        data = req.initial_data
    else:
        data = build_portfolio_from_buildlog(current_user, db, template_id=tpl)

    generated_slug = _generate_portfolio_slug(
        db, current_user.id, req.slug or req.title or f"{current_user.username}-portfolio"
    )

    portfolio = Portfolio(
        user_id=current_user.id,
        title=req.title.strip(),
        slug=generated_slug,
        status="draft",
        template_id=tpl,
        profile_data=data.get("profile", {}),
        hero_data=data.get("hero", {}),
        about_data=data.get("about", {}),
        skills_data=data.get("skills", []),
        experience_data=data.get("experience", []),
        education_data=data.get("education", []),
        projects_data=data.get("projects", []),
        achievements_data=data.get("achievements", []),
        social_links=data.get("social_links", {}),
        contact_data=data.get("contact", {}),
        theme_data=data.get("theme", {"template_id": tpl}),
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)

    # Initial version snapshot
    _save_portfolio_snapshot(db, portfolio, message="Initial creation from BuildLog")

    return PortfolioResponse.model_validate(portfolio)


# ---------- 4. Get portfolio by ID ----------
@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get complete portfolio details for the owner."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")
    if portfolio.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You do not have permission to access this portfolio.")

    return PortfolioResponse.model_validate(portfolio)


# ---------- 5. Update portfolio ----------
@router.put("/{portfolio_id}", response_model=PortfolioResponse)
def update_portfolio(
    portfolio_id: int,
    req: PortfolioUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update portfolio sections, theme, metadata, and optionally snapshot a version."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")
    if portfolio.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You do not have permission to modify this portfolio.")

    if req.title is not None:
        portfolio.title = req.title.strip()
    if req.slug is not None and req.slug.strip() and req.slug.strip() != portfolio.slug:
        portfolio.slug = _generate_portfolio_slug(db, current_user.id, req.slug.strip(), exclude_id=portfolio.id)
    if req.status is not None:
        portfolio.status = req.status
        if req.status == "published" and not portfolio.published_at:
            portfolio.published_at = datetime.utcnow()
    if req.template_id is not None and req.template_id in VALID_TEMPLATE_IDS:
        portfolio.template_id = req.template_id

    # JSON sections
    if req.profile_data is not None:
        portfolio.profile_data = req.profile_data
    if req.hero_data is not None:
        portfolio.hero_data = req.hero_data
    if req.about_data is not None:
        portfolio.about_data = req.about_data
    if req.skills_data is not None:
        portfolio.skills_data = req.skills_data
    if req.experience_data is not None:
        portfolio.experience_data = req.experience_data
    if req.education_data is not None:
        portfolio.education_data = req.education_data
    if req.projects_data is not None:
        portfolio.projects_data = req.projects_data
    if req.achievements_data is not None:
        portfolio.achievements_data = req.achievements_data
    if req.social_links is not None:
        portfolio.social_links = req.social_links
    if req.contact_data is not None:
        portfolio.contact_data = req.contact_data
    if req.theme_data is not None:
        portfolio.theme_data = req.theme_data

    portfolio.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(portfolio)

    if req.save_version:
        _save_portfolio_snapshot(db, portfolio, message=req.version_message or "Manual save")

    return PortfolioResponse.model_validate(portfolio)


# ---------- 6. Delete portfolio ----------
@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete portfolio and all its versions."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")
    if portfolio.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this portfolio.")

    db.delete(portfolio)
    db.commit()
    return None


# ---------- 7. Toggle publish status ----------
@router.post("/{portfolio_id}/publish", response_model=PortfolioResponse)
def toggle_publish(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle between published and draft states."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")
    if portfolio.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You do not have permission to publish this portfolio.")

    if portfolio.status == "published":
        portfolio.status = "draft"
    else:
        portfolio.status = "published"
        portfolio.published_at = datetime.utcnow()
        _save_portfolio_snapshot(db, portfolio, message="Published live portfolio")

    portfolio.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(portfolio)
    return PortfolioResponse.model_validate(portfolio)


# ---------- 8. Version history ----------
@router.get("/{portfolio_id}/versions", response_model=List[PortfolioVersionResponse])
def list_versions(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List historical version snapshots for this portfolio."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio or portfolio.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")

    versions = (
        db.query(PortfolioVersion)
        .filter(PortfolioVersion.portfolio_id == portfolio_id)
        .order_by(PortfolioVersion.version_num.desc())
        .all()
    )
    return [PortfolioVersionResponse.model_validate(v) for v in versions]


@router.post("/{portfolio_id}/versions/{version_id}/restore", response_model=PortfolioResponse)
def restore_version(
    portfolio_id: int,
    version_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Restore a previous version snapshot to the live portfolio."""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio or portfolio.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")

    version = (
        db.query(PortfolioVersion)
        .filter(PortfolioVersion.id == version_id, PortfolioVersion.portfolio_id == portfolio_id)
        .first()
    )
    if not version:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Version snapshot not found.")

    snap = version.snapshot
    portfolio.title = snap.get("title", portfolio.title)
    portfolio.template_id = snap.get("template_id", portfolio.template_id)
    portfolio.profile_data = snap.get("profile_data", {})
    portfolio.hero_data = snap.get("hero_data", {})
    portfolio.about_data = snap.get("about_data", {})
    portfolio.skills_data = snap.get("skills_data", [])
    portfolio.experience_data = snap.get("experience_data", [])
    portfolio.education_data = snap.get("education_data", [])
    portfolio.projects_data = snap.get("projects_data", [])
    portfolio.achievements_data = snap.get("achievements_data", [])
    portfolio.social_links = snap.get("social_links", {})
    portfolio.contact_data = snap.get("contact_data", {})
    portfolio.theme_data = snap.get("theme_data", {})
    portfolio.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(portfolio)

    _save_portfolio_snapshot(db, portfolio, message=f"Restored from version #{version.version_num}")
    return PortfolioResponse.model_validate(portfolio)


# ---------- 9. AI Portfolio Agent Chat & Actions ----------
class AIChatPayload(BaseModel):
    prompt: str

class AIApplyPayload(BaseModel):
    action: Dict[str, Any]

@router.post("/{portfolio_id}/ai/chat")
async def ai_portfolio_chat(
    portfolio_id: int,
    req: AIChatPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AI Portfolio Agent Assistant endpoint.
    Protected behind Pro entitlement check.
    Returns proposed structured actions and conversational explanations.
    """
    if not check_can_use_ai(current_user.id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Portfolio AI is a Pro feature. Upgrade or activate the Demo Pro entitlement.",
        )

    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio or portfolio.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")

    current_snapshot = {
        "title": portfolio.title,
        "template_id": portfolio.template_id,
        "profile_data": portfolio.profile_data,
        "hero_data": portfolio.hero_data,
        "about_data": portfolio.about_data,
        "skills_data": portfolio.skills_data,
        "projects_data": portfolio.projects_data,
        "theme_data": portfolio.theme_data,
    }

    actions, message = await process_portfolio_ai_request(req.prompt, current_snapshot)
    return {
        "message": message,
        "actions": actions,
        "can_apply": len(actions) > 0,
    }


@router.post("/{portfolio_id}/ai/apply", response_model=PortfolioResponse)
def ai_portfolio_apply(
    portfolio_id: int,
    req: AIApplyPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Applies a validated AI structured action to the portfolio and records a snapshot version.
    """
    if not check_can_use_ai(current_user.id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Portfolio AI is a Pro feature.",
        )

    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio or portfolio.user_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")

    current_data = {
        "title": portfolio.title,
        "template_id": portfolio.template_id,
        "profile_data": portfolio.profile_data,
        "hero_data": portfolio.hero_data,
        "about_data": portfolio.about_data,
        "skills_data": portfolio.skills_data,
        "experience_data": portfolio.experience_data,
        "education_data": portfolio.education_data,
        "projects_data": portfolio.projects_data,
        "achievements_data": portfolio.achievements_data,
        "social_links": portfolio.social_links,
        "contact_data": portfolio.contact_data,
        "theme_data": portfolio.theme_data,
    }

    updated_data, msg = apply_action_to_portfolio(current_data, req.action)

    # Persist changes
    portfolio.template_id = updated_data.get("template_id", portfolio.template_id)
    portfolio.profile_data = updated_data.get("profile_data", portfolio.profile_data)
    portfolio.hero_data = updated_data.get("hero_data", portfolio.hero_data)
    portfolio.about_data = updated_data.get("about_data", portfolio.about_data)
    portfolio.skills_data = updated_data.get("skills_data", portfolio.skills_data)
    portfolio.experience_data = updated_data.get("experience_data", portfolio.experience_data)
    portfolio.education_data = updated_data.get("education_data", portfolio.education_data)
    portfolio.projects_data = updated_data.get("projects_data", portfolio.projects_data)
    portfolio.achievements_data = updated_data.get("achievements_data", portfolio.achievements_data)
    portfolio.social_links = updated_data.get("social_links", portfolio.social_links)
    portfolio.contact_data = updated_data.get("contact_data", portfolio.contact_data)
    portfolio.theme_data = updated_data.get("theme_data", portfolio.theme_data)
    portfolio.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(portfolio)

    _save_portfolio_snapshot(db, portfolio, message=f"AI: {msg}")
    return PortfolioResponse.model_validate(portfolio)


# ---------- 10. Public Portfolio Viewing ----------
@public_portfolio_router.get("/{username}/{portfolio_slug}", response_model=PublicPortfolioResponse)
def get_public_portfolio(
    username: str,
    portfolio_slug: str,
    viewer: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Public live portfolio view at /p/:username/:portfolioSlug.
    Open to the public when published.
    Owner can view their own draft/preview.
    """
    author = db.query(User).filter(User.username == username).first()
    if not author:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Developer not found.")

    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == author.id, Portfolio.slug == portfolio_slug)
        .first()
    )
    if not portfolio:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")

    is_owner = viewer and viewer.id == author.id
    if portfolio.status != "published" and not is_owner:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="This portfolio is not published yet.")

    return PublicPortfolioResponse(
        portfolio=PortfolioResponse.model_validate(portfolio),
        owner={
            "username": author.username,
            "display_name": author.display_name,
            "avatar_url": author.avatar_url,
            "bio": author.bio,
            "github_url": author.github_url,
            "college": author.college,
            "branch": author.branch,
        }
    )
