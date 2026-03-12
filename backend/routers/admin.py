from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from supabase import create_client
from core.database import get_db
from core.config import settings
from core.auth import create_access_token, require_admin
from models.models import Business, Category, Governorate, Review, BusinessStatus
from models.schemas import AdminLogin, TokenOut, DashboardStats

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/login", response_model=TokenOut)
async def admin_login(data: AdminLogin):
    try:
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        res = client.auth.sign_in_with_password({"email": data.email, "password": data.password})
        user = res.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        # Check admin role from metadata
        role = user.user_metadata.get("role", "user")
        if role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        token = create_access_token({"sub": str(user.id), "email": user.email, "role": "admin"})
        return TokenOut(access_token=token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")

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
