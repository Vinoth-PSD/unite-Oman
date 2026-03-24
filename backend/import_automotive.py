import asyncio
import json
import uuid
from sqlalchemy import text
from core.database import engine
from slugify import slugify

car_repair_data = [
  {
    "title": "Naser - Car Maintenance Services At Your Home",
    "totalScore": 4.9,
    "reviewsCount": 840,
    "street": "Building Office 27, Street 4312 Building 4583 Al Sherif, South Khuwair",
    "city": "Muscat",
    "website": "http://callnaser.com/",
    "phone": "+968 7190 2000",
    "categories": ["Car repair and maintenance service", "Car inspection station"],
    "url": "https://www.google.com/maps/search/?api=1&query=Naser%20-%20Car%20Maintenance%20Services%20At%20Your%20Home&query_place_id=ChIJYwdkECID7WcRvg3WQZhiVvU"
  },
  {
    "title": "Exotic Car Center",
    "totalScore": 4.8,
    "reviewsCount": 45,
    "city": "Muscat",
    "phone": "+968 9595 1116",
    "categories": ["Auto repair shop"],
    "url": "https://www.google.com/maps/search/?api=1&query=Exotic%20Car%20Center&query_place_id=ChIJe4Rr4zEBjj4Rh3Ma8_T83wo"
  },
  {
    "title": "Naseem Auto workshop and Spare parts ورشة محمد نسيم لتصليح السيارات",
    "totalScore": 4.6,
    "reviewsCount": 161,
    "street": "Ghala As Sinaiyyah St",
    "city": "Muscat",
    "phone": "+968 9592 8800",
    "categories": ["Auto repair shop", "Auto air conditioning service"],
    "url": "https://www.google.com/maps/search/?api=1&query=Naseem%20Auto%20workshop&query_place_id=ChIJNyT1yUkBjj4RJm42Fpv_5XI"
  },
  {
    "title": "Car Service Repair & Maintenance , Mabela Muscat ,Oman [ExpressLanes]",
    "totalScore": 4.9,
    "reviewsCount": 135,
    "city": "Seeb",
    "website": "https://www.expresslanes.om/",
    "phone": "+968 9965 8007",
    "categories": ["Car repair and maintenance service"],
    "url": "https://www.google.com/maps/search/?api=1&query=ExpressLanes&query_place_id=ChIJQ3MQW2nnjT4RfG19NcNMSrU"
  },
  {
    "title": "Steering Car Care ورشة محمد العبدلي",
    "totalScore": 4.9,
    "reviewsCount": 199,
    "street": "ROAD NO: 7 OPPOSITE PHOTO SHOP",
    "city": "Seeb",
    "phone": "+968 9721 3321",
    "categories": ["Auto repair shop"],
    "url": "https://www.google.com/maps/search/?api=1&query=Steering%20Car%20Care&query_place_id=ChIJudtwOQvljT4R6ig7qA2xzo8"
  }
]

car_rental_data = [
  {
    "title": "Cruise Car Rental Muscat",
    "totalScore": 5,
    "reviewsCount": 623,
    "street": "swiss-BeLiNN Muscat, Al anwar street",
    "city": "Muscat",
    "website": "https://www.cruisecarhire.com/",
    "phone": "+968 7150 2008",
    "categories": ["Car rental agency"],
    "url": "https://www.google.com/maps/search/?api=1&query=Cruise%20Car%20Rental%20Muscat&query_place_id=ChIJV0PE2vv_kT4RC7XDmHl2IGs"
  },
  {
    "title": "NAB Rent A Car Near Muscat Airport",
    "totalScore": 4.9,
    "reviewsCount": 303,
    "street": "Gate Hotel, Building 1/901, Way Number: 6212",
    "city": "Muscat",
    "website": "http://nabrentacar.com/",
    "phone": "+968 9177 0169",
    "categories": ["Car rental agency"],
    "url": "https://www.google.com/maps/search/?api=1&query=NAB%20Rent%20A%20Car&query_place_id=ChIJ4ZUIwp8Bjj4R-uNTgHxfVic"
  },
  {
    "title": "Mersad Car Rental, Tours & Executive Chauffeur Service – Muscat",
    "totalScore": 5,
    "reviewsCount": 649,
    "city": "Muscat",
    "website": "https://mersadcarrental.com/",
    "phone": "+968 9408 2709",
    "categories": ["Car rental agency"],
    "url": "https://www.google.com/maps/search/?api=1&query=Mersad%20Car%20Rental&query_place_id=ChIJIXVIkYD_kT4RmQ_a208rCMs"
  }
]

# I will only import a few from each to keep it clean and fast, 
# but the user provided many. I'll take the top ones.

async def import_data():
    repair_id = 27
    rental_id = 26
    muscat_id = 1
    
    repair_img = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80"
    rental_img = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80"
    logo_img = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop"

    with open('/tmp/car_repair.json', 'r') as f:
        repairs = json.load(f)
    with open('/tmp/car_rental.json', 'r') as f:
        rentals = json.load(f)

    async with engine.begin() as conn:
        # Import Repairs
        for item in repairs:
            slug = slugify(item["title"])
            res = await conn.execute(text("SELECT id FROM businesses WHERE slug = :slug"), {"slug": slug})
            if not res.fetchone():
                print(f"Importing Repair: {item['title']}")
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
                    "cat": repair_id,
                    "gov": muscat_id,
                    "desc": f"Professional car repair services in {item.get('city', 'Muscat')}, Oman.",
                    "addr": item.get("street") or item.get("city", "Muscat"),
                    "phone": item.get("phone"),
                    "web": item.get("website"),
                    "rate": item.get("totalScore", 0),
                    "count": item.get("reviewsCount", 0),
                    "cover": repair_img,
                    "logo": logo_img,
                    "gall": [repair_img]
                })

        # Import Rentals
        for item in rentals:
            slug = slugify(item["title"])
            res = await conn.execute(text("SELECT id FROM businesses WHERE slug = :slug"), {"slug": slug})
            if not res.fetchone():
                print(f"Importing Rental: {item['title']}")
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
                    "cat": rental_id,
                    "gov": muscat_id,
                    "desc": f"Reliable car rental and leasing in {item.get('city', 'Muscat')}, Oman.",
                    "addr": item.get("street") or item.get("city", "Muscat"),
                    "phone": item.get("phone"),
                    "web": item.get("website"),
                    "rate": item.get("totalScore", 0),
                    "count": item.get("reviewsCount", 0),
                    "cover": rental_img,
                    "logo": logo_img,
                    "gall": [rental_img]
                })

    print("Import complete.")

if __name__ == "__main__":
    asyncio.run(import_data())
