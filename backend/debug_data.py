import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

load_dotenv()

async def check():
    engine = create_async_engine(os.getenv("DATABASE_URL"))
    async with engine.connect() as conn:
        print("--- GOVERNORATES ---")
        res = await conn.execute(text("SELECT id, name_en, slug FROM governorates"))
        for row in res.fetchall():
            print(row)
            
        print("\n--- BUSINESS COUNT ---")
        res = await conn.execute(text("SELECT count(*) FROM businesses"))
        print(f"Total businesses: {res.scalar()}")
        
        print("\n--- SAMPLE BUSINESSES ---")
        res = await conn.execute(text("SELECT id, name_en, status, governorate_id, category_id FROM businesses LIMIT 5"))
        for row in res.fetchall():
            print(row)

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check())
