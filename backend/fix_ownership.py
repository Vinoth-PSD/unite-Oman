import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

async def fix_ownership():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. find vendor ID for restaurant.vendor@uniteoman.com
        res = await session.execute(text("SELECT id FROM users WHERE email = 'restaurant.vendor@uniteoman.com'"))
        vendor_row = res.fetchone()
        
        if not vendor_row:
            print("Vendor not found.")
            return

        vendor_id = vendor_row[0]
        print(f"Vendor found: {vendor_id}")

        # 2. Update all businesses that have no owner or belong to the restaurant categories
        # Let's just update all businesses where owner_id IS NULL for now
        res = await session.execute(text("UPDATE businesses SET owner_id = :vendor_id WHERE owner_id IS NULL"), {"vendor_id": vendor_id})
        count = res.rowcount
        
        await session.commit()
        print(f"Updated {count} businesses to belong to vendor {vendor_id}.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix_ownership())
