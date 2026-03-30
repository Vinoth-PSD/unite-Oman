import asyncio
import os
import re
import urllib.parse
import requests
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

# Load env vars
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql+asyncpg://postgres:StrongPassword%40123@72.61.229.172:5432/unite_oman_ai"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

def fetch_real_image_for_business(business_name: str) -> str | None:
    try:
        query = urllib.parse.quote_plus(f"{business_name} Oman shop exterior")
        url = f"https://www.bing.com/images/search?q={query}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }
        res = requests.get(url, headers=headers, timeout=10)
        
        # Look for the internal murl string which contains the direct image URL in Bing JSON
        # It's usually in murl&quot;:&quot;URL&quot; or murl":"URL"
        matches = re.findall(r'murl(?:&quot;|"):(?:&quot;|")(http[^"&]+)(?:&quot;|")', res.text)
        for match in matches:
            if "unsplash" not in match and "shutterstock" not in match and "istock" not in match:
                return match
                
    except Exception as e:
        print(f"Error fetching image for {business_name}: {e}")
    return None

async def process_and_update(b_id, name):
    # Search for the image
    loop = asyncio.get_event_loop()
    real_url = await loop.run_in_executor(None, fetch_real_image_for_business, name)
    
    if real_url:
        print(f"   [SUCCESS] Found real image: {real_url[:60]}...")
        # Open a new short-lived session just for this update to prevent idle connection drop
        async with AsyncSessionLocal() as update_session:
            await update_session.execute(text(
                "UPDATE businesses SET cover_image_url = :url WHERE id = :id"
            ), {"url": real_url, "id": b_id})
            await update_session.commit()
    else:
        print(f"   [FAILED] Could not find an image for {name}")

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text(
            "SELECT id, name_en, cover_image_url FROM businesses "
            "WHERE cover_image_url LIKE '%unsplash.com%' OR cover_image_url IS NULL"
        ))
        businesses_to_update = result.fetchall()
        
    if not businesses_to_update:
        print("No businesses found matching criteria. Database looks clean!")
        return

    print(f"Found {len(businesses_to_update)} businesses that need real images...")
    
    # Process in chunks of 5 concurrently to speed it up to ~3 mins instead of 1 hour!
    semaphore = asyncio.Semaphore(5)
    
    async def sem_task(b_id, name):
        async with semaphore:
            await process_and_update(b_id, name)
            await asyncio.sleep(0.5)

    tasks = [sem_task(b_id, name) for b_id, name, _ in businesses_to_update]
    await asyncio.gather(*tasks)
    
    print("✅ Database successfully updated with real images!")

if __name__ == "__main__":
    asyncio.run(main())
