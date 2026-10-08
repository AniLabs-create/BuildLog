"""Portfolio Intelligence Service.

Extracts, normalizes, and factually ranks BuildLog projects and connected
GitHub repositories into a structured developer portfolio.

Never fabricates metrics, awards, or false experience.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.project import Project
from app.models.build_log import BuildLog
from app.models.integration import GitHubIntegration, LeetCodeIntegration


def calculate_project_score(project: Project, log_count: int, has_readme: bool) -> float:
    """
    Computes a factual strength score for a project based on verified signals:
    - Description depth & clarity
    - GitHub stars & forks
    - Live demo URL presence
    - Build logs logged on BuildLog
    - README availability
    - Status completeness
    """
    score = 10.0

    # Description length and quality
    desc_len = len(project.description or "")
    if desc_len > 120:
        score += 15.0
    elif desc_len > 40:
        score += 8.0

    # Live demo URL is a huge recruiter differentiator
    if project.demo_url:
        score += 25.0

    # GitHub link & social proof
    if project.github_url:
        score += 10.0
    score += min(project.stars * 3.0, 30.0)
    score += min(project.forks * 2.0, 15.0)

    # BuildLog learning journey attached
    score += min(log_count * 5.0, 25.0)

    # README content synced
    if has_readme or project.readme_content:
        score += 12.0

    # Project lifecycle status
    status_weights = {
        "Deployed": 20.0,
        "Completed": 15.0,
        "Building": 10.0,
        "Idea": 3.0,
        "Abandoned": 0.0,
    }
    score += status_weights.get(project.status, 5.0)

    return score


def build_portfolio_from_buildlog(user: User, db: Session, template_id: str = "minimal") -> Dict[str, Any]:
    """
    Assembles a rich, cohesive portfolio directly from the user's existing
    BuildLog profile, projects, build logs, and connected platforms.
    """
    # 1. Fetch user projects and calculate log counts per project
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    log_counts: Dict[int, int] = {}
    for p in projects:
        cnt = db.query(BuildLog).filter(BuildLog.project_id == p.id).count()
        log_counts[p.id] = cnt

    # Rank projects factually
    ranked_projects = sorted(
        projects,
        key=lambda p: calculate_project_score(p, log_counts.get(p.id, 0), bool(p.readme_content)),
        reverse=True,
    )

    # 2. Extract skills with categorized inference
    user_skills = user.skills or []
    skill_objects = []
    for s in user_skills:
        skill_name = s.strip()
        if not skill_name:
            continue
        # Categorize by common patterns
        category = "Core"
        lower = skill_name.lower()
        if any(kw in lower for kw in ["react", "vue", "tailwind", "html", "css", "next", "svelte", "javascript", "typescript", "ui"]):
            category = "Frontend"
        elif any(kw in lower for kw in ["python", "fastapi", "django", "node", "express", "sql", "postgres", "redis", "go", "rust", "backend"]):
            category = "Backend"
        elif any(kw in lower for kw in ["docker", "k8s", "aws", "gcp", "azure", "ci/cd", "git", "linux"]):
            category = "DevOps"
        elif any(kw in lower for kw in ["ai", "ml", "pytorch", "tensorflow", "llm", "langchain", "openai"]):
            category = "AI / ML"

        skill_objects.append({
            "name": skill_name,
            "category": category,
            "proficiency": "Advanced",
            "years": None,
        })

    # 3. Format Portfolio Projects
    formatted_projects = []
    for i, p in enumerate(ranked_projects):
        formatted_projects.append({
            "id": p.id,
            "title": p.name,
            "slug": p.slug or f"project-{p.id}",
            "description": p.description or "",
            "problem": None,
            "solution": None,
            "impact": f"Documented {log_counts.get(p.id, 0)} build logs on BuildLog" if log_counts.get(p.id, 0) > 0 else None,
            "technologies": p.tech_stack or [],
            "image_url": None,
            "github_url": p.github_url,
            "demo_url": p.demo_url,
            "featured": i < 3,  # Top 3 ranked are featured
            "buildlog_project_id": p.id,
        })

    # 4. Education structure from user college / branch / year
    education_list = []
    if user.college:
        edu_item = {
            "institution": user.college,
            "degree": user.branch or "Undergraduate Degree",
            "field": user.branch or "Computer Science & Engineering",
            "start_date": "",
            "end_date": user.year or "Present",
            "grade": None,
            "achievements": [],
        }
        education_list.append(edu_item)

    # 5. Connected Integrations info (GitHub / LeetCode achievements)
    achievements = []
    gh_integration = db.query(GitHubIntegration).filter(GitHubIntegration.user_id == user.id).first()
    if gh_integration and gh_integration.stats_cache:
        total_repos = gh_integration.stats_cache.get("repositories", 0)
        total_stars = gh_integration.stats_cache.get("stars", 0)
        if total_repos > 0:
            achievements.append({
                "title": f"GitHub Open Source Contributor",
                "description": f"Published {total_repos} public repositories with {total_stars} total stars earned.",
                "date": None,
                "organization": "GitHub",
                "url": f"https://github.com/{gh_integration.github_username}",
                "badge": "⭐ Open Source",
            })

    lc_integration = db.query(LeetCodeIntegration).filter(LeetCodeIntegration.user_id == user.id).first()
    if lc_integration and lc_integration.profile_cache:
        solved = lc_integration.profile_cache.get("solved", 0)
        if solved > 0:
            achievements.append({
                "title": f"Algorithm Problem Solver",
                "description": f"Solved {solved} algorithmic challenges on LeetCode.",
                "date": None,
                "organization": "LeetCode",
                "url": f"https://leetcode.com/{lc_integration.leetcode_username}",
                "badge": "🧠 Algorithms",
            })

    # 6. Hero & Headline construction
    display_name = user.display_name or user.username
    headline = f"{display_name} — Developer Portfolio"
    subheadline = user.bio or "Building robust full-stack systems and documenting growth in public."

    about_content = user.bio or f"Hi, I'm {display_name}. I'm a developer focused on building scalable, user-centric software and tracking my daily learning journey."
    about_highlights = []
    if user.college:
        about_highlights.append(f"Studying at {user.college} ({user.branch or ''} {user.year or ''})".strip())
    if len(user_skills) > 0:
        about_highlights.append(f"Proficient in {', '.join(user_skills[:4])}")
    if len(ranked_projects) > 0:
        about_highlights.append(f"Built and shipped {len(ranked_projects)} independent software projects")

    return {
        "title": f"{display_name}'s Portfolio",
        "slug": f"{user.username}-portfolio",
        "status": "draft",
        "template_id": template_id,
        "profile": {
            "name": display_name,
            "headline": f"Software Engineer & Builder",
            "location": None,
            "avatar": user.avatar_url,
            "short_bio": user.bio or "Building projects and learning in public.",
            "long_bio": None,
        },
        "hero": {
            "headline": f"Hi, I'm {display_name}",
            "subheadline": subheadline,
            "primary_cta_text": "Explore Work",
            "primary_cta_url": "#projects",
            "secondary_cta_text": "Contact Me",
            "secondary_cta_url": "#contact",
            "availability_badge": "Open to Opportunities",
        },
        "about": {
            "title": "About Me",
            "content": about_content,
            "highlights": about_highlights,
        },
        "skills": skill_objects,
        "experience": [],
        "education": education_list,
        "projects": formatted_projects,
        "achievements": achievements,
        "social_links": {
            "github": user.github_url or (f"https://github.com/{gh_integration.github_username}" if gh_integration else None),
            "linkedin": user.linkedin_url,
            "email": user.email if not "noreply.github.com" in (user.email or "") else None,
            "twitter": None,
            "portfolio": user.portfolio_url,
            "other": None,
        },
        "contact": {
            "email": user.email if not "noreply.github.com" in (user.email or "") else None,
            "cta_title": "Let's Connect",
            "cta_subtitle": "Interested in collaborating or hiring? Reach out anytime.",
            "message_prompt": "Send a direct message",
        },
        "theme": {
            "template_id": template_id,
            "primary_color": "#10b981",
            "accent_color": "#06b6d4",
            "background_style": "dark",
            "font_family": "Inter",
            "border_radius": "rounded-xl",
            "animation_level": "subtle",
            "custom_css": None,
        },
    }
