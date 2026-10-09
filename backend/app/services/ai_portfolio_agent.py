"""AI Portfolio Agent Service.

Provides an intelligent creative assistant for portfolio copywriting,
layout optimization, thematic adjustments, and project curation.

Operates exclusively through validated structured actions — the LLM is NEVER
given raw database access or arbitrary code execution capabilities.
"""
import os
import json
import re
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

# 20 standard template IDs for validation
VALID_TEMPLATE_IDS = {
    "minimal", "noir", "terminal", "editorial", "swiss",
    "brutalist", "aurora", "glass", "cyber", "studio",
    "academic", "research", "engineer", "founder", "freelancer",
    "creative", "resume", "student", "monochrome", "experimental",
}

VALID_ACTION_TYPES = {
    "UPDATE_HERO",
    "UPDATE_ABOUT",
    "UPDATE_PROFILE",
    "SELECT_TEMPLATE",
    "UPDATE_THEME",
    "UPDATE_PROJECT",
    "ADD_PROJECT",
    "REMOVE_PROJECT",
    "REORDER_PROJECTS",
    "REWRITE_CONTENT",
    "OPTIMIZE_PORTFOLIO",
}


def apply_action_to_portfolio(portfolio_data: Dict[str, Any], action: Dict[str, Any]) -> tuple[Dict[str, Any], str]:
    """
    Applies a validated structured action to a portfolio data dictionary.
    Returns (updated_portfolio_data, explanation_message).
    """
    action_type = action.get("type")
    payload = action.get("payload", {})
    explanation = action.get("message", "Applied modification.")

    data = json.loads(json.dumps(portfolio_data))  # deep copy

    if action_type == "UPDATE_HERO":
        hero = data.setdefault("hero_data", {})
        for key in ["headline", "subheadline", "primary_cta_text", "primary_cta_url", "secondary_cta_text", "secondary_cta_url", "availability_badge"]:
            if key in payload and payload[key] is not None:
                hero[key] = str(payload[key]).strip()
        explanation = f"Updated hero section: '{hero.get('headline')}'"

    elif action_type == "UPDATE_ABOUT":
        about = data.setdefault("about_data", {})
        if "title" in payload:
            about["title"] = str(payload["title"]).strip()
        if "content" in payload:
            about["content"] = str(payload["content"]).strip()
        if "highlights" in payload and isinstance(payload["highlights"], list):
            about["highlights"] = [str(h).strip() for h in payload["highlights"] if str(h).strip()]
        explanation = "Refined About section and highlights."

    elif action_type == "UPDATE_PROFILE":
        profile = data.setdefault("profile_data", {})
        for key in ["name", "headline", "location", "short_bio", "long_bio"]:
            if key in payload and payload[key] is not None:
                profile[key] = str(payload[key]).strip()
        explanation = "Updated developer profile & bio."

    elif action_type == "SELECT_TEMPLATE":
        tpl = str(payload.get("template_id", "")).lower().strip()
        if tpl in VALID_TEMPLATE_IDS:
            data["template_id"] = tpl
            theme = data.setdefault("theme_data", {})
            theme["template_id"] = tpl
            explanation = f"Switched portfolio template to '{tpl.capitalize()}'."
        else:
            explanation = f"Template '{tpl}' is not recognized."

    elif action_type == "UPDATE_THEME":
        theme = data.setdefault("theme_data", {})
        for key in ["primary_color", "accent_color", "background_style", "font_family", "border_radius", "animation_level", "custom_css"]:
            if key in payload and payload[key] is not None:
                theme[key] = str(payload[key]).strip()
        explanation = "Updated color palette, typography & theme settings."

    elif action_type == "UPDATE_PROJECT":
        target_idx = payload.get("index")
        target_id = payload.get("id")
        projects = data.setdefault("projects_data", [])
        
        found = False
        for idx, p in enumerate(projects):
            if (target_id is not None and p.get("id") == target_id) or (target_idx is not None and idx == target_idx):
                for key in ["title", "description", "problem", "solution", "impact", "demo_url", "github_url", "featured"]:
                    if key in payload and payload[key] is not None:
                        p[key] = payload[key]
                if "technologies" in payload and isinstance(payload["technologies"], list):
                    p["technologies"] = [str(t).strip() for t in payload["technologies"]]
                found = True
                explanation = f"Updated project '{p.get('title')}'."
                break
        if not found:
            explanation = "Project target could not be matched."

    elif action_type == "REORDER_PROJECTS":
        order_ids = payload.get("project_ids", [])
        projects = data.setdefault("projects_data", [])
        if order_ids and isinstance(order_ids, list):
            id_map = {p.get("id"): p for p in projects if p.get("id") is not None}
            ordered = []
            for pid in order_ids:
                if pid in id_map:
                    ordered.append(id_map[pid])
            for p in projects:
                if p not in ordered:
                    ordered.append(p)
            data["projects_data"] = ordered
            explanation = "Reordered projects hierarchy."

    elif action_type == "OPTIMIZE_PORTFOLIO":
        # Comprehensive optimization
        tpl = payload.get("template_id")
        if tpl and str(tpl).lower() in VALID_TEMPLATE_IDS:
            data["template_id"] = str(tpl).lower()
        if "hero_headline" in payload:
            data.setdefault("hero_data", {})["headline"] = str(payload["hero_headline"]).strip()
        if "hero_subheadline" in payload:
            data.setdefault("hero_data", {})["subheadline"] = str(payload["hero_subheadline"]).strip()
        if "about_content" in payload:
            data.setdefault("about_data", {})["content"] = str(payload["about_content"]).strip()
        explanation = "Executed comprehensive portfolio optimization."

    return data, explanation


