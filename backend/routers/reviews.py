from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from core.database import get_db
from core.auth import require_admin, get_current_user
from models.models import Review, Business
from models.schemas import ReviewOut, ReviewCreate

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.get("/me", response_model=List[ReviewOut])
async def get_my_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Get business IDs owned by the user
    businesses_q = select(Business.id).where(Business.owner_id == current_user["sub"])
    business_ids = (await db.execute(businesses_q)).scalars().all()
    
    if not business_ids:
        return []

    # Get reviews for those businesses
    reviews_q = select(Review).where(Review.business_id.in_(business_ids)).order_by(Review.created_at.desc())
    result = await db.execute(reviews_q)
    return result.scalars().all()

@router.get("/{business_id}", response_model=List[ReviewOut])
async def get_reviews(business_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review).where(Review.business_id == business_id, Review.is_approved == True)
        .order_by(Review.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=ReviewOut, status_code=201)
async def create_review(data: ReviewCreate, db: AsyncSession = Depends(get_db)):
    review_data = data.model_dump()
    review_data["is_approved"] = True
    review = Review(**review_data)
    db.add(review)
    await db.commit()
    await db.refresh(review)
    
    # Recalculate business stats
    from sqlalchemy import func
    stats_q = select(
        func.count(Review.id).label("count"),
        func.avg(Review.rating).label("avg")
    ).where(Review.business_id == review.business_id, Review.is_approved == True)
    
    stats_res = await db.execute(stats_q)
    stats = stats_res.mappings().one()
    
    # Update business
    business_q = select(Business).where(Business.id == review.business_id)
    business_res = await db.execute(business_q)
    business = business_res.scalar_one()
    
    business.rating_count = stats["count"]
    business.rating_avg = stats["avg"] or 0
    
    await db.commit()
    
    return review

@router.patch("/admin/{review_id}/approve", response_model=ReviewOut)
async def approve_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = True
    await db.commit()
    
    # Recalculate business stats
    from sqlalchemy import func
    stats_q = select(
        func.count(Review.id).label("count"),
        func.avg(Review.rating).label("avg")
    ).where(Review.business_id == review.business_id, Review.is_approved == True)
    stats = (await db.execute(stats_q)).mappings().one()
    
    business_q = select(Business).where(Business.id == review.business_id)
    business = (await db.execute(business_q)).scalar_one()
    business.rating_count = stats["count"]
    business.rating_avg = stats["avg"] or 0
    await db.commit()
    
    return review

@router.delete("/admin/{review_id}", status_code=204)
async def delete_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    business_id = review.business_id
    await db.delete(review)
    await db.commit()
    
    # Recalculate business stats
    from sqlalchemy import func
    stats_q = select(
        func.count(Review.id).label("count"),
        func.avg(Review.rating).label("avg")
    ).where(Review.business_id == business_id, Review.is_approved == True)
    stats = (await db.execute(stats_q)).mappings().one()
    
    business_q = select(Business).where(Business.id == business_id)
    business = (await db.execute(business_q)).scalar_one()
    business.rating_count = stats["count"]
    business.rating_avg = stats["avg"] or 0
    await db.commit()
