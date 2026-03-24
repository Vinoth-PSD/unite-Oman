import asyncio
import json
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, select
from datetime import datetime
from slugify import slugify
from dotenv import load_dotenv

# Load environment
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

# Categories to create
SUB_CATEGORIES = [
    {"name": "Fast Food", "slug": "fast-food", "icon": "🍔", "image": "/uploads/categories/fast_food.png", "json": "/Users/darshan/Downloads/muscat category data/restraunt data /fast food.json"},
    {"name": "Cafe", "slug": "cafe", "icon": "☕", "image": "/uploads/categories/cafe.png", "json": "/Users/darshan/Downloads/muscat category data/restraunt data /cafe.json"},
    {"name": "Bakery", "slug": "bakery", "icon": "🥐", "image": "/uploads/categories/bakery.png", "json": "/Users/darshan/Downloads/muscat category data/restraunt data /bakery.json"},
    {"name": "Restaurants", "slug": "restaurants-sub", "icon": "🍽️", "image": "/uploads/categories/restaurant.png", "json": "/Users/darshan/Downloads/muscat category data/restraunt data /restraunt in muscat.json"},
]

async def seed():
    if not DATABASE_URL:
        print("DATABASE_URL not found!")
        return

    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        print("Starting seeding process...")

        # 1. Get or Create Parent "Restaurant" Category
        # We check for slug 'restaurants' (plural) as it's common
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'restaurants'"))
        parent_row = res.fetchone()
        
        if not parent_row:
            print("Creating parent 'Restaurants' category...")
            # Insert parent
            res = await session.execute(text("""
                INSERT INTO categories (name_en, name_ar, slug, icon, is_featured, created_at)
                VALUES ('Restaurants', 'مطاعم', 'restaurants', '🍴', true, now())
                RETURNING id
            """))
            parent_id = res.fetchone()[0]
        else:
            parent_id = parent_row[0]
            print(f"Parent 'Restaurants' category found with ID: {parent_id}")

        # 2. Get Muscat Governorate ID
        res = await session.execute(text("SELECT id FROM governorates WHERE slug = 'muscat'"))
        gov_row = res.fetchone()
        muscat_id = gov_row[0] if gov_row else 1 # Fallback to ID 1 if not found
        print(f"Using Muscat Governorate ID: {muscat_id}")

        # 3. Process Subcategories and Businesses
        for sub in SUB_CATEGORIES:
            print(f"\nProcessing Subcategory: {sub['name']}...")
            
            # Check if subcategory exists
            res = await session.execute(text(f"SELECT id FROM categories WHERE slug = '{sub['slug']}'"))
            sub_row = res.fetchone()
            
            if not sub_row:
                print(f"Creating subcategory: {sub['name']}...")
                res = await session.execute(text("""
                    INSERT INTO categories (name_en, name_ar, slug, icon, cover_image_url, parent_id, created_at)
                    VALUES (:name, :name_ar, :slug, :icon, :img, :pid, now())
                    RETURNING id
                """), {
                    "name": sub["name"],
                    "name_ar": sub["name"], # Simplification
                    "slug": sub["slug"],
                    "icon": sub["icon"],
                    "img": sub["image"],
                    "pid": parent_id
                })
                sub_id = res.fetchone()[0]
            else:
                sub_id = sub_row[0]
                print(f"Subcategory '{sub['name']}' already exists (ID: {sub_id})")

            # Load JSON data
            if not os.path.exists(sub["json"]):
                print(f"File not found: {sub['json']}")
                continue
                
            with open(sub["json"], "r") as f:
                businesses = json.load(f)

            print(f"Importing {len(businesses)} businesses for {sub['name']}...")
            
            count = 0
            for biz in businesses:
                try:
                    title = biz.get("title", "Unknown")
                    slug = slugify(title)
                    # Check if business already exists
                    check = await session.execute(text(f"SELECT id FROM businesses WHERE slug = '{slug}'"))
                    if check.fetchone():
                        continue
                    
                    biz_id = str(uuid.uuid4())
                    
                    # Insert Business
                    await session.execute(text("""
                        INSERT INTO businesses (
                            id, name_en, slug, category_id, governorate_id, 
                            rating_avg, rating_count, phone, website, address, 
                            status, plan, listing_type, created_at, updated_at
                        ) VALUES (
                            :id, :name, :slug, :cat_id, :gov_id,
                            :rating, :reviews, :phone, :web, :addr,
                            'active', 'basic', 'standard', now(), now()
                        )
                    """), {
                        "id": biz_id,
                        "name": title,
                        "slug": slug,
                        "cat_id": sub_id,
                        "gov_id": muscat_id,
                        "rating": biz.get("totalScore", 0),
                        "reviews": biz.get("reviewsCount", 0),
                        "phone": biz.get("phone", None),
                        "web": biz.get("website", None),
                        "addr": biz.get("street", biz.get("city", "Muscat"))
                    })
                    count += 1
                except Exception as e:
                    print(f"Error importing {biz.get('title')}: {e}")
                    continue
                    
            print(f"Successfully imported {count} new businesses for {sub['name']}.")

        await session.commit()
        print("\nSeeding complete!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
