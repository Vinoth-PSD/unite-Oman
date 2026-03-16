import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from core.config import settings

async def fix():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_owner_id_fkey"))
            print("Dropped constraint businesses_owner_id_fkey")
        except Exception as e:
            print(f"Error dropping constraint: {e}")
            
if __name__ == "__main__":
    asyncio.run(fix())
