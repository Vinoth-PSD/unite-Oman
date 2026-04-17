from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import List, Optional
from core.database import get_db
from core.cache import ttl_cache
from models.models import Category, Governorate
from models.schemas import CategoryOut, GovernorateOut

router = APIRouter(tags=["catalog"])

# ── Categories ────────────────────────────────────────────────
@router.get("/api/categories", response_model=List[CategoryOut])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    is_featured: bool = False,
    parent_id: Optional[int] = None,
    parent_slug: Optional[str] = None
):
    # Cache key encodes all filter params
    cache_key = f"categories:{is_featured}:{parent_id}:{parent_slug}"
    cached = ttl_cache.get(cache_key)
    if cached is not None:
        return cached

    q = select(Category).order_by(Category.sort_order)

    if is_featured:
        q = q.where(Category.is_featured == True)

    if parent_id is not None:
        if parent_id == 0:
            q = q.where(Category.parent_id == None)
        else:
            q = q.where(Category.parent_id == parent_id)
    elif parent_slug is not None:
        parent_res = await db.execute(select(Category.id).where(Category.slug == parent_slug))
        p_id = parent_res.scalar_one_or_none()
        if p_id:
            q = q.where(Category.parent_id == p_id)
        else:
            q = q.where(Category.id == -1)

    result = await db.execute(q)
    cats = result.scalars().all()

    if not cats:
        return []

    # Active business counts per category (single SQL query)
    counts_res = await db.execute(text(
        "SELECT category_id, COUNT(*) FROM businesses WHERE status = 'active' GROUP BY category_id"
    ))
    live_counts = {row[0]: row[1] for row in counts_res.fetchall()}

    # Parent map for aggregate counts (single SQL query)
    all_cats_res = await db.execute(select(Category.id, Category.parent_id))
    parent_map = {row[0]: row[1] for row in all_cats_res.fetchall()}

    child_parent_ids = {pid for pid in parent_map.values() if pid is not None}

    # Roll child counts up to parents
    final_counts = {}
    for cat_id, count in live_counts.items():
        final_counts[cat_id] = final_counts.get(cat_id, 0) + count
        pid = parent_map.get(cat_id)
        if pid:
            final_counts[pid] = final_counts.get(pid, 0) + count

    out = []
    for cat in cats:
        d = CategoryOut.model_validate(cat)
        d.has_children = cat.id in child_parent_ids
        d.business_count = final_counts.get(cat.id, 0)
        out.append(d)

    # Cache for 5 minutes — categories change rarely
    ttl_cache.set(cache_key, out, ttl=300)
    return out

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
    cached = ttl_cache.get("governorates")
    if cached is not None:
        return cached

    result = await db.execute(select(Governorate).order_by(Governorate.id))
    govs = result.scalars().all()

    if not govs:
        return []

    counts_res = await db.execute(text(
        "SELECT governorate_id, COUNT(*) FROM businesses WHERE status = 'active' GROUP BY governorate_id"
    ))
    live_counts = {row[0]: row[1] for row in counts_res.fetchall()}

    out = []
    for g in govs:
        d = GovernorateOut.model_validate(g)
        d.business_count = live_counts.get(g.id, 0)
        out.append(d)

    # Cache for 10 minutes — governorates almost never change
    ttl_cache.set("governorates", out, ttl=600)
    return out

@router.get("/api/governorates/{slug}", response_model=GovernorateOut)
async def get_governorate(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Governorate).where(Governorate.slug == slug))
    gov = result.scalar_one_or_none()
    if not gov:
        raise HTTPException(status_code=404, detail="Governorate not found")
    return gov

# ── Temporary Migration Endpoint ──────────────────────────────
@router.get("/api/catalog/migrate-v3")
async def run_migration_v3(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id)"))
        await db.commit()
        return {"status": "success", "message": "parent_id added to categories"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/api/catalog/fix-nulls")
async def fix_null_fields(db: AsyncSession = Depends(get_db)):
    """One-time fix: activate all pending businesses and fill NULL numeric columns."""
    try:
        r1 = await db.execute(text("UPDATE businesses SET view_count = 0 WHERE view_count IS NULL"))
        r2 = await db.execute(text("UPDATE businesses SET rating_count = 0 WHERE rating_count IS NULL"))
        r3 = await db.execute(text("UPDATE businesses SET rating_avg = 0 WHERE rating_avg IS NULL"))
        r4 = await db.execute(text("UPDATE businesses SET status = 'active' WHERE status = 'pending'"))
        # Add performance indexes
        await db.execute(text("CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug)"))
        await db.execute(text("CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status)"))
        await db.execute(text("CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id)"))
        await db.execute(text("CREATE INDEX IF NOT EXISTS idx_businesses_governorate ON businesses(governorate_id)"))
        await db.execute(text("CREATE INDEX IF NOT EXISTS idx_businesses_status_cat ON businesses(status, category_id)"))
        await db.commit()
        return {
            "view_count_fixed": r1.rowcount,
            "rating_count_fixed": r2.rowcount,
            "rating_avg_fixed": r3.rowcount,
            "businesses_activated": r4.rowcount,
            "indexes": "created"
        }
    except Exception as e:
        await db.rollback()
        return {"status": "error", "message": str(e)}

@router.get("/api/catalog/populate-images")
async def populate_images(db: AsyncSession = Depends(get_db)):
    try:
        import random
        from models.models import Business

        # Fetch all businesses
        result = await db.execute(text("SELECT id, name_en, category_id, slug FROM businesses WHERE cover_image_url IS NULL OR cover_image_url = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=600&fit=crop'"))
        businesses = result.all()

        images = [
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1414235077428-338988a2e8c0?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop",
        ]

        logo_images = [
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&h=200&fit=crop",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop",
            "https://images.unsplash.com/photo-1484723091791-c0e7e147c407?w=200&h=200&fit=crop",
        ]

        count = 0
        for b in businesses:
            cover = random.choice(images)
            prof = random.choice(logo_images)
            gall1 = random.choice(images)
            gall2 = random.choice(images)
            
            # Special logic for Madeena
            if "madeena" in b.name_en.lower():
                cover = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop"
                prof = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop"
                
            await db.execute(
                text("UPDATE businesses SET cover_image_url = :cover, logo_url = :prof, gallery_urls = :gall WHERE id = :bid"),
                {"cover": cover, "prof": prof, "bid": b.id, "gall": [gall1, gall2]}
            )
            count += 1
            
        await db.commit()
        return {"status": "success", "businesses_updated": count}
    except Exception as e:
        await db.rollback()
        return {"status": "error", "message": str(e)}
