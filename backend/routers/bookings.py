from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from models.models import Booking, Business, User, BookingStatus
from models.schemas import BookingCreate, BookingOut, BookingUpdateStatus
from core.auth import get_current_user
from typing import List
from core.mail import send_booking_confirmation, send_booking_rejection
import uuid

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("/", response_model=BookingOut)
async def create_booking(payload: BookingCreate, db: AsyncSession = Depends(get_db)):
    # Verify business exists
    business = await db.get(Business, payload.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    new_booking = Booking(**payload.model_dump())
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    return new_booking

@router.get("/vendor/me", response_model=List[BookingOut])
async def get_vendor_bookings(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get all businesses owned by this vendor
    user_id = uuid.UUID(current_user["sub"])
    stmt = select(Business.id).where(Business.owner_id == user_id)
    result = await db.execute(stmt)
    business_ids = result.scalars().all()
    
    # Get bookings for these businesses, joining Business to get the name
    stmt = select(Booking, Business.name_en).join(Business, Booking.business_id == Business.id).where(Booking.business_id.in_(business_ids)).order_by(Booking.created_at.desc())
    result = await db.execute(stmt)
    
    bookings_out = []
    for booking, business_name in result.all():
        # We manually construct the response to include business_name
        b_dict = {
            "id": booking.id,
            "business_id": booking.business_id,
            "name": booking.name,
            "email": booking.email,
            "phone": booking.phone,
            "service": booking.service,
            "date": booking.date,
            "time": booking.time,
            "status": booking.status,
            "created_at": booking.created_at,
            "business_name": business_name
        }
        bookings_out.append(b_dict)
        
    return bookings_out

@router.patch("/{booking_id}/status", response_model=BookingOut)
async def update_booking_status(
    booking_id: uuid.UUID,
    payload: BookingUpdateStatus,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify ownership by joining with Business owner_id
    user_id = uuid.UUID(current_user["sub"])
    stmt = (
        select(Booking, Business.name_en)
        .join(Business, Booking.business_id == Business.id)
        .where(
            Booking.id == booking_id,
            Business.owner_id == user_id
        )
    )
    result = await db.execute(stmt)
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found or not authorized")
    
    booking, business_name = row
    booking.status = payload.status
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

    return {
        "id": booking.id,
        "business_id": booking.business_id,
        "name": booking.name,
        "email": booking.email,
        "phone": booking.phone,
        "service": booking.service,
        "date": booking.date,
        "time": booking.time,
        "status": booking.status,
        "created_at": booking.created_at,
        "business_name": business_name
    }
