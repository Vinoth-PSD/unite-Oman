import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from core.config import settings

async def clean_and_migrate():
    # Use postgres database to kill connections to unite_oman
    admin_url = settings.DATABASE_URL.replace("/unite_oman", "/postgres")
    admin_engine = create_async_engine(admin_url)
    try:
        async with admin_engine.begin() as conn:
            print("Killing other sessions to unite_oman...")
            await conn.execute(text("""
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = 'unite_oman' AND pid <> pg_backend_pid()
            """))
    except Exception as e:
        print(f"Failed to kill sessions: {e}")
    finally:
        await admin_engine.dispose()

    # Now migrate
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        print("Migrating database...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE"))
        print("Added/Checked is_active in users")
        
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
        print("Created/Checked services table")
        
        await conn.execute(text("ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id)"))
        print("Added/Checked owner_id in businesses")
        
    await engine.dispose()
    print("Migration Done!")

if __name__ == "__main__":
    asyncio.run(clean_and_migrate())
