import asyncio
import os
import uuid
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from slugify import slugify
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)
DATABASE_URL = os.getenv("DATABASE_URL")

DATA = [
{
  "title": "1847 Grooming for Men Mall of Oman",
  "totalScore": 4.9,
  "reviewsCount": 206,
  "street": "Level 1 Bawshar St, Muscat, Oman Mall of Oman, Level 1 Nearest Parking: Gate A",
  "city": "Muscat",
  "phone": "+968 7177 1847"
},
{
  "title": "HIKMAT BARBER SHOP & SPA FOR MEN",
  "totalScore": 4.8,
  "reviewsCount": 281,
  "street": "Muscat",
  "city": "Muscat",
  "phone": "+968 9947 2628"
},
{
  "title": "The Man Cave",
  "totalScore": 4.8,
  "reviewsCount": 125,
  "street": "al Madina, Unit 8, Souq, Al Bashair St",
  "city": "Muscat",
  "phone": "+968 9800 8327"
},
{
  "title": "Masculuxe Barbershop and Spa",
  "totalScore": 4.9,
  "reviewsCount": 140,
  "street": "Boulevard boutique Mall OM, Al Kharjiyah St, 103, Oman",
  "city": "Muscat",
  "phone": "+968 9060 3024"
},
{
  "title": "Lafirma Spa & Barbershop",
  "totalScore": 4.9,
  "reviewsCount": 261,
  "street": "Hay Al Baydhaa St",
  "city": "Muscat",
  "phone": "+968 7719 0009"
},
{
  "title": "THE MAN CAVE",
  "totalScore": 4.7,
  "reviewsCount": 473,
  "street": "J7H8+9Q2",
  "city": "Seeb",
  "phone": "+968 7171 0790"
},
{
  "title": "Fellas & Co",
  "totalScore": 4.7,
  "reviewsCount": 163,
  "street": "Marafah Street, Way 238",
  "city": "Muscat",
  "phone": "+968 9019 2001"
},
{
  "title": "The Barber - Al Khuwair Branch",
  "totalScore": 4.5,
  "reviewsCount": 426,
  "street": "Al Khuwair St",
  "city": "Muscat",
  "phone": "+968 9171 4668"
},
{
  "title": "Tribes Men's Spa and Salon ( Boshar)",
  "totalScore": 4.9,
  "reviewsCount": 636,
  "street": "Al Khuwair",
  "city": "Muscat",
  "phone": "+968 9738 7797"
},
{
  "title": "Underground Barbershop Muscat Al-Mouj Street",
  "totalScore": 4.7,
  "reviewsCount": 227,
  "street": "Al Mauj St",
  "city": "Seeb"
},
{
  "title": "BLADE",
  "totalScore": 4.2,
  "reviewsCount": 288,
  "street": "111, Suqoon Building, 4008 way, Al Azaiba Bowshar",
  "city": "Muscat"
},
{
  "title": "GOAT Barber",
  "totalScore": 4.8,
  "reviewsCount": 84,
  "street": "257 Al Maha St",
  "city": "Muscat",
  "phone": "+968 7729 0029"
},
{
  "title": "Truefitt and Hill Barber Shop",
  "totalScore": 4.7,
  "reviewsCount": 28,
  "street": "Royal Opera House Muscat, Alkharjia st",
  "city": "Muscat",
  "phone": "+968 9966 1805"
},
{
  "title": "Dax and Wax (Barbershop & Spa)",
  "totalScore": 4.8,
  "reviewsCount": 280,
  "street": "Bawshar St",
  "city": "Muscat",
  "phone": "+968 7900 2229"
},
{
  "title": "Hashtag Barbershop",
  "totalScore": 4.7,
  "reviewsCount": 78,
  "street": "Muscat",
  "city": "Muscat",
  "phone": "+968 7868 8019"
},
{
  "title": "Barber Shop Muscat profcut",
  "totalScore": 4.9,
  "reviewsCount": 137,
  "street": "Near Souk Al Ghubrah St",
  "city": "Muscat",
  "phone": "+968 9195 2160"
},
{
  "title": "Hills Salon & SPA",
  "totalScore": 4.9,
  "reviewsCount": 146,
  "street": "Way 502 Block 305, Store 96 Airport Heights",
  "city": "Muscat",
  "phone": "+968 24 341332"
},
{
  "title": "Tribes Men's Spa and Salon (Mazoon St)",
  "totalScore": 4.9,
  "reviewsCount": 444,
  "street": "Al Mazoon St",
  "city": "Al Khoudh",
  "phone": "+968 9738 7798"
},
{
  "title": "Shin & Jim",
  "totalScore": 4.6,
  "reviewsCount": 41,
  "street": "Muscat",
  "city": "Muscat",
  "phone": "+968 24 991444"
},
{
  "title": "Spa Milano",
  "totalScore": 5,
  "reviewsCount": 31,
  "street": "Al Inshirah St",
  "city": "Muscat",
  "phone": "+968 9184 8000"
},
{
  "title": "GENTLEMEN'S SALON & SPA CBD RUWI",
  "totalScore": 4.7,
  "reviewsCount": 74,
  "street": "CBD",
  "city": "Muscat",
  "phone": "+968 9673 4019"
},
{
  "title": "Cut and Shave",
  "totalScore": 4.5,
  "reviewsCount": 149,
  "street": "18th November St",
  "city": "Muscat",
  "phone": "+968 9191 3305"
},
{
  "title": "1948 Men Spa",
  "totalScore": 3.8,
  "reviewsCount": 52,
  "street": "201, OM OM, 201 Dawat Al Adab St",
  "city": "Muscat",
  "phone": "+968 7200 1948"
},
{
  "title": "Ali the professional barber",
  "totalScore": 4.7,
  "reviewsCount": 83,
  "street": "Muscat",
  "city": "Muscat",
  "phone": "+968 9231 9349"
},
{
  "title": "BARBAROSSA Turkish Barber Shop",
  "totalScore": 4.7,
  "reviewsCount": 33,
  "street": "Muscat",
  "city": "Muscat",
  "phone": "+968 7198 2000"
},
{
  "title": "Castle Spa for Men",
  "totalScore": 4.9,
  "reviewsCount": 90,
  "street": "651 Way",
  "city": "Muscat",
  "phone": "+968 9989 6352"
},
{
  "title": "Cut & More spa and barber",
  "totalScore": 4.9,
  "reviewsCount": 25,
  "street": "Muscat",
  "city": "Muscat",
  "phone": "+968 7722 0010"
},
{
  "title": "PERSIAN BARBER SHOP",
  "totalScore": 4.5,
  "reviewsCount": 38,
  "street": "18th November St",
  "city": "Muscat"
},
{
  "title": "ManCare",
  "totalScore": 4.4,
  "reviewsCount": 41,
  "street": "Muscat",
  "city": "Muscat",
  "phone": "+968 9945 0432"
},
{
  "title": "TOUCHUP Wadi Kabir",
  "totalScore": 4.8,
  "reviewsCount": 142,
  "street": "HH8G+6FJ",
  "city": "Muscat",
  "phone": "+968 7224 8860"
},
{
  "title": "ALiLA MEN SALON & SPA - BAWSHAR",
  "totalScore": 5,
  "reviewsCount": 628,
  "street": "Bawshar Building",
  "city": "Muscat",
  "phone": "+968 7231 8000"
},
{
  "title": "Hajjam Oman",
  "totalScore": 4.9,
  "reviewsCount": 72,
  "street": "Block 257",
  "city": "Muscat",
  "phone": "+968 9402 3123"
},
{
  "title": "Argento Gents",
  "totalScore": 5,
  "reviewsCount": 11,
  "street": "BLV tower",
  "city": "Muscat",
  "phone": "+968 7222 9095"
},
{
  "title": "Q spa and salon",
  "totalScore": 3.9,
  "reviewsCount": 36,
  "street": "Muscat",
  "city": "Muscat",
  "phone": "+968 22 866344"
},
{
  "title": "Alawsaf Barber & Spa FOR MEN",
  "totalScore": 4.7,
  "reviewsCount": 27,
  "street": "Azaiba 4466",
  "city": "Muscat",
  "phone": "+968 7411 6224"
},
{
  "title": "M CUTS MALLUS BARBERSHOP",
  "totalScore": 4.2,
  "reviewsCount": 39,
  "street": "H9MC+W6V",
  "city": "Muscat",
  "phone": "+968 9695 0381"
},
{
  "title": "4Men Salon & Spa",
  "totalScore": 3.8,
  "reviewsCount": 17,
  "street": "Ground floor, Jasmine complex, Al Khuwair St",
  "city": "Muscat",
  "phone": "+968 9477 6092"
},
{
  "title": "Al Lord Barbershop",
  "totalScore": 4.1,
  "reviewsCount": 102,
  "street": "H9V9+CV9",
  "city": "Muscat",
  "phone": "+968 9594 0061"
},
{
  "title": "Modern Cut Saloon",
  "totalScore": 3.3,
  "reviewsCount": 50,
  "street": "Avenue Mall Bousher",
  "city": "Muscat",
  "phone": "+968 22 507821"
},
{
  "title": "ALILA MEN SALON & SPA - Al Hail",
  "totalScore": 4.7,
  "reviewsCount": 559,
  "street": "South Al Hail, 2719 Way",
  "city": "Seeb",
  "phone": "+968 9944 8840"
},
{
  "title": "The Barber - Al Hail Branch",
  "totalScore": 4.8,
  "reviewsCount": 131,
  "street": "Dama St The Village",
  "city": "Al Hail",
  "phone": "+968 9171 4668"
},
{
  "title": "The Backyard Gents Spa - Bousher Branch",
  "totalScore": 4.2,
  "reviewsCount": 27,
  "street": "Bawshar St",
  "city": "Muscat",
  "phone": "+968 9963 7000"
},
{
  "title": "Spaloon Ghubra",
  "totalScore": 4.1,
  "reviewsCount": 227,
  "street": "Al Ghubra Roundabout",
  "city": "Muscat",
  "phone": "+968 24 616838"
},
{
  "title": "Zizo Barber",
  "totalScore": 5,
  "reviewsCount": 2,
  "street": "HCVG+PM3",
  "city": "Muscat",
  "phone": "+968 9443 7887"
},
{
  "title": "Georgekutz_hairStudio",
  "totalScore": 4.5,
  "reviewsCount": 36,
  "street": "Seeb",
  "city": "Seeb",
  "phone": "+968 9468 9335"
},
{
  "title": "KingsMan Barber Shop",
  "totalScore": 4.5,
  "reviewsCount": 17,
  "street": "J5HW+84C",
  "city": "Seeb",
  "phone": "+968 7691 9985"
}
]

