import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)
DATABASE_URL = os.getenv("DATABASE_URL")

async def patch():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Patch any NULL plans
        await session.execute(text("UPDATE businesses SET plan = 'basic' WHERE plan IS NULL"))
        
        # Patch any NULL listing_types
        await session.execute(text("UPDATE businesses SET listing_type = 'standard' WHERE listing_type IS NULL"))

        # Patch any NULL status
        await session.execute(text("UPDATE businesses SET status = 'active' WHERE status IS NULL"))

        # Commit changes
        await session.commit()
        
        # Now update business counts!
        await session.execute(text("""
            UPDATE categories c
            SET business_count = (
                SELECT count(*) FROM businesses b
                WHERE b.category_id = c.id AND b.status = 'active'
            )
        """))
        await session.execute(text("""
            UPDATE governorates g
            SET business_count = (
                SELECT count(*) FROM businesses b
                WHERE b.governorate_id = g.id AND b.status = 'active'
            )
        """))
        await session.commit()
        
        print("Successfully patched NULL enums and synchronized category counts in businesses table!")

if __name__ == "__main__":
    asyncio.run(patch())
