import asyncio
from sqlalchemy import text
from core.database import engine

async def seed_automotive():
    subcategories = [
        {"name_en": "Car Rental", "name_ar": "تأجير السيارات", "slug": "car-rental", "parent_id": 2, "icon": "Key"},
        {"name_en": "Car Repair", "name_ar": "تصليح السيارات", "slug": "car-repair", "parent_id": 2, "icon": "Wrench"},
    ]
    
    async with engine.begin() as conn:
        for cat in subcategories:
            # Check if exists
            res = await conn.execute(text("SELECT id FROM categories WHERE slug = :slug"), {"slug": cat["slug"]})
            row = res.fetchone()
            if not row:
                print(f"Creating category: {cat['name_en']}")
                await conn.execute(text(
                    "INSERT INTO categories (name_en, name_ar, slug, parent_id, icon, created_at) "
                    "VALUES (:name_en, :name_ar, :slug, :parent_id, :icon, NOW())"
                ), cat)
            else:
                print(f"Category already exists: {cat['name_en']}")

    print("Automotive subcategories seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_automotive())