async def seed():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Create Category: Grooming for men
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'grooming-for-men' LIMIT 1"))
        row = res.fetchone()
        if not row:
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, is_featured, created_at) VALUES ('Grooming for men', 'العناية الشخصية للرجال', 'grooming-for-men', true, now()) RETURNING id"))
            cat_id = res.fetchone()[0]
        else:
            cat_id = row[0]

        # Muscat Governorate
        res = await session.execute(text("SELECT id FROM governorates WHERE slug = 'muscat' LIMIT 1"))
        muscat_id = res.fetchone()[0]
        
        # Vendor User
        res = await session.execute(text("SELECT id FROM users LIMIT 1"))
        vendor_id = res.fetchone()[0]

        async def insert_biz(data, category_id):
            name_en = data.get("title", "Unnamed")
            slug = slugify(name_en)[:200]
            phone = data.get("phone", "")
            address = data.get("street", "Muscat")
            if not address: address = "Muscat"
            
            res = await session.execute(text("SELECT id FROM businesses WHERE slug = :slug OR name_en = :name"), {"slug": slug, "name": name_en})
            if res.fetchone(): return
            
            biz_id = str(uuid.uuid4())
            await session.execute(text("""
                INSERT INTO businesses (
                    id, name_en, slug, phone, address, 
                    category_id, governorate_id, owner_id, 
                    is_verified, rating_avg, rating_count, status, plan, listing_type, created_at
                ) VALUES (
                    :id, :name, :slug, :phone, :address,
                    :cat_id, :gov_id, :owner_id,
                    true, :rating, :rcount, 'active', 'basic', 'standard', now()
                )
            """), {
                "id": biz_id, "name": name_en, "slug": slug, "phone": phone, "address": address,
                "cat_id": category_id, "gov_id": muscat_id, "owner_id": vendor_id,
                "rating": data.get("totalScore", 4.5) or 4.5, "rcount": data.get("reviewsCount", 10) or 10
            })

        print(f"Seeding {len(DATA)} businesses into Grooming for men...")
        for b in DATA:
            await insert_biz(b, cat_id)
            
        await session.commit()
        print("Successfully seeded Grooming for men data!")

if __name__ == "__main__":
    asyncio.run(seed())
