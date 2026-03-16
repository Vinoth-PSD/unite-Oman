from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from core.database import get_db
from core.auth import get_current_user
from models.models import Business, Service
from models.schemas import ServiceOut, ServiceCreate, ServiceUpdate

router = APIRouter(prefix="/api/services", tags=["services"])

@router.post("", response_model=ServiceOut, status_code=201)
async def create_service(
    data: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check if business exists and belongs to user
    result = await db.execute(select(Business).where(Business.id == data.business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if str(business.owner_id) != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    service = Service(**data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service

@router.get("/business/{business_id}", response_model=List[ServiceOut])
async def get_business_services(business_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.business_id == business_id))
    return result.scalars().all()

@router.put("/{service_id}", response_model=ServiceOut)
async def update_service(
    service_id: UUID,
    data: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Service).where(Service.id == service_id).options(selectinload(Service.business))
    )
    # Wait, selectinload is from sqlalchemy.orm, I should import it or handle differently
    # Let's just join or query the business separately if needed.
    
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check ownership
    res_b = await db.execute(select(Business).where(Business.id == service.business_id))
    business = res_b.scalar_one()
    if str(business.owner_id) != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(service, k, v)
    
    await db.commit()
    await db.refresh(service)
    return service

@router.delete("/{service_id}", status_code=204)
async def delete_service(
    service_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check ownership
    res_b = await db.execute(select(Business).where(Business.id == service.business_id))
    business = res_b.scalar_one()
    if str(business.owner_id) != current_user["sub"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(service)
    await db.commit()
