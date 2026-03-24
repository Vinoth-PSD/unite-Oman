import asyncio
from sqlalchemy import text
from core.database import engine

async def seed_it_company():
    subcategory = {"name_en": "IT Company", "name_ar": "شركة تقنية معلومات", "slug": "it-company", "parent_id": 6}

    async with engine.begin() as conn:
        res = await conn.execute(
            text("SELECT id FROM categories WHERE slug = :slug"),
            {"slug": subcategory["slug"]}
        )
        if not res.fetchone():
            print(f"Adding subcategory: {subcategory['name_en']}")
            await conn.execute(
                text("INSERT INTO categories (name_en, name_ar, slug, parent_id) VALUES (:name_en, :name_ar, :slug, :parent_id)"),
                subcategory
            )
        else:
            print(f"Subcategory already exists: {subcategory['name_en']}")

    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_it_company())
