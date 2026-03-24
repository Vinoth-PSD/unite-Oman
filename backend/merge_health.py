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
        # Get the original 'health' category (ID 4)
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'health' LIMIT 1"))
        row = res.fetchone()
        if not row:
            print("Fatal: 'health' category not found!")
            return
        correct_parent_id = row[0]

        # Update clinic and pharmacy to have correct parent_id
        await session.execute(text("UPDATE categories SET parent_id = :pid WHERE slug IN ('clinic', 'pharmacy')"), {"pid": correct_parent_id})
        
        # Delete the redundant 'healthandmedical' category
        await session.execute(text("DELETE FROM categories WHERE slug = 'healthandmedical'"))
        
        await session.commit()
        
        # Now update business counts!
        await session.execute(text("""
            UPDATE categories c
            SET business_count = (
                SELECT count(*) FROM businesses b
                WHERE b.category_id = c.id AND b.status = 'active'
            )
        """))
        await session.commit()
        
        print("Successfully merged 'clinic' and 'pharmacy' under the original 'Health & Medical' (slug: health) and deleted the duplicate!")

if __name__ == "__main__":
    asyncio.run(patch())
