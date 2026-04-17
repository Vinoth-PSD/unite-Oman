from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc, asc
from sqlalchemy.orm import selectinload
from typing import Optional, List
import uuid
from uuid import UUID
from slugify import slugify
import asyncio

from core.database import get_db
from core.auth import get_current_user, require_admin
from core.cache import ttl_cache
from models.models import Business, Category, Governorate, BusinessStatus, ListingType, Service
from models.schemas import (
    BusinessCard, BusinessDetail, BusinessCreate,
    BusinessUpdate, AdminBusinessUpdate, PaginatedBusinesses, VendorStats, SearchSuggestion
)
from core.sync import update_business_counts
from sqlalchemy import text

router = APIRouter(prefix="/api/businesses", tags=["businesses"])

def load_relations(q, include_owner=False):
    opts = [
        selectinload(Business.category),
        selectinload(Business.governorate)
    ]
    if include_owner:
        opts.append(selectinload(Business.owner))
    return q.options(*opts)

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
    has_deal: Optional[bool] = None,
    sort: str = Query("featured", enum=["featured", "rating", "newest", "name"]),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=48),
):
    query = select(Business).where(Business.status == BusinessStatus.active)

    if has_deal is not None:
        query = query.where(Business.has_deal == has_deal)

    if q:
        query = query.where(
            or_(
                Business.name_en.ilike(f"%{q}%"),
                Business.name_ar.ilike(f"%{q}%"),
                Business.description.ilike(f"%{q}%"),
                Business.short_description.ilike(f"%{q}%"),
            )
        )
    p_id = None
    c_ids = []
    if category:
        # Include subcategories
        cat_res = await db.execute(select(Category.id).where(Category.slug == category))
        p_id = cat_res.scalar()
        if p_id:
            sub_res = await db.execute(select(Category.id).where(Category.parent_id == p_id))
            c_ids = [p_id] + list(sub_res.scalars().all())
            query = query.where(Business.category_id.in_(c_ids))
        else:
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

    # Count using distinct Business IDs to avoid duplicates from joins
    count_q = select(func.count(Business.id.distinct())).where(Business.status == BusinessStatus.active)

    if has_deal is not None:
        count_q = count_q.where(Business.has_deal == has_deal)
    if q:
        count_q = count_q.where(
            or_(
                Business.name_en.ilike(f"%{q}%"),
                Business.name_ar.ilike(f"%{q}%"),
                Business.description.ilike(f"%{q}%"),
                Business.short_description.ilike(f"%{q}%"),
            )
        )
    if category:
        if p_id:
            count_q = count_q.where(Business.category_id.in_(c_ids))
        else:
            count_q = count_q.join(Category, Business.category_id == Category.id).where(Category.slug == category)
    if governorate:
        count_q = count_q.join(Governorate, Business.governorate_id == Governorate.id).where(Governorate.slug == governorate)
    if plan:
        count_q = count_q.where(Business.plan == plan)
    if listing_type:
        count_q = count_q.where(Business.listing_type == listing_type)
    if featured is not None:
        count_q = count_q.where(Business.is_featured == featured)
    if verified is not None:
        count_q = count_q.where(Business.is_verified == verified)

    # Fetch total count
    total = (await db.execute(count_q)).scalar()

    # Now add sorts
    if sort == "featured":
        query = query.order_by(desc(Business.is_featured), desc(Business.listing_type), desc(Business.rating_avg))
    elif sort == "rating":
        query = query.order_by(desc(Business.rating_avg))
    elif sort == "newest":
        query = query.order_by(desc(Business.created_at))
    elif sort == "name":
        query = query.order_by(asc(Business.name_en))

    # Safely attach the eager-loading relations query AFTER the count
    query = load_relations(query, include_owner=True)

    # Paginate and fetch ONLY the visible subset
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
    cache_key = f"featured:{limit}"
    cached = ttl_cache.get(cache_key)
    if cached is not None:
        return cached

    q = select(Business).where(
        and_(Business.status == BusinessStatus.active, Business.is_featured == True)
    ).order_by(desc(Business.listing_type), desc(Business.rating_avg)).limit(limit)
    q = load_relations(q, include_owner=True)
    result = await db.execute(q)
    businesses = result.scalars().all()

    # Cache for 5 minutes — featured list rarely changes
    ttl_cache.set(cache_key, businesses, ttl=300)
    return businesses

