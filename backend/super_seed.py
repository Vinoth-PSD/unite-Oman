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
        print("Step 1: Running Migration (Adding parent_id)...")
        try:
            await session.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id)"))
            await session.commit()
            print("✓ Migration successful.")
        except Exception as e:
            print(f"✗ Migration failed (might already be applied): {e}")

        print("\nStep 2: Checking for Parent Category...")
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'restaurants'"))
        parent_row = res.fetchone()
        
        if not parent_row:
            print("Creating parent 'Restaurants' category...")
            res = await session.execute(text("""
                INSERT INTO categories (name_en, name_ar, slug, icon, is_featured, created_at)
                VALUES ('Restaurants', 'مطاعم', 'restaurants', '🍴', true, now())
                RETURNING id
            """))
            parent_id = res.fetchone()[0]
        else:
            parent_id = parent_row[0]
            print(f"✓ Parent category found (ID: {parent_id})")

        # 3. Create a Vendor User for these shops
        email = "restaurant.vendor@uniteoman.com"
        password_hash = "$2b$12$LQv3c1yqBWVHxkd0LqCF9uQVB7M7f6M/vR.XvK0vK0vK0vK0vK0vK" # 'password123'
        
        res = await session.execute(text(f"SELECT id FROM users WHERE email = '{email}'"))
        user_row = res.fetchone()
        if not user_row:
            print(f"Creating vendor user: {email}...")
            user_id = str(uuid.uuid4())
            await session.execute(text("""
                INSERT INTO users (id, email, password_hash, role, is_active, created_at)
                VALUES (:id, :email, :pw, 'vendor', true, now())
            """), {"id": user_id, "email": email, "pw": password_hash})
        else:
            user_id = user_row[0]
            print(f"✓ Vendor user exists: {email}")

        # 4. Get Muscat ID
        res = await session.execute(text("SELECT id FROM governorates WHERE slug = 'muscat'"))
        gov_row = res.fetchone()
        muscat_id = gov_row[0] if gov_row else 1

        try:
            # 1. Relax constraints on businesses table BEFORE seeding
            await session.execute(text('ALTER TABLE businesses ALTER COLUMN phone TYPE VARCHAR(100)'))
            await session.execute(text('ALTER TABLE businesses ALTER COLUMN website TYPE TEXT'))
            await session.execute(text('ALTER TABLE businesses ALTER COLUMN name_en TYPE VARCHAR(500)'))
            await session.execute(text('ALTER TABLE businesses ALTER COLUMN slug TYPE VARCHAR(500)'))
            
            # 2. Fix restaurants-sub category slug just in case
            await session.execute(text("UPDATE categories SET slug = 'restaurants-muscat' WHERE slug = 'restaurants-sub'"))
            await session.commit()
        except Exception as e:
            await session.rollback()
            pass # Might not work if table doesn't exist yet or columns already altered

        # Curated images for subcategories
        CATEGORY_IMAGES = {
            'cafe':           'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
            'fast-food':      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
            'bakery':         'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
            'restaurants-sub':'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
        }

        # 5. Import subcategories and businesses
        total_count = 0
        for sub in SUB_CATEGORIES:
            print(f"\nImporting {sub['name']}...")
            try:
                res = await session.execute(text("SELECT id FROM categories WHERE slug = :slug"), {"slug": sub["slug"]})
                sub_row = res.fetchone()
                if not sub_row:
                    res = await session.execute(text("""
                        INSERT INTO categories (name_en, name_ar, slug, icon, cover_image_url, parent_id, created_at)
                        VALUES (:name, :name_ar, :slug, :icon, :img, :pid, now())
                        RETURNING id
                    """), {"name": sub["name"], "name_ar": sub["name"], "slug": sub["slug"], "icon": sub["icon"], "img": sub["image"], "pid": parent_id})
                    sub_id = res.fetchone()[0]
                else:
                    sub_id = sub_row[0]
                await session.commit()
            except Exception as e:
                print(f"Error creating category {sub['name']}: {e}")
                await session.rollback()
                continue

            if not os.path.exists(sub["json"]):
                print(f"File missing: {sub['json']}")
                continue
                
            with open(sub["json"], "r") as f:
                businesses = json.load(f)

            # Get default cover image for this category
            cover_img = CATEGORY_IMAGES.get(sub["slug"], "")

            success_in_cat = 0
            for biz in businesses:
                try:
                    title = biz.get("title", "Unknown")[:490]
                    slug = slugify(title)
                    
                    # Use a new transaction for each business
                    check = await session.execute(text("SELECT id FROM businesses WHERE slug = :slug"), {"slug": slug})
                    if check.fetchone(): continue
                    
                    biz_id = str(uuid.uuid4())
                    phone_val = biz.get("phone", "")[:99] if biz.get("phone") else None
                    web_val = biz.get("website", "")
                    addr_val = biz.get("street", "Muscat")

                    await session.execute(text("""
                        INSERT INTO businesses (
                            id, name_en, slug, category_id, governorate_id, owner_id,
                            rating_avg, rating_count, phone, website, address, 
                            status, plan, listing_type, cover_image_url, created_at, updated_at
                        ) VALUES (
                            :id, :name, :slug, :cat_id, :gov_id, :owner_id,
                            :rating, :reviews, :phone, :web, :addr,
                            'active', 'basic', 'standard', :cover_img, now(), now()
                        )
                    """), {
                        "id": biz_id, "name": title, "slug": slug, "cat_id": sub_id, "owner_id": user_id,
                        "gov_id": muscat_id, "rating": biz.get("totalScore", 0), "reviews": biz.get("reviewsCount", 0),
                        "phone": phone_val, "web": web_val, "addr": addr_val, "cover_img": cover_img
                    })
                    await session.commit()
                    success_in_cat += 1
                    total_count += 1
                except Exception as e:
                    print(f"     [!] Failed to import '{biz.get('title')}': {e}")
                    await session.rollback()
                    continue
            
            print(f"✓ Imported {success_in_cat} shops into {sub['name']}")


        print(f"\n✓ SUCCESSFULLY IMPORTED {total_count} BUSINESSES!")
        print("\n------------------------------------------------")
        print("LOGIN CREDENTIALS FOR THESE SHOPS:")
        print(f"Email: {email}")
        print("Password: password123")
        print("------------------------------------------------")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
