from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from core.database import get_db
from core.auth import require_admin
from models.models import Review
from models.schemas import ReviewOut, ReviewCreate

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.get("/{business_id}", response_model=List[ReviewOut])
async def get_reviews(business_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review).where(Review.business_id == business_id, Review.is_approved == True)
        .order_by(Review.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=ReviewOut, status_code=201)
async def create_review(data: ReviewCreate, db: AsyncSession = Depends(get_db)):
    review = Review(**data.model_dump())
    db.add(review)
    await db.commit()
    await db.refresh(review)
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
    await db.delete(review)
    await db.commit()
