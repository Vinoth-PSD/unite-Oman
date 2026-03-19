from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from core.database import get_db
from core.auth import require_admin
from models.models import ContactMessage
from models.schemas import ContactMessageCreate, ContactMessageOut
from typing import List
from uuid import UUID

router = APIRouter(prefix="/api/contact", tags=["contact"])

@router.post("", response_model=ContactMessageOut)
async def create_message(data: ContactMessageCreate, db: AsyncSession = Depends(get_db)):
    msg = ContactMessage(**data.model_dump())
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

@router.get("/admin/messages", response_model=List[ContactMessageOut])
async def list_messages(
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(ContactMessage).order_by(ContactMessage.created_at.desc()))
    return result.scalars().all()

@router.patch("/admin/messages/{message_id}/read", response_model=ContactMessageOut)
async def mark_as_read(
    message_id: UUID, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    await db.commit()
    await db.refresh(msg)
    return msg

@router.delete("/admin/messages/{message_id}", status_code=204)
async def delete_message(
    message_id: UUID, 
    db: AsyncSession = Depends(get_db), 
    _: dict = Depends(require_admin)
):
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    await db.delete(msg)
    await db.commit()
