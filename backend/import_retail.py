import asyncio
import json
import uuid
from sqlalchemy import text
from core.database import engine
from slugify import slugify

async def import_data():
    supermarket_id = 28
    electronic_id = 29
    muscat_id = 1
    
    supermarket_img = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
    electronic_img = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80"
    logo_img = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop"

    with open('/Users/darshan/Downloads/muscat category data/market data/supermarket.json', 'r') as f:
        supermarkets = json.load(f)
    with open('/Users/darshan/Downloads/muscat category data/market data/ electrnic.json', 'r') as f:
        electronics = json.load(f)

    # Sort supermarkets by reviewsCount to get the most prominent ones
    supermarkets.sort(key=lambda x: x.get('reviewsCount', 0) or 0, reverse=True)
    top_supermarkets = supermarkets[:20]

    async with engine.begin() as conn:
        # Import Supermarkets
        for item in top_supermarkets:
            slug = slugify(item["title"])
            res = await conn.execute(text("SELECT id FROM businesses WHERE slug = :slug"), {"slug": slug})
            if not res.fetchone():
                print(f"Importing Supermarket: {item['title']}")
                await conn.execute(text("""
                    INSERT INTO businesses 
                    (id, name_en, slug, category_id, governorate_id, description, address, phone, website, 
                     rating_avg, rating_count, status, is_featured, is_verified, plan, listing_type,
                     cover_image_url, logo_url, gallery_urls, created_at)
                    VALUES 
                    (:bid, :name, :slug, :cat, :gov, :desc, :addr, :phone, :web, :rate, :count, 'active', false, true, 'basic', 'standard',
                     :cover, :logo, :gall, NOW())
                """), {
                    "bid": str(uuid.uuid4()),
                    "name": item["title"],
                    "slug": slug,
                    "cat": supermarket_id,
                    "gov": muscat_id,
                    "desc": f"Leading supermarket and hypermarket in {item.get('city', 'Muscat')}, Oman.",
                    "addr": item.get("street") or item.get("city", "Muscat"),
                    "phone": item.get("phone"),
                    "web": item.get("website"),
                    "rate": item.get("totalScore", 0) or 0,
                    "count": item.get("reviewsCount", 0) or 0,
                    "cover": supermarket_img,
                    "logo": logo_img,
                    "gall": [supermarket_img]
                })

        # Import Electronics
        for item in electronics:
            slug = slugify(item["title"])
            res = await conn.execute(text("SELECT id FROM businesses WHERE slug = :slug"), {"slug": slug})
            if not res.fetchone():
                print(f"Importing Electronic: {item['title']}")
                await conn.execute(text("""
                    INSERT INTO businesses 
                    (id, name_en, slug, category_id, governorate_id, description, address, phone, website, 
                     rating_avg, rating_count, status, is_featured, is_verified, plan, listing_type,
                     cover_image_url, logo_url, gallery_urls, created_at)
                    VALUES 
                    (:bid, :name, :slug, :cat, :gov, :desc, :addr, :phone, :web, :rate, :count, 'active', false, true, 'basic', 'standard',
                     :cover, :logo, :gall, NOW())
                """), {
                    "bid": str(uuid.uuid4()),
                    "name": item["title"],
                    "slug": slug,
                    "cat": electronic_id,
                    "gov": muscat_id,
                    "desc": f"Specialized electronics and technology store in {item.get('city', 'Muscat')}, Oman.",
                    "addr": item.get("street") or item.get("city", "Muscat"),
                    "phone": item.get("phone"),
                    "web": item.get("website"),
                    "rate": item.get("totalScore", 0) or 0,
                    "count": item.get("reviewsCount", 0) or 0,
                    "cover": electronic_img,
                    "logo": logo_img,
                    "gall": [electronic_img]
                })

    print("Import complete.")

if __name__ == "__main__":
    asyncio.run(import_data())