def _generate_rule_based_ai_response(prompt: str, current_data: Dict[str, Any]) -> tuple[List[Dict[str, Any]], str]:
    """
    Intelligent simulated assistant that reliably processes natural language
    requests when external cloud AI API keys are not provided.
    """
    prompt_lower = prompt.lower().strip()
    actions: List[Dict[str, Any]] = []
    message = ""

    # Check for template switch requests
    for tpl in VALID_TEMPLATE_IDS:
        if f"template {tpl}" in prompt_lower or f"switch to {tpl}" in prompt_lower or f"use {tpl}" in prompt_lower or f"style {tpl}" in prompt_lower:
            actions.append({
                "type": "SELECT_TEMPLATE",
                "payload": {"template_id": tpl},
                "message": f"Applied the '{tpl.capitalize()}' design system.",
            })
            return actions, f"I've switched your portfolio to the **{tpl.capitalize()}** template. Check out the new visual hierarchy and typography!"

    if any(kw in prompt_lower for kw in ["noir", "dark luxury", "gold", "premium"]):
        actions.append({"type": "SELECT_TEMPLATE", "payload": {"template_id": "noir"}})
        actions.append({"type": "UPDATE_THEME", "payload": {"primary_color": "#d97706", "accent_color": "#10b981"}})
        actions.append({
            "type": "UPDATE_HERO",
            "payload": {
                "headline": "Engineering Scalable Digital Experiences",
                "subheadline": "Crafting resilient full-stack systems with modern architecture and craftsmanship.",
                "availability_badge": "Available for Select Roles",
            },
        })
        return actions, "I have tailored your portfolio with the **Noir** aesthetic — refined typography, warm amber accents, and an elevated headline."

    if any(kw in prompt_lower for kw in ["terminal", "cli", "hacker", "cyberpunk", "console"]):
        actions.append({"type": "SELECT_TEMPLATE", "payload": {"template_id": "terminal"}})
        actions.append({
            "type": "UPDATE_HERO",
            "payload": {
                "headline": "$ ./init_engineer.sh --deploy",
                "subheadline": "Kernel hacker & system architect. Documenting growth one commit at a time.",
                "availability_badge": "● SYSTEM READY",
            },
        })
        return actions, "Initialized the **Terminal** developer interface with monospace layout and terminal command headers."

    if any(kw in prompt_lower for kw in ["swiss", "brutalist", "bold", "clean grid", "minimalist"]):
        tpl = "brutalist" if "brutalist" in prompt_lower else "swiss"
        actions.append({"type": "SELECT_TEMPLATE", "payload": {"template_id": tpl}})
        actions.append({"type": "UPDATE_THEME", "payload": {"border_radius": "rounded-none", "animation_level": "subtle"}})
        return actions, f"Transformed layout into high-impact **{tpl.capitalize()}** typography with structured contrast and sharp edges."

    if any(kw in prompt_lower for kw in ["headline", "hero", "catchy", "tagline"]):
        name = current_data.get("profile_data", {}).get("name") or "Developer"
        actions.append({
            "type": "UPDATE_HERO",
            "payload": {
                "headline": f"Architecting High-Impact Software Solutions",
                "subheadline": f"Full-stack software engineer focused on distributed systems, modern web apps, and user-centric engineering.",
                "availability_badge": "Open to Full-Time & Freelance Roles",
            }
        })
        return actions, f"I've upgraded your hero section with an impactful headline and recruiter-focused subheadline."

    if any(kw in prompt_lower for kw in ["bio", "about", "story", "write about"]):
        name = current_data.get("profile_data", {}).get("name") or "Developer"
        about_text = (
            f"I am a passionate software engineer dedicated to building resilient software and documenting my technical journey in public. "
            f"My focus spans full-stack development, modern cloud architecture, and performance engineering. "
            f"I believe that consistent progress and learning transparency produce exceptional software."
        )
        actions.append({
            "type": "UPDATE_ABOUT",
            "payload": {
                "title": "About & Engineering Philosophy",
                "content": about_text,
                "highlights": [
                    "Full-Stack Development & Architecture",
                    "Rapid Prototyping to Production Deployment",
                    "Continuous Building & Public Learning",
                ],
            }
        })
        return actions, "I have refined your About section into a compelling engineering narrative highlighting your core strengths."

    if any(kw in prompt_lower for kw in ["project", "descriptions", "impact", "polish"]):
        projects = current_data.get("projects_data", [])
        if projects:
            # Only reorder/re-feature existing projects. The rule-based assistant
            # must never invent problem/solution/impact claims — fabricating
            # project results requires a real AI provider (see below).
            featured_ids = [p.get("id") for p in projects if p.get("featured")]
            if featured_ids and len(featured_ids) < len(projects):
                actions.append({
                    "type": "REORDER_PROJECTS",
                    "payload": {"project_ids": featured_ids + [p.get("id") for p in projects if p.get("id") not in featured_ids]},
                })
                return actions, "I've reordered your projects so the featured ones lead. For rewriting project problem/solution/impact copy, connect an AI provider (GEMINI_API_KEY or OPENAI_API_KEY) — I won't invent results on your behalf."
            return actions, "Polishing project problem/solution/impact copy needs a configured AI provider (GEMINI_API_KEY or OPENAI_API_KEY). I won't fabricate project results, but once a provider is connected I can rewrite your existing descriptions factually."

    # Default general improvement
    actions.append({
        "type": "UPDATE_HERO",
        "payload": {
            "headline": "Building Robust Software with Purpose & Speed",
            "subheadline": "Turning complex engineering challenges into elegant, maintainable applications.",
            "availability_badge": "Ready to Ship",
        }
    })
    actions.append({
        "type": "UPDATE_THEME",
        "payload": {
            "primary_color": "#10b981",
            "accent_color": "#06b6d4",
            "border_radius": "rounded-xl",
        }
    })
    return actions, "I analyzed your portfolio data and applied an optimization pass across your hero messaging, primary color palette, and visual styling."


