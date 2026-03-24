import asyncio
import json
import uuid
from sqlalchemy import text
from core.database import engine
from slugify import slugify

async def import_data():
    it_company_id = 30
    muscat_id = 1
    
    tech_img = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
    logo_img = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop"

    with open('/Users/darshan/Downloads/dataset_crawler-google-places_2026-03-23_12-53-37-054.json', 'r') as f:
        data = json.load(f)

    # Filter for IT related companies or just take what the user provided as it's specifically for this
    # I'll filter for entries that have 'Software company' or 'IT' in tags if possible, 
    # but the user said this file IS it company data.
    
    it_businesses = []
    for item in data:
        cats = [c.lower() for c in item.get('categories', [])]
        if any(keyword in ' '.join(cats) for keyword in ['software', 'it', 'marketing agency', 'designer', 'consultant']):
            it_businesses.append(item)

    # Sort by reviews to get the best ones
    it_businesses.sort(key=lambda x: x.get('reviewsCount', 0) or 0, reverse=True)
    top_it = it_businesses[:30] # Import top 30

    async with engine.begin() as conn:
        for item in top_it:
            slug = slugify(item["title"])
            res = await conn.execute(text("SELECT id FROM businesses WHERE slug = :slug"), {"slug": slug})
            if not res.fetchone():
                print(f"Importing IT Company: {item['title']}")
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
                    "cat": it_company_id,
                    "gov": muscat_id,
                    "desc": f"Leading technology and software solutions provider in {item.get('city', 'Muscat')}, Oman.",
                    "addr": item.get("street") or item.get("city", "Muscat"),
                    "phone": item.get("phone"),
                    "web": item.get("website"),
                    "rate": item.get("totalScore", 0) or 0,
                    "count": item.get("reviewsCount", 0) or 0,
                    "cover": tech_img,
                    "logo": logo_img,
                    "gall": [tech_img]
                })

    print("Import complete.")

if __name__ == "__main__":
    asyncio.run(import_data())
