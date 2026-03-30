
import asyncio
from core.database import engine, AsyncSessionLocal
from sqlalchemy import text, select
from models.models import Business
import random

async def migrate_and_seed():
    async with engine.begin() as conn:
        print("Checking if columns exist...")
        # Check if columns exist (simple way)
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='businesses' AND column_name='has_deal'"))
        if not res.fetchone():
            print("Adding has_deal and deal_text columns...")
            await conn.execute(text("ALTER TABLE businesses ADD COLUMN has_deal BOOLEAN DEFAULT FALSE"))
            await conn.execute(text("ALTER TABLE businesses ADD COLUMN deal_text VARCHAR(200)"))
            print("Columns added.")
        else:
            print("Columns already exist.")

    async with AsyncSessionLocal() as db:
        print("Seeding some deals...")
        # Get some active businesses
        res = await db.execute(select(Business).limit(10))
        businesses = res.scalars().all()
        
        deals = [
            "20% OFF on first visit!",
            "Buy 1 Get 1 FREE!",
            "30% Discount for Today only!",
            "Special Weekend Offer: 15% OFF",
            "Half Price on all services!",
            "Complimentary coffee with any purchase"
        ]
        
        count = 0
        for i, biz in enumerate(businesses):
            if i % 2 == 0: # Add deal to every second business for variety
                biz.has_deal = True
                biz.deal_text = random.choice(deals)
                count += 1
        
        await db.commit()
        print(f"Successfully seeded {count} businesses with deals.")

if __name__ == "__main__":
    asyncio.run(migrate_and_seed())