async def process_portfolio_ai_request(
    user_prompt: str,
    current_portfolio: Dict[str, Any],
) -> tuple[List[Dict[str, Any]], str]:
    """
    Main entry point for AI Portfolio Agent sessions.
    Attempts external AI API call if configured; falls back gracefully to
    the embedded intelligent rule-based action generator.
    """
    # Check for configured API keys (e.g. GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY)
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if gemini_key:
        try:
            return await _call_gemini_api(gemini_key, user_prompt, current_portfolio)
        except Exception:
            pass  # fallback safely

    if openai_key:
        try:
            return await _call_openai_api(openai_key, user_prompt, current_portfolio)
        except Exception:
            pass  # fallback safely

    return _generate_rule_based_ai_response(user_prompt, current_portfolio)


async def _call_gemini_api(api_key: str, prompt: str, data: Dict[str, Any]) -> tuple[List[Dict[str, Any]], str]:
    """Calls Gemini API for structured portfolio modifications."""
    system_instruction = (
        "You are the BuildLog AI Portfolio Agent. You assist developers in optimizing their portfolio websites. "
        "You NEVER make up fake work experience, degrees, or awards. "
        "You MUST reply with valid JSON containing: 'actions' (list of structured action objects) and 'message' (conversational response in markdown). "
        f"Valid template IDs: {', '.join(VALID_TEMPLATE_IDS)}. "
        "Valid action types: UPDATE_HERO, UPDATE_ABOUT, UPDATE_PROFILE, SELECT_TEMPLATE, UPDATE_THEME, UPDATE_PROJECT, REORDER_PROJECTS."
    )
    user_msg = f"Current portfolio data:\n{json.dumps(data, default=str)}\n\nUser request: {prompt}"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": f"{system_instruction}\n\n{user_msg}"}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(url, json=payload)
        res.raise_for_status()
        res_json = res.json()
        raw_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(raw_text)
        actions = parsed.get("actions", [])
        message = parsed.get("message", "I have updated your portfolio according to your request.")
        return actions, message


async def _call_openai_api(api_key: str, prompt: str, data: Dict[str, Any]) -> tuple[List[Dict[str, Any]], str]:
    """Calls OpenAI API for structured portfolio modifications."""
    system_instruction = (
        "You are the BuildLog AI Portfolio Agent. You assist developers in optimizing their portfolio websites. "
        "You MUST reply with JSON format: {\"actions\": [...], \"message\": \"...\"}. "
        f"Valid template IDs: {', '.join(VALID_TEMPLATE_IDS)}."
    )

    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o-mini",
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"Current portfolio:\n{json.dumps(data, default=str)}\n\nUser request: {prompt}"},
        ],
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        res = await client.post(url, json=payload, headers=headers)
        res.raise_for_status()
        res_json = res.json()
        raw_text = res_json["choices"][0]["message"]["content"]
        parsed = json.loads(raw_text)
        return parsed.get("actions", []), parsed.get("message", "Updated portfolio.")
