import asyncio
from sqlalchemy import text
from core.database import engine

async def seed_retail():
    subcategories = [
        {"name_en": "Supermarket", "name_ar": "سوبر ماركت", "slug": "supermarket", "parent_id": 3},
        {"name_en": "Electronic", "name_ar": "إلكترونيات", "slug": "electronic", "parent_id": 3}
    ]

    async with engine.begin() as conn:
        for cat in subcategories:
            # Check if exists
            res = await conn.execute(
                text("SELECT id FROM categories WHERE slug = :slug"),
                {"slug": cat["slug"]}
            )
            if not res.fetchone():
                print(f"Adding subcategory: {cat['name_en']}")
                await conn.execute(
                    text("INSERT INTO categories (name_en, name_ar, slug, parent_id) VALUES (:name_en, :name_ar, :slug, :parent_id)"),
                    cat
                )
            else:
                print(f"Subcategory already exists: {cat['name_en']}")

    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_retail())
