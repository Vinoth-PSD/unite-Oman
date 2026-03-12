from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from core.database import get_db
from models.models import Category, Governorate
from models.schemas import CategoryOut, GovernorateOut

router = APIRouter(tags=["catalog"])

# ── Categories ────────────────────────────────────────────────
@router.get("/api/categories", response_model=List[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db), featured_only: bool = False):
    q = select(Category).order_by(Category.sort_order)
    if featured_only:
        q = q.where(Category.is_featured == True)
    result = await db.execute(q)
    return result.scalars().all()

@router.get("/api/categories/{slug}", response_model=CategoryOut)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.slug == slug))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat

# ── Governorates ──────────────────────────────────────────────
@router.get("/api/governorates", response_model=List[GovernorateOut])
async def list_governorates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Governorate).order_by(Governorate.id))
    return result.scalars().all()

@router.get("/api/governorates/{slug}", response_model=GovernorateOut)
async def get_governorate(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Governorate).where(Governorate.slug == slug))
    gov = result.scalar_one_or_none()
    if not gov:
        raise HTTPException(status_code=404, detail="Governorate not found")
    return gov
