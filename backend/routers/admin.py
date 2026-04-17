import asyncio
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from core.auth import create_access_token, require_admin, verify_password
from core.database import get_db
from core.config import settings
from models.models import Business, Category, Governorate, Review, BusinessStatus, User, Service, Admin
from models.schemas import AdminLogin, TokenOut, DashboardStats, VendorStats, BusinessCard, CategoryOut, CategoryCreate, CategoryUpdate
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
    # All business counts in a single query using conditional aggregation
    biz_q = select(
        func.count(Business.id).label("total"),
        func.count(Business.id).filter(Business.status == BusinessStatus.active).label("active"),
        func.count(Business.id).filter(Business.status == BusinessStatus.pending).label("pending"),
        func.count(Business.id).filter(Business.is_featured == True).label("featured"),
    )
    # Remaining counts run in parallel
    biz_res, reviews_res, cats_res, govs_res = await asyncio.gather(
        db.execute(biz_q),
        db.execute(select(func.count(Review.id))),
        db.execute(select(func.count(Category.id))),
        db.execute(select(func.count(Governorate.id))),
    )
    row = biz_res.one()
    return DashboardStats(
        total_businesses=row.total,
        active_businesses=row.active,
        pending_businesses=row.pending,
        featured_businesses=row.featured,
        total_reviews=reviews_res.scalar(),
        total_categories=cats_res.scalar(),
        total_governorates=govs_res.scalar(),
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

@router.patch("/vendors/{user_id}/status", response_model=dict)
async def toggle_vendor_status(
    user_id: UUID, 
    payload: dict, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    """Toggle a vendor's active status."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    current = user.is_active
    user.is_active = payload.get("is_active", not current)
    await db.commit()
    return {"status": "success", "is_active": user.is_active}

@router.get("/vendors/{vendor_id}/stats", response_model=VendorStats)
async def get_vendor_stats(
    vendor_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    agg_q = select(
        func.coalesce(func.sum(Business.rating_count), 0).label("total_reviews"),
        func.coalesce(func.sum(Business.view_count), 0).label("total_views"),
        func.coalesce(
            func.sum(Business.rating_avg * Business.rating_count) /
            func.nullif(func.sum(Business.rating_count), 0),
            0.0
        ).label("avg_rating"),
    ).where(Business.owner_id == vendor_id)

    svc_q = (
        select(func.count(Service.id))
        .join(Business, Service.business_id == Business.id)
        .where(Business.owner_id == vendor_id)
    )

    agg_res, svc_res = await asyncio.gather(
        db.execute(agg_q),
        db.execute(svc_q),
    )
    row = agg_res.one()
    return VendorStats(
        total_reviews=int(row.total_reviews),
        avg_rating=round(float(row.avg_rating or 0), 2),
        total_services=svc_res.scalar() or 0,
        total_views=int(row.total_views),
    )

@router.get("/vendors/{vendor_id}/businesses", response_model=List[BusinessCard])
async def get_vendor_businesses(
    vendor_id: UUID, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    q = select(Business).where(Business.owner_id == vendor_id).options(
        selectinload(Business.category),
        selectinload(Business.governorate),
        selectinload(Business.owner)
    )
    result = await db.execute(q)
    items = result.scalars().all()
    for item in items:
        if item.owner:
            item.owner_email = item.owner.email
    return items

# ── Categories ──────────────────────────────────────────────
@router.post("/categories", response_model=CategoryOut)
async def create_category(
    data: CategoryCreate, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    cat = Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat

@router.put("/categories/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: int, 
    data: CategoryUpdate, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, key, value)
    
    await db.commit()
    await db.refresh(cat)
    return cat

@router.delete("/categories/{category_id}", status_code=204)
async def delete_category(
    category_id: int, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(cat)
    await db.commit()

# ── Vendor Control (Advanced) ──────────────────────────────
@router.get("/vendor-control", response_model=List[BusinessCard])
async def get_all_businesses_for_control(
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    """Returns all businesses for the Vendor Control panel."""
    q = select(Business).options(
        selectinload(Business.category),
        selectinload(Business.governorate),
        selectinload(Business.owner)
    ).order_by(Business.category_id)
    result = await db.execute(q)
    items = result.scalars().all()
    
    # Map owner email to owner_email field for frontend display
    for item in items:
        if item.owner:
            item.owner_email = item.owner.email
            
    return items

@router.get("/bookings/{business_id}", response_model=List[dict])
async def get_admin_business_bookings(
    business_id: UUID, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    """Admin view of bookings for a specific shop."""
    from models.models import Booking
    stmt = (
        select(Booking, Business.name_en)
        .join(Business, Booking.business_id == Business.id)
        .where(Booking.business_id == business_id)
        .order_by(Booking.created_at.desc())
    )
    result = await db.execute(stmt)
    
    out = []
    for booking, biz_name in result.all():
        out.append({
            "id": str(booking.id),
            "business_id": str(booking.business_id),
            "business_name": biz_name,
            "name": booking.name,
            "email": booking.email,
            "phone": booking.phone,
            "service": booking.service,
            "date": booking.date,
            "time": booking.time,
            "status": booking.status,
            "created_at": booking.created_at
        })
    return out

@router.patch("/bookings/{booking_id}/status", response_model=dict)
async def update_admin_booking_status(
    booking_id: UUID,
    payload: dict, # {status: str}
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Admin update of booking status with email notifications."""
    from models.models import Booking
    from core.mail import send_booking_confirmation, send_booking_rejection
    
    stmt = (
        select(Booking, Business.name_en)
        .join(Business, Booking.business_id == Business.id)
        .where(Booking.id == booking_id)
    )
    result = await db.execute(stmt)
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking, business_name = row
    booking.status = payload.get("status")
    await db.commit()
    await db.refresh(booking)

    # Send relevant email notifications
    if booking.status == "confirmed":
        background_tasks.add_task(
            send_booking_confirmation,
            email=booking.email,
            name=booking.name,
            business_name=business_name,
            date=booking.date,
            time=booking.time,
            service=booking.service
        )
    elif booking.status == "cancelled":
        background_tasks.add_task(
            send_booking_rejection,
            email=booking.email,
            name=booking.name,
            business_name=business_name,
            date=booking.date,
            time=booking.time,
            service=booking.service
        )

    return {"status": "success", "new_status": booking.status}

@router.get("/services/{business_id}", response_model=List[dict])
async def get_admin_business_services(
    business_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(Service).where(Service.business_id == business_id))
    services = result.scalars().all()
    return [
        {"id": str(s.id), "name": s.name, "description": s.description, "price": s.price, "business_id": str(s.business_id)} 
        for s in services
    ]

@router.post("/services", response_model=dict)
async def admin_create_service(
    data: dict,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    new_s = Service(**data)
    db.add(new_s)
    await db.commit()
    await db.refresh(new_s)
    return {"id": str(new_s.id), "name": new_s.name}

@router.delete("/services/{service_id}", status_code=204)
async def admin_delete_service(
    service_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    s = await db.get(Service, service_id)
    if not s:
        raise HTTPException(status_code=404, detail="Service not found")
    await db.delete(s)
    await db.commit()
