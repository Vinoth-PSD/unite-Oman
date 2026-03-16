import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from core.config import settings

async def migrate():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        print("Migrating database...")
        try:
            # 1. Add is_active column to users
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE"))
            print("Checked/Added is_active to users")
            
            # 2. Create services table
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS services (
                    id UUID PRIMARY KEY,
                    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    price VARCHAR(100),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """))
            print("Checked/Created services table")

            # 3. Add owner_id to businesses if not exists (just in case)
            await conn.execute(text("ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id)"))
            print("Checked/Added owner_id to businesses")
            
            print("Migration successful")
        except Exception as e:
            print(f"Migration failed: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
