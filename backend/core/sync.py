from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from models.models import Business, Category, Governorate

async def update_business_counts(db: AsyncSession, category_id: int = None, governorate_id: int = None):
    """Recalculate counts for specific category/governorate"""
    if category_id:
        count_q = select(func.count(Business.id)).where(
            Business.category_id == category_id,
            Business.status == "active"
        )
        count = (await db.execute(count_q)).scalar() or 0
        await db.execute(
            update(Category).where(Category.id == category_id).values(business_count=count)
        )
        
    if governorate_id:
        count_q = select(func.count(Business.id)).where(
            Business.governorate_id == governorate_id,
            Business.status == "active"
        )
        count = (await db.execute(count_q)).scalar() or 0
        await db.execute(
            update(Governorate).where(Governorate.id == governorate_id).values(business_count=count)
        )
