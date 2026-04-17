from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from sqlalchemy.orm import selectinload
from typing import List
import httpx
import json

from core.database import get_db
from core.config import settings
from models.models import Business, BusinessStatus

router = APIRouter(prefix="/api/ai-search", tags=["ai-search"])


@router.get("")
async def ai_search(
    q: str = Query(..., min_length=1, max_length=500),
    db: AsyncSession = Depends(get_db),
):
    # Fetch relevant businesses using keyword search on name + description
    words = [w for w in q.strip().split() if len(w) > 2][:6]

    conditions = [
        Business.name_en.ilike(f"%{q}%"),
        Business.description.ilike(f"%{q}%"),
        Business.short_description.ilike(f"%{q}%"),
    ]
    for word in words:
        conditions += [
            Business.name_en.ilike(f"%{word}%"),
            Business.description.ilike(f"%{word}%"),
        ]

    query = (
        select(Business)
        .where(Business.status == BusinessStatus.active)
        .where(or_(*conditions))
        .options(selectinload(Business.category), selectinload(Business.governorate))
        .order_by(desc(Business.rating_avg))
        .limit(15)
    )
    result = await db.execute(query)
    businesses = result.scalars().all()

    # Format businesses list for Claude
    if businesses:
        biz_list = "\n".join(
            f"- {b.name_en} | "
            f"Category: {b.category.name_en if b.category else 'N/A'} | "
            f"Location: {b.governorate.name_en if b.governorate else 'N/A'} | "
            f"Rating: {b.rating_avg or 'N/A'} ({b.rating_count or 0} reviews) | "
            f"Verified: {b.is_verified}"
            for b in businesses
        )
    else:
        biz_list = "No matching businesses found."

    prompt = f"""You are a helpful assistant for UniteOman, Oman's business directory.
User is looking for: "{q}"

Available businesses:
{biz_list}

Reply with valid JSON only — no markdown, no extra text:
{{
  "message": "A friendly 1-2 sentence summary of what you found for the user.",
  "picks": [
    {{"name": "Exact business name from list", "reason": "One short sentence why it fits"}},
    {{"name": "Exact business name from list", "reason": "One short sentence why it fits"}},
    {{"name": "Exact business name from list", "reason": "One short sentence why it fits"}}
  ]
}}
Pick the top 3 most relevant businesses. Use exact names from the list."""

    ai_result = None
    if settings.ANTHROPIC_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": settings.ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-haiku-4-5-20251001",
                        "max_tokens": 600,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                )
                data = resp.json()
                text = data.get("content", [{}])[0].get("text", "")
                ai_result = json.loads(text)
        except Exception:
            pass  # Fall through to fallback

    # Fallback: build a basic result without Claude
    if not ai_result:
        ai_result = {
            "message": f"Found {len(businesses)} businesses matching your search. Here are the top results.",
            "picks": [
                {"name": b.name_en, "reason": f"Rated {b.rating_avg or 'N/A'} · {b.category.name_en if b.category else 'N/A'} in {b.governorate.name_en if b.governorate else 'Oman'}"}
                for b in businesses[:3]
            ],
        }

    # Map AI picks back to full business data
    biz_map = {b.name_en: b for b in businesses}
    result_businesses = []
    seen = set()

    for pick in ai_result.get("picks", []):
        match = biz_map.get(pick["name"])
        if match and match.id not in seen:
            seen.add(match.id)
            result_businesses.append({
                "id": str(match.id),
                "name": match.name_en,
                "slug": match.slug,
                "category": match.category.name_en if match.category else None,
                "governorate": match.governorate.name_en if match.governorate else None,
                "rating": float(match.rating_avg) if match.rating_avg else None,
                "rating_count": match.rating_count or 0,
                "is_verified": match.is_verified,
                "logo_url": match.logo_url,
                "reason": pick.get("reason", ""),
            })

    # If AI names didn't match exactly, fall back to top results
    if not result_businesses and businesses:
        for b in businesses[:3]:
            result_businesses.append({
                "id": str(b.id),
                "name": b.name_en,
                "slug": b.slug,
                "category": b.category.name_en if b.category else None,
                "governorate": b.governorate.name_en if b.governorate else None,
                "rating": float(b.rating_avg) if b.rating_avg else None,
                "rating_count": b.rating_count or 0,
                "is_verified": b.is_verified,
                "logo_url": b.logo_url,
                "reason": "Top rated match for your search",
            })

    return {
        "message": ai_result.get("message", "Here are the best matches for your request."),
        "businesses": result_businesses,
        "total_found": len(businesses),
        "query": q,
    }


@router.post("/pick")
async def ai_pick(payload: dict):
    """Given a list of businesses from the frontend, return the single best pick."""
    businesses: List[dict] = payload.get("businesses", [])
    if not businesses:
        raise HTTPException(status_code=400, detail="No businesses provided")

    biz_list = "\n".join(
        f"- {b.get('name_en', b.get('name', 'Unknown'))}: "
        f"rating {b.get('rating_avg', 'N/A')}, "
        f"{b.get('rating_count', 0)} reviews, "
        f"plan: {b.get('plan', 'N/A')}, "
        f"verified: {b.get('is_verified', False)}"
        for b in businesses[:5]
    )

    if not settings.ANTHROPIC_API_KEY:
        top = businesses[0]
        return {"recommendation": f"**{top.get('name_en', top.get('name', 'Top Pick'))}** — highest rated business in this list."}

    prompt = (
        "You are a helpful Oman business directory assistant. "
        "Based on these businesses, recommend the single best pick and explain why in 2–3 sentences. "
        "Be direct and helpful.\n\n"
        f"Businesses:\n{biz_list}\n\n"
        'Give your top pick and a brief reason. Format: "**[Business Name]** — [reason]"'
    )

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 300,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            data = resp.json()
            text = data.get("content", [{}])[0].get("text", "")
            return {"recommendation": text}
    except Exception:
        top = businesses[0]
        return {"recommendation": f"**{top.get('name_en', top.get('name', 'Top Pick'))}** — top rated business in this list."}
