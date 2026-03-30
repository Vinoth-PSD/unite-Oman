import asyncio
from core.database import AsyncSessionLocal
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.models import Business, Category, Governorate
from models.schemas import BusinessCard

async def test():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Business).options(selectinload(Business.category), selectinload(Business.governorate)))
        for b in res.scalars():
            try:
                BusinessCard.model_validate(b)
            except Exception as e:
                print(f"Error on business {b.id}: {e}")
                return

if __name__ == "__main__":
    asyncio.run(test())
