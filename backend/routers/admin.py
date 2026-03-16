from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from core.auth import create_access_token, require_admin, verify_password
from core.database import get_db
from core.config import settings
from models.models import Business, Category, Governorate, Review, BusinessStatus, User, Service, Admin
from models.schemas import AdminLogin, TokenOut, DashboardStats, VendorStats, BusinessCard
from sqlalchemy.orm import selectinload
from uuid import UUID

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/login", response_model=TokenOut)
async def admin_login(data: AdminLogin, db: AsyncSession = Depends(get_db)):
    email = data.email.strip().lower()
    result = await db.execute(select(Admin).where(Admin.email == email))
    admin = result.scalar_one_or_none()
    
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
        
    token = create_access_token({
        "sub": str(admin.id),
        "email": admin.email,
        "role": "admin"
    })
    return TokenOut(access_token=token)

@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    total     = (await db.execute(select(func.count(Business.id)))).scalar()
    active    = (await db.execute(select(func.count(Business.id)).where(Business.status == BusinessStatus.active))).scalar()
    pending   = (await db.execute(select(func.count(Business.id)).where(Business.status == BusinessStatus.pending))).scalar()
    featured  = (await db.execute(select(func.count(Business.id)).where(Business.is_featured == True))).scalar()
    reviews   = (await db.execute(select(func.count(Review.id)))).scalar()
    cats      = (await db.execute(select(func.count(Category.id)))).scalar()
    govs      = (await db.execute(select(func.count(Governorate.id)))).scalar()
    return DashboardStats(
        total_businesses=total, active_businesses=active,
        pending_businesses=pending, total_reviews=reviews,
        total_categories=cats, total_governorates=govs,
        featured_businesses=featured
    )
@router.get("/vendors", response_model=List[dict])
async def list_vendors(db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    from models.models import User
    result = await db.execute(select(User).where(User.role == "vendor").order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [{"id": str(u.id), "email": u.email, "created_at": u.created_at} for u in users]

@router.delete("/vendors/{user_id}", status_code=204)
async def delete_vendor(user_id: str, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Vendor not found")
    await db.delete(user)
    await db.commit()

@router.get("/vendors/{vendor_id}/stats", response_model=VendorStats)
async def get_vendor_stats(
    vendor_id: UUID, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    # Reuse logic from businesses.py but for any vendor
    q = select(Business).where(Business.owner_id == vendor_id)
    result = await db.execute(q)
    businesses = result.scalars().all()
    
    if not businesses:
        return VendorStats(total_reviews=0, avg_rating=0.0, total_services=0, total_views=0)
    
    total_reviews = sum(b.rating_count for b in businesses if b.rating_count is not None)
    total_views = sum(b.view_count for b in businesses if b.view_count is not None)
    
    if total_reviews > 0:
        total_rating_sum = sum(float(b.rating_avg or 0) * (b.rating_count or 0) for b in businesses)
        avg_rating = total_rating_sum / total_reviews
    else:
        avg_rating = 0.0
        
    business_ids = [b.id for b in businesses]
    service_count_q = select(func.count(Service.id)).where(Service.business_id.in_(business_ids))
    total_services = (await db.execute(service_count_q)).scalar() or 0
    
    return VendorStats(
        total_reviews=total_reviews,
        avg_rating=round(avg_rating, 2),
        total_services=total_services,
        total_views=total_views
    )

@router.get("/vendors/{vendor_id}/businesses", response_model=List[BusinessCard])
async def get_vendor_businesses(
    vendor_id: UUID, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    q = select(Business).where(Business.owner_id == vendor_id).options(
        selectinload(Business.category),
        selectinload(Business.governorate)
    )
    result = await db.execute(q)
    return result.scalars().all()
