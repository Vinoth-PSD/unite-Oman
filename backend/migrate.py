import asyncio
from core.database import engine
from sqlalchemy import text

async def migrate():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE businesses ADD COLUMN trade_license_url VARCHAR;"))
            print("Added trade_license_url")
        except Exception as e: print(e)
        
        try:
            await conn.execute(text("ALTER TABLE businesses ADD COLUMN id_proof_url VARCHAR;"))
            print("Added id_proof_url")
        except Exception as e: print(e)
        
        try:
            await conn.execute(text("ALTER TABLE businesses ADD COLUMN owner_photo_url VARCHAR;"))
            print("Added owner_photo_url")
        except Exception as e: print(e)

if __name__ == "__main__":
    asyncio.run(migrate())
