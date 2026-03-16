import asyncio
from sqlalchemy import text
from core.database import engine

async def sync_counts():
    async with engine.begin() as conn:
        print("Synchronizing category business counts...")
        await conn.execute(text("""
            UPDATE categories c
            SET business_count = (
                SELECT COUNT(*)
                FROM businesses b
                WHERE b.category_id = c.id AND b.status = 'active'
            );
        """))
        
        print("Synchronizing governorate business counts...")
        await conn.execute(text("""
            UPDATE governorates g
            SET business_count = (
                SELECT COUNT(*)
                FROM businesses b
                WHERE b.governorate_id = g.id AND b.status = 'active'
            );
        """))
        
        print("Sync complete.")

if __name__ == "__main__":
    asyncio.run(sync_counts())