# ── Auth: Get own businesses ──────────────────────────────────
@router.get("/me", response_model=List[BusinessCard])
async def get_my_businesses(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    q = select(Business).where(Business.owner_id == current_user["sub"])
    q = load_relations(q, include_owner=True)
    result = await db.execute(q)
    return result.scalars().all()

@router.get("/me/stats", response_model=VendorStats)
async def get_my_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    owner_id = current_user["sub"]
    # Single query for all business-level aggregates
    agg_q = select(
        func.coalesce(func.sum(Business.rating_count), 0).label("total_reviews"),
        func.coalesce(func.sum(Business.view_count), 0).label("total_views"),
        func.coalesce(
            func.sum(Business.rating_avg * Business.rating_count) /
            func.nullif(func.sum(Business.rating_count), 0),
            0.0
        ).label("avg_rating"),
    ).where(Business.owner_id == owner_id)

    # Single query for service count across all owned businesses
    svc_q = (
        select(func.count(Service.id))
        .join(Business, Service.business_id == Business.id)
        .where(Business.owner_id == owner_id)
    )

    agg_res, svc_res = await asyncio.gather(
        db.execute(agg_q),
        db.execute(svc_q),
    )
    row = agg_res.one()
    total_services = svc_res.scalar() or 0

    return VendorStats(
        total_reviews=int(row.total_reviews),
        avg_rating=round(float(row.avg_rating or 0), 2),
        total_services=total_services,
        total_views=int(row.total_views),
    )

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
    
    cat_id = business.category_id
    gov_id = business.governorate_id
    is_active = business.status == BusinessStatus.active

    await db.delete(business)
    await db.commit()

    if is_active:
        await update_business_counts(db, category_id=cat_id, governorate_id=gov_id)
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
    base_q = select(Business)
    if status:
        base_q = base_q.where(Business.status == status)

    count_q = select(func.count(Business.id))
    if status:
        count_q = count_q.where(Business.status == status)

    offset = (page - 1) * per_page
    # Apply pagination first, then eager-load relations only on the page slice
    paged_q = load_relations(
        base_q.order_by(desc(Business.created_at)).offset(offset).limit(per_page),
        include_owner=True
    )

    total, result = await asyncio.gather(
        db.execute(count_q),
        db.execute(paged_q),
    )
    total = total.scalar()
    items = result.scalars().all()

    for item in items:
        if item.owner:
            item.owner_email = item.owner.email

    return PaginatedBusinesses(
        items=items,
        total=total, page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page
    )

@router.get("/autocomplete", response_model=List[SearchSuggestion])
async def autocomplete(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    # Search Categories
    cat_q = select(Category).where(
        or_(
            Category.name_en.ilike(f"%{q}%"),
            Category.name_ar.ilike(f"%{q}%")
        )
    ).limit(5)
    cat_res = await db.execute(cat_q)
    categories = cat_res.scalars().all()

    # Search Businesses
    bus_q = select(Business).where(
        and_(
            Business.status == BusinessStatus.active,
            or_(
                Business.name_en.ilike(f"%{q}%"),
                Business.name_ar.ilike(f"%{q}%")
            )
        )
    ).options(
        selectinload(Business.category),
        selectinload(Business.governorate)
    ).limit(10)
    bus_res = await db.execute(bus_q)
    businesses = bus_res.scalars().all()

    suggestions = []
    
    for c in categories:
        suggestions.append({
            "id": str(c.id),
            "name": c.name_en,
            "type": "category",
            "slug": c.slug,
            "icon": c.icon,
            "rating": None,
            "category": None,
            "governorate": None,
            "is_verified": None,
            "logo_url": None
        })
        
    for b in businesses:
        suggestions.append({
            "id": str(b.id),
            "name": b.name_en,
            "type": "business",
            "slug": b.slug,
            "icon": None,
            "rating": float(b.rating_avg) if b.rating_avg else None,
            "category": b.category.name_en if b.category else None,
            "governorate": b.governorate.name_en if b.governorate else None,
            "is_verified": b.is_verified,
            "logo_url": b.logo_url
        })
        
    return suggestions

# ── Public: Get by slug ───────────────────────────────────────
async def _increment_view_count(business_id: UUID, db: AsyncSession) -> None:
    """Fire-and-forget view count increment — does not block the response."""
    try:
        result = await db.execute(select(Business).where(Business.id == business_id))
        biz = result.scalar_one_or_none()
        if biz:
            biz.view_count = (biz.view_count or 0) + 1
            await db.commit()
    except Exception:
        pass  # Never crash the main request over a view counter


@router.get("/{slug}", response_model=BusinessDetail)
async def get_business(
    slug: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    q = select(Business).where(
        and_(Business.slug == slug, Business.status == BusinessStatus.active)
    ).options(
        selectinload(Business.category),
        selectinload(Business.governorate),
        selectinload(Business.reviews),
        selectinload(Business.services),
        selectinload(Business.owner)
    )
    result = await db.execute(q)
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    # Increment view count in background — response is returned immediately
    background_tasks.add_task(_increment_view_count, business.id, db)
    return business

# ── Auth: Create business ─────────────────────────────────────
@router.post("", response_model=BusinessCard, status_code=201)
async def create_business(
    data: BusinessCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    slug = slugify(data.name_en.strip())
    # Ensure unique slug
    existing = await db.execute(select(Business).where(Business.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:8]}"

    business = Business(**data.model_dump(), slug=slug, owner_id=current_user["sub"])
    db.add(business)
    await db.commit()
    
    # Update counts if active
    if business.status == BusinessStatus.active:
        await update_business_counts(db, category_id=business.category_id, governorate_id=business.governorate_id)
        await db.commit()

    # Reload with relations for the response model
    q = select(Business).where(Business.id == business.id)
    q = load_relations(q)
    result = await db.execute(q)
    return result.scalar_one()


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

    # Store old values for count updates
    old_cat = business.category_id
    old_gov = business.governorate_id
    old_status = business.status

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(business, k, v)

    try:
        await db.commit()

        # Update counts if status or relations changed
        if business.status == BusinessStatus.active or old_status == BusinessStatus.active:
            await update_business_counts(db, category_id=old_cat, governorate_id=old_gov)
            if business.category_id != old_cat or business.governorate_id != old_gov:
                await update_business_counts(db, category_id=business.category_id, governorate_id=business.governorate_id)
            await db.commit()

        # Reload with relations
        q = select(Business).where(Business.id == business_id)
        q = load_relations(q, include_owner=True)
        result = await db.execute(q)
        return result.scalar_one()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/admin/{business_id}", response_model=BusinessCard)
async def admin_update_business(
    business_id: UUID,
    data: AdminBusinessUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    result = await db.execute(
        select(Business).where(Business.id == business_id).options(selectinload(Business.owner))
    )
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Not found")
    
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(business, k, v)
    
    # User activation logic
    if business.status == BusinessStatus.active and business.owner:
        business.owner.is_active = True
        
    await db.commit()
    
    # Update counts after status change
    await update_business_counts(db, category_id=business.category_id, governorate_id=business.governorate_id)
    await db.commit()
    
    # Reload with relations for the response model
    q = select(Business).where(Business.id == business.id)
    q = load_relations(q, include_owner=True)
    result = await db.execute(q)
    return result.scalar_one()
