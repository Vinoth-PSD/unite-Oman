import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

# Load environment variables from the specific path
env_path = "/Users/darshan/Downloads/unite-oman-git/unite-Oman/backend/.env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    print(f"DATABASE_URL: {DATABASE_URL}")
    if not DATABASE_URL:
        print("DATABASE_URL not found in environment")
        return

    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Migrating database (v3)...")
        try:
            # Add parent_id to categories
            await conn.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id)"))
            print("Checked/Added parent_id to categories")
            
            print("Migration successful")
        except Exception as e:
            print(f"Migration failed: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
