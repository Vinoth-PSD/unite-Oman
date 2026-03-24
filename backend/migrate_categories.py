import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)
DATABASE_URL = os.getenv("DATABASE_URL")

async def patch():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Get target categories from the user's flow
        # 1. Health and Medical
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'healthandmedical' LIMIT 1"))
        row = res.fetchone()
        if not row:
            # Create if it doesn't exist
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, is_featured, created_at) VALUES ('Health & Medical', 'الصحة والطب', 'healthandmedical', true, now()) RETURNING id"))
            parent_id = res.fetchone()[0]
        else:
            parent_id = row[0]
            
        # 2. Clinic
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'clinic' LIMIT 1"))
        row = res.fetchone()
        if not row:
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, parent_id, created_at) VALUES ('Clinic', 'عيادة', 'clinic', :pid, now()) RETURNING id"), {"pid": parent_id})
            target_clinic_id = res.fetchone()[0]
        else:
            target_clinic_id = row[0]
            
        # 3. Pharmacy
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'pharmacy' LIMIT 1"))
        row = res.fetchone()
        if not row:
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, parent_id, created_at) VALUES ('Pharmacy', 'صيدلية', 'pharmacy', :pid, now()) RETURNING id"), {"pid": parent_id})
            target_pharmacy_id = res.fetchone()[0]
        else:
            target_pharmacy_id = row[0]

        # Get the wrong categories we created earlier
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'clinics-hospitals' LIMIT 1"))
        wrong_clinic = res.fetchone()
        if wrong_clinic:
            wrong_clinic_id = wrong_clinic[0]
            await session.execute(text("UPDATE businesses SET category_id = :new WHERE category_id = :old"), {"new": target_clinic_id, "old": wrong_clinic_id})
            await session.execute(text("DELETE FROM categories WHERE id = :old"), {"old": wrong_clinic_id})

        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'pharmacies' LIMIT 1"))
        wrong_pharm = res.fetchone()
        if wrong_pharm:
            wrong_pharm_id = wrong_pharm[0]
            await session.execute(text("UPDATE businesses SET category_id = :new WHERE category_id = :old"), {"new": target_pharmacy_id, "old": wrong_pharm_id})
            await session.execute(text("DELETE FROM categories WHERE id = :old"), {"old": wrong_pharm_id})

        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'medical-health' LIMIT 1"))
        wrong_parent = res.fetchone()
        if wrong_parent:
            wrong_parent_id = wrong_parent[0]
            # Safety check before deleting parent
            res_check = await session.execute(text("SELECT count(*) FROM categories WHERE parent_id = :id"), {"id": wrong_parent_id})
            if res_check.fetchone()[0] == 0:
                await session.execute(text("DELETE FROM categories WHERE id = :old"), {"old": wrong_parent_id})

        await session.commit()
        
        # Now update business counts!
        await session.execute(text("""
            UPDATE categories c
            SET business_count = (
                SELECT count(*) FROM businesses b
                WHERE b.category_id = c.id AND b.status = 'active'
            )
        """))
        await session.execute(text("""
            UPDATE governorates g
            SET business_count = (
                SELECT count(*) FROM businesses b
                WHERE b.governorate_id = g.id AND b.status = 'active'
            )
        """))
        await session.commit()
        
        print("Successfully migrated businesses to the 'healthandmedical', 'clinic', and 'pharmacy' slug flows, and cleaned up duplicates!")

if __name__ == "__main__":
    asyncio.run(patch())
