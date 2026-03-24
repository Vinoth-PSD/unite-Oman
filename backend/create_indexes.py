import asyncio
from sqlalchemy import text
from core.database import engine

async def create_indexes():
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses (status)",
        "CREATE INDEX IF NOT EXISTS idx_businesses_category_id ON businesses (category_id)",
        "CREATE INDEX IF NOT EXISTS idx_businesses_governorate_id ON businesses (governorate_id)",
        "CREATE INDEX IF NOT EXISTS idx_businesses_is_featured ON businesses (is_featured)",
        "CREATE INDEX IF NOT EXISTS idx_businesses_is_verified ON businesses (is_verified)",
        "CREATE INDEX IF NOT EXISTS idx_businesses_listing_type ON businesses (listing_type)",
    ]
    
    async with engine.begin() as conn:
        for sql in indexes:
            print(f"Executing: {sql}")
            await conn.execute(text(sql))
    
    print("All indexes checked/created successfully.")

if __name__ == "__main__":
    asyncio.run(create_indexes())
