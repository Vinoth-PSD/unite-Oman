import asyncio
import os
import uuid
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from slugify import slugify
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)
DATABASE_URL = os.getenv("DATABASE_URL")

CLINICS = [
{"title": "Oman International Hospital", "totalScore": 4.3, "reviewsCount": 2793, "phone": "+968 24 903500", "categories": ["Hospital"]},
{"title": "Coimbatore Ayurvedic Centre", "totalScore": 4.8, "reviewsCount": 153, "phone": "+968 24 490102", "categories": ["Medical clinic"]},
{"title": "Muscat Private Hospital", "totalScore": 4.4, "reviewsCount": 2335, "phone": "+968 24 583600", "categories": ["Private hospital"]},
{"title": "Ghala Clinic & Pharmacy Al Ghubrah", "totalScore": 4.4, "reviewsCount": 45, "phone": "+968 24 614272", "categories": ["Medical Center"]},
{"title": "EMC Skin Clinic Oman", "totalScore": 4.7, "reviewsCount": 1385, "phone": "+968 24 604540", "categories": ["Skin care clinic"]},
{"title": "KIMSHEALTH Hospital Oman", "totalScore": 4.3, "reviewsCount": 3197, "phone": "+968 24 760100", "categories": ["Hospital"]},
{"title": "Naya Medical Centre", "totalScore": 4.9, "reviewsCount": 120, "phone": "+968 7111 4466", "categories": ["Medical Center"]},
{"title": "Dar Al Shifa Muscat Specialized Polyclinic", "totalScore": 4.6, "reviewsCount": 29, "phone": "+968 24 128182", "categories": ["Walk-in clinic"]},
{"title": "Burjeel Hospital", "totalScore": 4.4, "reviewsCount": 2574, "phone": "+968 24 399777", "categories": ["Hospital"]},
{"title": "Al-Bushra Medical Specialty Complex", "totalScore": 4.6, "reviewsCount": 322, "phone": "+968 24 496419", "categories": ["Fertility clinic"]}
]

PHARMACIES = [
{"title": "Muscat Pharmacy - Al Ghobra", "totalScore": 4.2, "reviewsCount": 189, "phone": "+968 24 497264", "categories": ["Pharmacy"]},
{"title": "Muscat Pharmacy - Ruwi", "totalScore": 4.4, "reviewsCount": 62, "phone": "+968 24 794186", "categories": ["Pharmacy"]},
{"title": "Prime Pharmacy One", "totalScore": 4.6, "reviewsCount": 76, "phone": "+968 9091 0910", "categories": ["Pharmacy"]},
{"title": "Pharmacy Express", "totalScore": 4.8, "reviewsCount": 58, "phone": "+968 7255 9837", "categories": ["Pharmacy"]},
{"title": "LuLu Pharmacy", "totalScore": 3.4, "reviewsCount": 28, "phone": "+968 24 212114", "categories": ["Pharmacy"]},
{"title": "Scientific Pharmacy", "totalScore": 3.5, "reviewsCount": 40, "phone": "+968 24 605060", "categories": ["Pharmacy"]},
{"title": "Aflag Pharmacy", "totalScore": 3.9, "reviewsCount": 58, "phone": "+968 24 506455", "categories": ["Pharmacy"]},
{"title": "Taiba Pharmacy", "totalScore": 4.0, "reviewsCount": 46, "phone": "+968 24 399543", "categories": ["Pharmacy"]}
]

async def seed():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Create Parent: Medical & Health
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'medical-health' OR name_en = 'Medical & Health' LIMIT 1"))
        row = res.fetchone()
        if not row:
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, icon, is_featured, created_at) VALUES ('Medical & Health', 'الصحة والطب', 'medical-health', '🏥', true, now()) RETURNING id"))
            parent_id = res.fetchone()[0]
        else:
            parent_id = row[0]
            
        # Sub 1: Clinics & Hospitals
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'clinics-hospitals' LIMIT 1"))
        row = res.fetchone()
        if not row:
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, parent_id, created_at) VALUES ('Clinics & Hospitals', 'عيادات ومستشفيات', 'clinics-hospitals', :pid, now()) RETURNING id"), {"pid": parent_id})
            clinic_id = res.fetchone()[0]
        else:
            clinic_id = row[0]
            
        # Sub 2: Pharmacy
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'pharmacies' LIMIT 1"))
        row = res.fetchone()
        if not row:
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, parent_id, created_at) VALUES ('Pharmacies', 'صيدليات', 'pharmacies', :pid, now()) RETURNING id"), {"pid": parent_id})
            pharm_id = res.fetchone()[0]
        else:
            pharm_id = row[0]

        # Muscat Governorate
        res = await session.execute(text("SELECT id FROM governorates WHERE slug = 'muscat' LIMIT 1"))
        muscat_id = res.fetchone()[0]
        
        # Vendor User
        res = await session.execute(text("SELECT id FROM users LIMIT 1"))
        user_row = res.fetchone()
        vendor_id = user_row[0]

        async def insert_biz(data, c_id):
            name_en = data.get("title", "Unnamed")
            slug = slugify(name_en)[:200]
            phone = data.get("phone", "")
            address = data.get("street", "Muscat")
            
            # Check if exists
            res = await session.execute(text("SELECT id FROM businesses WHERE slug = :slug OR name_en = :name"), {"slug": slug, "name": name_en})
            if res.fetchone(): return
            
            biz_id = str(uuid.uuid4())
            await session.execute(text("""
                INSERT INTO businesses (
                    id, name_en, slug, phone, address, 
                    category_id, governorate_id, owner_id, 
                    is_verified, rating_avg, rating_count, status, created_at
                ) VALUES (
                    :id, :name, :slug, :phone, :address,
                    :cat_id, :gov_id, :owner_id,
                    true, :rating, :rcount, 'active', now()
                )
            """), {
                "id": biz_id, "name": name_en, "slug": slug, "phone": phone, "address": address,
                "cat_id": c_id, "gov_id": muscat_id, "owner_id": vendor_id,
                "rating": data.get("totalScore", 4.0), "rcount": data.get("reviewsCount", 0)
            })

        for c in CLINICS:
            await insert_biz(c, clinic_id)
        for p in PHARMACIES:
            await insert_biz(p, pharm_id)
            
        await session.commit()
        print("Successfully seeded Medical & Health data!")

if __name__ == "__main__":
    asyncio.run(seed())
