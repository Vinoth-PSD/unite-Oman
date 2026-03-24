import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv
import os
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def run():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT count(*) FROM categories"))
        print("Total Categories:", res.scalar())
        res = await conn.execute(text("SELECT count(*) FROM categories WHERE parent_id IS NULL"))
        print("Null parent_id count:", res.scalar())
        res = await conn.execute(text("SELECT count(*) FROM categories WHERE parent_id = 0"))
        print("Zero parent_id count:", res.scalar())
    await engine.dispose()

asyncio.run(run())
