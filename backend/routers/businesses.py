from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc, asc
from sqlalchemy.orm import selectinload
from typing import Optional, List
from uuid import UUID
from slugify import slugify

from core.database import get_db
from core.auth import get_current_user, require_admin
from models.models import Business, Category, Governorate, BusinessStatus, ListingType
from models.schemas import (
    BusinessCard, BusinessDetail, BusinessCreate,
    BusinessUpdate, AdminBusinessUpdate, PaginatedBusinesses
)

router = APIRouter(prefix="/api/businesses", tags=["businesses"])

def load_relations(q):
    return q.options(
        selectinload(Business.category),
        selectinload(Business.governorate)
    )

# ── Public: List & Search ─────────────────────────────────────
@router.get("", response_model=PaginatedBusinesses)
async def list_businesses(
    db: AsyncSession = Depends(get_db),
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = None,
    governorate: Optional[str] = None,
    plan: Optional[str] = None,
    listing_type: Optional[str] = None,
    featured: Optional[bool] = None,
    verified: Optional[bool] = None,
    sort: str = Query("featured", enum=["featured", "rating", "newest", "name"]),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=48),
):
    query = select(Business).where(Business.status == BusinessStatus.active)
    query = load_relations(query)

    if q:
        query = query.where(
            or_(
                Business.name_en.ilike(f"%{q}%"),
                Business.name_ar.ilike(f"%{q}%"),
                Business.description.ilike(f"%{q}%"),
                Business.short_description.ilike(f"%{q}%"),
            )
        )
    if category:
        query = query.join(Category).where(Category.slug == category)
    if governorate:
        query = query.join(Governorate).where(Governorate.slug == governorate)
    if plan:
        query = query.where(Business.plan == plan)
    if listing_type:
        query = query.where(Business.listing_type == listing_type)
    if featured is not None:
        query = query.where(Business.is_featured == featured)
    if verified is not None:
        query = query.where(Business.is_verified == verified)

    # Sorting
    if sort == "featured":
        query = query.order_by(desc(Business.is_featured), desc(Business.listing_type), desc(Business.rating_avg))
    elif sort == "rating":
        query = query.order_by(desc(Business.rating_avg))
    elif sort == "newest":
        query = query.order_by(desc(Business.created_at))
    elif sort == "name":
        query = query.order_by(asc(Business.name_en))

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar()

    # Paginate
    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    businesses = result.scalars().all()

    return PaginatedBusinesses(
        items=businesses,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page
    )

# ── Public: Featured ─────────────────────────────────────────
@router.get("/featured", response_model=List[BusinessCard])
async def get_featured(db: AsyncSession = Depends(get_db), limit: int = 6):
    q = select(Business).where(
        and_(Business.status == BusinessStatus.active, Business.is_featured == True)
    ).order_by(desc(Business.listing_type), desc(Business.rating_avg)).limit(limit)
    q = load_relations(q)
    result = await db.execute(q)
    return result.scalars().all()

# ── Public: Get by slug ───────────────────────────────────────
@router.get("/{slug}", response_model=BusinessDetail)
async def get_business(slug: str, db: AsyncSession = Depends(get_db)):
    q = select(Business).where(
        and_(Business.slug == slug, Business.status == BusinessStatus.active)
    ).options(
        selectinload(Business.category),
        selectinload(Business.governorate),
        selectinload(Business.reviews)
    )
    result = await db.execute(q)
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    # Increment view count
    business.view_count += 1
    await db.commit()
    return business

# ── Auth: Create business ─────────────────────────────────────
@router.post("", response_model=BusinessCard, status_code=201)
async def create_business(
    data: BusinessCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    slug = slugify(data.name_en)
    # Ensure unique slug
    existing = await db.execute(select(Business).where(Business.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{str(UUID(int=0))[:8]}"

    business = Business(**data.model_dump(), slug=slug, owner_id=current_user["sub"])
    db.add(business)
    await db.commit()
    await db.refresh(business)
    return business

# ── Auth: Update own business ─────────────────────────────────
@router.patch("/{business_id}", response_model=BusinessCard)
async def update_business(
    business_id: UUID,
    data: BusinessUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Business).where(Business.id == business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Not found")
    if str(business.owner_id) != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(business, k, v)
    await db.commit()
    await db.refresh(business)
    return business

# ── Admin: Full update ────────────────────────────────────────
@router.patch("/admin/{business_id}", response_model=BusinessCard)
async def admin_update_business(
    business_id: UUID,
    data: AdminBusinessUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(Business).where(Business.id == business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(business, k, v)
    await db.commit()
    await db.refresh(business)
    return business

# ── Admin: Delete ─────────────────────────────────────────────
@router.delete("/admin/{business_id}", status_code=204)
async def delete_business(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(Business).where(Business.id == business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(business)
    await db.commit()

# ── Admin: All businesses (any status) ───────────────────────
@router.get("/admin/all", response_model=PaginatedBusinesses)
async def admin_list_all(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 20
):
    q = select(Business)
    q = load_relations(q)
    if status:
        q = q.where(Business.status == status)
    q = q.order_by(desc(Business.created_at))
    count_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(count_q)).scalar()
    offset = (page - 1) * per_page
    result = await db.execute(q.offset(offset).limit(per_page))
    return PaginatedBusinesses(
        items=result.scalars().all(),
        total=total, page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page
    )
