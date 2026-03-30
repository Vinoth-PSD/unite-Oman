import asyncio
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from slugify import slugify
from dotenv import load_dotenv

# Load env from backend dir
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)
DATABASE_URL = os.getenv("DATABASE_URL")

DATA = [
{
  "title": "Women care pharmacy",
  "totalScore": 2,
  "reviewsCount": 3,
  "street": "Old Omantel building",
  "city": "Muscat",
  "categories": ["Pharmacy"]
},
{
  "title": "House of Chi",
  "totalScore": 5,
  "reviewsCount": 36,
  "street": "18th November St",
  "city": "Muscat",
  "categories": ["Yoga studio"]
},
{
  "title": "B.C.MUSCAT",
  "totalScore": 4.5,
  "reviewsCount": 10,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Dr. Bushra's Center",
  "totalScore": 5,
  "reviewsCount": 3,
  "street": "2135 Way",
  "city": "Muscat",
  "categories": ["Medical Center"]
},
{
  "title": "Humancare World Wide - Oman",
  "totalScore": 4.8,
  "reviewsCount": 4,
  "street": "Building No. 21, Office No. 34, Way 403",
  "city": "Muscat",
  "categories": ["Air ambulance service"]
},
{
  "title": "Avicen Pharmacy - Al Ansab",
  "totalScore": 4.4,
  "reviewsCount": 15,
  "street": "G8JX+39",
  "city": "Muscat",
  "categories": ["Pharmacy"]
},
{
  "title": "WATER-FRONT Muscat",
  "totalScore": 4.5,
  "reviewsCount": 2209,
  "street": "JF73+47X",
  "city": "Muscat",
  "categories": ["Shopping mall"]
},
{
  "title": "Rainbow Arokayal oman",
  "totalScore": 4,
  "reviewsCount": 7,
  "street": "J658+P74",
  "city": "Seeb",
  "categories": ["Wellness center"]
},
{
  "title": "Womens Guild in Oman",
  "totalScore": 4.5,
  "reviewsCount": 5,
  "street": "Villa 1728A",
  "city": "Muscat",
  "categories": ["Women's organization"]
},
{
  "title": "Science Traveller",
  "totalScore": 5,
  "reviewsCount": 5,
  "street": "Al Jami Al Akbar ST Ghala",
  "city": "Muscat",
  "categories": ["Yoga retreat center"]
},
{
  "title": "UFC GYM Seeb",
  "totalScore": 4.4,
  "reviewsCount": 257,
  "street": "Seeb St",
  "city": "Seeb",
  "categories": ["Gym"]
},
{
  "title": "Kairos",
  "totalScore": 4.6,
  "reviewsCount": 38,
  "street": "Unnamed Road",
  "city": "Seeb",
  "categories": ["Personal trainer"]
},
{
  "title": "Dr. Nutrition - Seeb",
  "totalScore": 4.8,
  "reviewsCount": 25,
  "street": "Al-Khoudh",
  "city": "Seeb",
  "categories": ["Vitamin & supplements store"]
},
{
  "title": "Amouage Manufacture",
  "totalScore": 4.6,
  "reviewsCount": 605,
  "street": "Amtrad, Al-Sib",
  "city": "Seeb",
  "categories": ["Perfume store"]
},
{
  "title": "Puzzle Supps",
  "totalScore": 4.9,
  "reviewsCount": 19,
  "street": "Al Azaiba",
  "city": "Muscat",
  "categories": ["Vitamin & supplements store"]
},
{
  "title": "Fusion Pharmacy",
  "totalScore": 4,
  "reviewsCount": 18,
  "street": "Al Jami Al Akbar Street",
  "city": "Muscat",
  "categories": ["Pharmacy"]
},
{
  "title": "Absolute Pools Oman",
  "totalScore": 4.5,
  "reviewsCount": 20,
  "street": "Al Ghubrah St",
  "city": "Muscat",
  "categories": ["Swimming pool contractor"]
},
{
  "title": "Dream Gym",
  "totalScore": 5,
  "reviewsCount": 2,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Gym"]
},
{
  "title": "Max Healthcare",
  "totalScore": 5,
  "reviewsCount": 3,
  "street": "Al Khuwair St",
  "city": "Muscat",
  "categories": ["Health consultant"]
},
{
  "title": "Maryana LLC",
  "totalScore": 4.1,
  "reviewsCount": 8,
  "street": "2505 Way",
  "city": "Muscat",
  "categories": ["Cosmetics store"]
},
{
  "title": "Yusuf-Livelovelifeagain",
  "totalScore": 5,
  "reviewsCount": 9,
  "street": "Al Nuzha St",
  "city": "Muscat",
  "categories": ["Life coach"]
},
{
  "title": "Dr. Nutrition - Grand Mall",
  "totalScore": 4.6,
  "reviewsCount": 77,
  "street": "Muscat Grand Mall",
  "city": "Muscat",
  "categories": ["Vitamin & supplements store"]
},
{
  "title": "Titan Fitness Club",
  "totalScore": 4.9,
  "reviewsCount": 18,
  "street": "HCW4+QX4",
  "city": "Muscat",
  "categories": ["Fitness center"]
},
{
  "title": "The Psychology Clinic",
  "totalScore": 5,
  "reviewsCount": 2,
  "street": "Rd No 53",
  "city": "Seeb",
  "categories": ["Wellness center"]
},
{
  "title": "Qimia Supplement",
  "totalScore": 4.5,
  "reviewsCount": 21,
  "street": "Al Marafah St",
  "city": "Seeb",
  "categories": ["Vitamin & supplements store"]
},
{
  "title": "Fitness Hub Oman",
  "totalScore": 3.4,
  "reviewsCount": 82,
  "street": "Qabas Mall",
  "city": "Muscat",
  "categories": ["Fitness center"]
},
{
  "title": "British Osteopathy Centre",
  "totalScore": 4.9,
  "reviewsCount": 225,
  "street": "Al Inshirah St",
  "city": "Muscat",
  "categories": ["Medical Center"]
},
{
  "title": "Spine Line Chiropractic",
  "totalScore": 4.8,
  "reviewsCount": 119,
  "street": "Bawshar St",
  "city": "Muscat",
  "categories": ["Chiropractor"]
},
{
  "title": "ZeNourish by Gayathri",
  "totalScore": 5,
  "reviewsCount": 100,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Wellness program"]
},
{
  "title": "Dr. Nutrition - Mall of Oman",
  "totalScore": 4.6,
  "reviewsCount": 55,
  "street": "Mall of Oman",
  "city": "Muscat",
  "categories": ["Vitamin & supplements store"]
},
{
  "title": "Healthy Vibes Physiotherapy",
  "totalScore": 5,
  "reviewsCount": 13,
  "street": "Muscat",
  "city": "Seeb",
  "categories": ["Physical therapy clinic"]
},
{
  "title": "Yoga City",
  "totalScore": 4.9,
  "reviewsCount": 93,
  "street": "Qurum Garden Building",
  "city": "Muscat",
  "categories": ["Yoga studio"]
},
{
  "title": "Al Manar Medical Centre",
  "totalScore": 4.6,
  "reviewsCount": 94,
  "street": "Al Mazoon St",
  "city": "Seeb",
  "categories": ["Ayurvedic clinic"]
},
{
  "title": "Al Manar Hijama Center",
  "totalScore": 4.1,
  "reviewsCount": 54,
  "street": "Al Khoudh",
  "city": "Seeb",
  "categories": ["Acupuncturist"]
},
{
  "title": "Spa by JW",
  "totalScore": 5,
  "reviewsCount": 5,
  "street": "JW Marriott Muscat",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "All Season Ayurveda Clinic",
  "totalScore": 4.3,
  "reviewsCount": 6,
  "street": "Al Khuwair",
  "city": "Muscat",
  "categories": ["Ayurvedic clinic"]
},
{
  "title": "Lovelyn Beauty Products",
  "totalScore": 3.5,
  "reviewsCount": 8,
  "street": "Noor Plaza",
  "city": "Seeb",
  "categories": ["Cosmetics store"]
},
{
  "title": "Azer Wellness Center",
  "totalScore": 4.8,
  "reviewsCount": 5,
  "street": "H4MW+QMP",
  "city": "Seeb",
  "categories": ["Gym"]
},
{
  "title": "Zanta spa",
  "totalScore": 4.9,
  "reviewsCount": 24,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Massage therapist"]
},
{
  "title": "Whispers of Serenity",
  "totalScore": 4.3,
  "reviewsCount": 62,
  "street": "18 November Street",
  "city": "Muscat",
  "categories": ["Mental health clinic"]
},
{
  "title": "AJ Fitness Al Khuwair",
  "totalScore": 4.8,
  "reviewsCount": 192,
  "street": "Al Khuwair",
  "city": "Muscat",
  "categories": ["Gym"]
},
{
  "title": "Red Carpet Center",
  "totalScore": 5,
  "reviewsCount": 1,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Trimz Spa & Barber",
  "totalScore": 4.3,
  "reviewsCount": 30,
  "street": "Sayh Al Malih St",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Diamond Stars Spa",
  "totalScore": 4.7,
  "reviewsCount": 44,
  "street": "Diamond Star Hotel",
  "city": "Seeb",
  "categories": ["Massage spa"]
},
{
  "title": "Calicut Ayurvedic Clinic",
  "totalScore": 4.7,
  "reviewsCount": 34,
  "street": "Mutrah High Street",
  "city": "Muscat",
  "categories": ["Hospital"]
},
{
  "title": "Johnny Spa & Massage",
  "totalScore": 3.7,
  "reviewsCount": 15,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Crescent Spa 5",
  "totalScore": 3.4,
  "reviewsCount": 43,
  "street": "Al Ghubrah St",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Fashion & Beauty Centre",
  "totalScore": 3.7,
  "reviewsCount": 7,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Shopping mall"]
},
{
  "title": "Lanna Thai Spa",
  "totalScore": 3.5,
  "reviewsCount": 33,
  "street": "Panorama Mall",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Wawan Ladies Gym",
  "totalScore": 4.3,
  "reviewsCount": 44,
  "street": "Seeb",
  "city": "Seeb",
  "categories": ["Gym"]
},
{
  "title": "Taimly Fitness",
  "totalScore": 4.9,
  "reviewsCount": 12,
  "street": "AL Khoud 6",
  "city": "Seeb",
  "categories": ["Fitness center"]
},
{
  "title": "Romansia Beauty Centre",
  "totalScore": 4.1,
  "reviewsCount": 67,
  "street": "Al Ghubrah St",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Beauty land",
  "totalScore": 5,
  "reviewsCount": 1,
  "street": "Seeb",
  "city": "Muscat",
  "categories": ["Cosmetics store"]
},
{
  "title": "Beauty & Shape Station",
  "totalScore": 5,
  "reviewsCount": 5,
  "street": "H9JV+HXG",
  "city": "Muscat",
  "categories": ["Store"]
},
{
  "title": "Nirvaana Centre",
  "totalScore": 5,
  "reviewsCount": 1,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "The beauty factory spa",
  "totalScore": 4.3,
  "reviewsCount": 4,
  "street": "Al Barakat St",
  "city": "Seeb",
  "categories": ["Beauty salon"]
},
{
  "title": "Lanna Grand Spa",
  "totalScore": 4.9,
  "reviewsCount": 11,
  "street": "Al Khuwair St",
  "city": "Muscat",
  "categories": ["Spa and health club"]
},
{
  "title": "Recovery Station",
  "totalScore": 4.9,
  "reviewsCount": 335,
  "street": "18th November St",
  "city": "Muscat",
  "categories": ["Physical therapy clinic"]
},
{
  "title": "Foot Repose",
  "totalScore": 4.1,
  "reviewsCount": 91,
  "street": "Al Ghubrah St",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "National Wellness Centre",
  "totalScore": 5,
  "reviewsCount": 1,
  "street": "Bawshar St",
  "city": "Muscat",
  "categories": ["Rehabilitation center"]
},
{
  "title": "4guys Spa & Massage",
  "totalScore": 4.1,
  "reviewsCount": 24,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Zina Spa Al Khuwair",
  "totalScore": 3.1,
  "reviewsCount": 22,
  "street": "Dauhat Al Adab St",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Echo Wellness",
  "totalScore": 5,
  "reviewsCount": 6,
  "street": "Al Inshirah St",
  "city": "Muscat",
  "categories": ["Rehabilitation center"]
},
{
  "title": "MT Foot massage",
  "totalScore": 5,
  "reviewsCount": 5,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Melos Wellness & Beauty Spa",
  "totalScore": 4.8,
  "reviewsCount": 28,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Dax and Wax Spa",
  "totalScore": 4.8,
  "reviewsCount": 280,
  "street": "Bawshar St",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Crescent Spa 12",
  "totalScore": 4.1,
  "reviewsCount": 11,
  "street": "Al Nahdah St",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Guerlain Spa",
  "totalScore": 4.5,
  "reviewsCount": 11,
  "street": "Al Mouj",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Gypsy Beauty Salon",
  "totalScore": 4.1,
  "reviewsCount": 25,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Serene beauty spa",
  "totalScore": 3.3,
  "reviewsCount": 3,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Wellness Medical Centre",
  "totalScore": 4.6,
  "reviewsCount": 104,
  "street": "Wadi Kabir",
  "city": "Muscat",
  "categories": ["Medical Center"]
},
{
  "title": "Diamond Spa & Massage",
  "totalScore": 4,
  "reviewsCount": 64,
  "street": "Bousher",
  "city": "Muscat",
  "categories": ["Health spa"]
},
{
  "title": "Serenity beauty spa",
  "totalScore": 4.9,
  "reviewsCount": 50,
  "street": "Almabila",
  "city": "Seeb",
  "categories": ["Beauty salon"]
},
{
  "title": "Saham Ayurvedic Hospital",
  "totalScore": 5,
  "reviewsCount": 26,
  "street": "Sarooj Street",
  "city": "Muscat",
  "categories": ["Ayurvedic clinic"]
},
{
  "title": "Quantum Biofeedback",
  "totalScore": 4.5,
  "reviewsCount": 5,
  "street": "Busher",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "PALM SPA",
  "totalScore": 4.1,
  "reviewsCount": 112,
  "street": "HCWF+FQQ",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Jasmine For Her",
  "totalScore": 4.2,
  "reviewsCount": 64,
  "street": "Azaiba",
  "city": "Muscat",
  "categories": ["Gym"]
},
{
  "title": "Beauty World Centre",
  "totalScore": 3.2,
  "reviewsCount": 10,
  "street": "Mazoun St",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "JellyBon Beauty Express",
  "totalScore": 4.6,
  "reviewsCount": 50,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Grand Inn Spa",
  "totalScore": 4.8,
  "reviewsCount": 16,
  "street": "Bawshar St",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Sabino Spa",
  "totalScore": 4.3,
  "reviewsCount": 61,
  "street": "Marafah Street",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Frostfit oman",
  "totalScore": 5,
  "reviewsCount": 13,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Wishah Spa",
  "totalScore": 4,
  "reviewsCount": 111,
  "street": "Al Khuwair",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Lunar Spa",
  "totalScore": 4.5,
  "reviewsCount": 2,
  "street": "Dauhat Al Adab St",
  "city": "Muscat",
  "categories": ["Spa and health club"]
},
{
  "title": "Kempinski Spa",
  "totalScore": 4.7,
  "reviewsCount": 32,
  "street": "Street 6",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Cocon Spa",
  "totalScore": 4.1,
  "reviewsCount": 7,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Ayesha Beauty Secrets",
  "totalScore": 4.2,
  "reviewsCount": 27,
  "street": "Al Ghubrah St",
  "city": "Muscat",
  "categories": ["Cosmetics store"]
},
{
  "title": "Vividsoul therapy",
  "totalScore": 3.5,
  "reviewsCount": 8,
  "street": "Al Maha St",
  "city": "Muscat",
  "categories": ["Wellness program"]
},
{
  "title": "Samaher Spa",
  "totalScore": 5,
  "reviewsCount": 2,
  "street": "North Al Ghubrah",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Hair space spa",
  "totalScore": 4.4,
  "reviewsCount": 15,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Fitness Lab",
  "totalScore": 3.4,
  "reviewsCount": 21,
  "street": "Grand Mall",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Amore Beauty",
  "totalScore": 4.9,
  "reviewsCount": 40,
  "street": "Al Maha St",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "BEAUTY EXPERTS",
  "totalScore": 4.5,
  "reviewsCount": 48,
  "street": "Al Mazoon St",
  "city": "Seeb",
  "categories": ["Beauty salon"]
},
{
  "title": "Crystal Beauty Salon",
  "totalScore": 4.4,
  "reviewsCount": 62,
  "street": "Street 6",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "SOTA BEAUTY & SPA",
  "totalScore": 4.7,
  "reviewsCount": 6,
  "street": "Al Mawaleh South",
  "city": "Seeb",
  "categories": ["Beauty salon"]
},
{
  "title": "Raz Salon and Spa",
  "totalScore": 4.4,
  "reviewsCount": 45,
  "street": "Al Athaiba street",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Muscat Osteopathy",
  "totalScore": 4.3,
  "reviewsCount": 15,
  "street": "Al Mauj St",
  "city": "Muscat",
  "categories": ["Osteopath"]
},
{
  "title": "AWAY Spa Muscat",
  "totalScore": 4.4,
  "reviewsCount": 17,
  "street": "Bareeq Al Shatti",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Stones Spa",
  "totalScore": 4.5,
  "reviewsCount": 26,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Bamboo Spa",
  "totalScore": 4.7,
  "reviewsCount": 316,
  "street": "3013 Way",
  "city": "Muscat",
  "categories": ["Day spa"]
},
{
  "title": "Maria Rose Beauty",
  "totalScore": 4.4,
  "reviewsCount": 51,
  "street": "Al Amirat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Pilates Wellness Studio",
  "totalScore": 5,
  "reviewsCount": 13,
  "street": "Seeb",
  "city": "Seeb",
  "categories": ["Pilates studio"]
},
{
  "title": "Age Care Clinic",
  "totalScore": 4.9,
  "reviewsCount": 22,
  "street": "Sayh Al Malih St",
  "city": "Muscat",
  "categories": ["Medical clinic"]
},
{
  "title": "Celeste Beauty Lounge",
  "totalScore": 4.9,
  "reviewsCount": 138,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Flow of Life",
  "totalScore": 5,
  "reviewsCount": 2,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Assort Spa & Salon",
  "totalScore": 4.9,
  "reviewsCount": 674,
  "street": "Al Mazoon St",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Mass beauty center",
  "totalScore": 4,
  "reviewsCount": 25,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Community Wellness",
  "totalScore": 4.8,
  "reviewsCount": 43,
  "street": "Mina Al Fahel St",
  "city": "Muscat",
  "categories": ["Fitness center"]
},
{
  "title": "Massage Muscat Alaa",
  "totalScore": 5,
  "reviewsCount": 42,
  "street": "Al Maha St",
  "city": "Muscat",
  "categories": ["Spa and health club"]
},
{
  "title": "Energy Healing Centre",
  "totalScore": 4.6,
  "reviewsCount": 14,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Enhance Beauty Lounge",
  "totalScore": 4.8,
  "reviewsCount": 32,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Tokyo Beauty Lounge",
  "totalScore": 4.2,
  "reviewsCount": 23,
  "street": "18th November St",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Vibes Hair & Beauty",
  "totalScore": 4.6,
  "reviewsCount": 378,
  "street": "1735 Way",
  "city": "Muscat",
  "categories": ["Hairdresser"]
},
{
  "title": "Em Beauty Lounge",
  "totalScore": 4.9,
  "reviewsCount": 70,
  "street": "Mazoon St",
  "city": "Seeb",
  "categories": ["Beauty salon"]
},
{
  "title": "Ayana Spa",
  "totalScore": 4.6,
  "reviewsCount": 356,
  "street": "Al Kharjiyah Street",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Women Elegance Center",
  "totalScore": 5,
  "reviewsCount": 1,
  "street": "HCQR+J87",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Miss Beauty Salon",
  "totalScore": 4.4,
  "reviewsCount": 38,
  "street": "18th November St",
  "city": "Muscat",
  "categories": ["Beauty product supplier"]
},
{
  "title": "Tribes Men's Spa",
  "totalScore": 4.9,
  "reviewsCount": 636,
  "street": "Al Khuwair",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Ombre Beauty Centre",
  "totalScore": 4.8,
  "reviewsCount": 371,
  "street": "Al Khuwair",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Nature's Beauty Salon",
  "totalScore": 4.7,
  "reviewsCount": 16,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Charm Head Spa",
  "totalScore": 4.1,
  "reviewsCount": 17,
  "street": "Al Maha St",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Queen Skin Care",
  "totalScore": 4.4,
  "reviewsCount": 14,
  "street": "Al Khuwair St",
  "city": "Muscat",
  "categories": ["Health and beauty shop"]
},
{
  "title": "Boudoir Boutique",
  "totalScore": 4.3,
  "reviewsCount": 60,
  "street": "3017 Way",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "FOOT REPOSE Ladies",
  "totalScore": 4.5,
  "reviewsCount": 319,
  "street": "Al Maha St",
  "city": "Muscat",
  "categories": ["Massage spa"]
},
{
  "title": "Balance Ayurveda Center",
  "totalScore": 4.9,
  "reviewsCount": 100,
  "street": "Way 3905",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Naturevillage Spa",
  "totalScore": 5,
  "reviewsCount": 15,
  "street": "Hay Al Biydha",
  "city": "Muscat",
  "categories": ["Cosmetic products manufacturer"]
},
{
  "title": "Seema Beauty Zone",
  "totalScore": 3.8,
  "reviewsCount": 39,
  "street": "Al Mazoon St",
  "city": "Muscat",
  "categories": ["Beautician"]
},
{
  "title": "M BEAUTY SPA",
  "totalScore": 4.7,
  "reviewsCount": 38,
  "street": "Orchid Residences",
  "city": "Seeb",
  "categories": ["Spa"]
},
{
  "title": "Sri Sri Tattva Panchakarma",
  "totalScore": 4.2,
  "reviewsCount": 98,
  "street": "Alkhuwair",
  "city": "Muscat",
  "categories": ["Ayurvedic clinic"]
},
{
  "title": "QUWA WELLNESS STUDIO",
  "totalScore": 5,
  "reviewsCount": 14,
  "street": "Seeb Club",
  "city": "Muscat",
  "categories": ["Personal trainer"]
},
{
  "title": "Simia Medi Spa",
  "totalScore": 4.7,
  "reviewsCount": 126,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Medical spa"]
},
{
  "title": "Dhekrayat Spa & Salon",
  "totalScore": 4.7,
  "reviewsCount": 98,
  "street": "Al Qurum",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Flow Studio",
  "totalScore": 5,
  "reviewsCount": 9,
  "street": "Al Maha St",
  "city": "Bousher",
  "categories": ["Wellness center"]
},
{
  "title": "Naz Beauty Lounge",
  "totalScore": 4.8,
  "reviewsCount": 112,
  "street": "MBD",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Muscat Rose Beauty care",
  "totalScore": 4.9,
  "reviewsCount": 29,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Mind & Body Wellness",
  "totalScore": 5,
  "reviewsCount": 2,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Flaunt Beauty Salon",
  "totalScore": 5,
  "reviewsCount": 23,
  "street": "Mina Al Fahal",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Jasmine Beauty and Spa",
  "totalScore": 4.9,
  "reviewsCount": 56,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Azer Wellness Center (Boshar)",
  "totalScore": 4.6,
  "reviewsCount": 23,
  "street": "Boshar",
  "city": "Muscat",
  "categories": ["Gym"]
},
{
  "title": "M BEAUTY SPA (SAROOJ)",
  "totalScore": 5,
  "reviewsCount": 13,
  "street": "Al Sarooj",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "7's Seven's Wellness",
  "totalScore": 4.9,
  "reviewsCount": 17,
  "street": "Al Barakat St",
  "city": "Seeb",
  "categories": ["Gym"]
},
{
  "title": "LYFT Wellness",
  "totalScore": 4.5,
  "reviewsCount": 92,
  "street": "Al Khoudh",
  "city": "Muscat",
  "categories": ["Fitness center"]
},
{
  "title": "Orange Salon and Spa",
  "totalScore": 4.5,
  "reviewsCount": 108,
  "street": "18th November St",
  "city": "Muscat",
  "categories": ["Day spa"]
},
{
  "title": "Europe Beauty Parlour",
  "totalScore": 4.6,
  "reviewsCount": 205,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Secrets Spa",
  "totalScore": 4.8,
  "reviewsCount": 58,
  "street": "Al Maha St",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "The Wellness Centre Wave",
  "totalScore": 4.2,
  "reviewsCount": 112,
  "street": "The Wave",
  "city": "Muscat",
  "categories": ["Gym"]
},
{
  "title": "Women's world saloon Ruwi",
  "totalScore": 4.9,
  "reviewsCount": 18,
  "street": "Mumtaz Area",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Revive Salon Spa Men",
  "totalScore": 4.1,
  "reviewsCount": 53,
  "street": "Muscat",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Aaradhya Beauty Center",
  "totalScore": 4.9,
  "reviewsCount": 133,
  "street": "azaiba",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "VLCC Sarooj",
  "totalScore": 4.3,
  "reviewsCount": 223,
  "street": "Sarooj",
  "city": "Muscat",
  "categories": ["Weight loss service"]
},
{
  "title": "Castle Of Beauty",
  "totalScore": 4.6,
  "reviewsCount": 73,
  "street": "Al Qurm St",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Ethereal Beauty Salon",
  "totalScore": 4.9,
  "reviewsCount": 42,
  "street": "3921 Way",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Magnificent Sense Beauty",
  "totalScore": 4.6,
  "reviewsCount": 127,
  "street": "Al Khuwair South",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Elysian Beauty Spa",
  "totalScore": 4.3,
  "reviewsCount": 80,
  "street": "Al Qurm St",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "Studio Bless Beauty",
  "totalScore": 4.9,
  "reviewsCount": 20,
  "street": "Azaibah Mall",
  "city": "Muscat",
  "categories": ["Day spa"]
},
{
  "title": "Melos Wellness Seeb",
  "totalScore": 4.8,
  "reviewsCount": 28,
  "street": "Al Rauda St",
  "city": "Seeb",
  "categories": ["Spa"]
},
{
  "title": "Jinanz Beauty & Spa",
  "totalScore": 4.7,
  "reviewsCount": 61,
  "street": "Al Qurm",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Essence Spa for Women",
  "totalScore": 4.3,
  "reviewsCount": 174,
  "street": "Al Inshirah St",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Lime Spa",
  "totalScore": 5,
  "reviewsCount": 95,
  "street": "Al Khuwair",
  "city": "Al Khuwair",
  "categories": ["Spa"]
},
{
  "title": "Nice Lady Boutique",
  "totalScore": 4.6,
  "reviewsCount": 35,
  "street": "4712 Way",
  "city": "Muscat",
  "categories": ["Spa"]
},
{
  "title": "Madera Wellness",
  "totalScore": 5,
  "reviewsCount": 40,
  "street": "Street 3635",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Luban Oman Boutique",
  "totalScore": 5,
  "reviewsCount": 3,
  "street": "Jawharat Al Shati",
  "city": "Muscat",
  "categories": ["Health and beauty shop"]
},
{
  "title": "Longevity Health Clinic",
  "totalScore": 4.6,
  "reviewsCount": 14,
  "street": "Shatti Al Qurum",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Beautiful Ladies Center",
  "totalScore": 4.3,
  "reviewsCount": 41,
  "street": "Al Khuwair 33",
  "city": "Muscat",
  "categories": ["Beauty salon"]
},
{
  "title": "VLCC Al Mawaleh",
  "totalScore": 4.5,
  "reviewsCount": 384,
  "street": "Al Mawaleh",
  "city": "Muscat",
  "categories": ["Weight loss service"]
},
{
  "title": "B28 Korea wellness",
  "totalScore": 4.8,
  "reviewsCount": 196,
  "street": "6829 Way",
  "city": "Muscat",
  "categories": ["Wellness center"]
},
{
  "title": "Mojo Massage Women",
  "totalScore": 4.6,
  "reviewsCount": 41,
  "street": "Dauhat Al Adab St",
  "city": "Muscat",
  "categories": ["Massage therapist"]
},
{
  "title": "Beauty Centre by JellyBon",
  "totalScore": 4.6,
  "reviewsCount": 83,
  "street": "Al Inshirah St",
  "city": "Muscat",
  "categories": ["Beauty salon"]
}
]

async def seed():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Get/Create Parent: Beauty & Wellness
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'beauty-wellness' LIMIT 1"))
        row = res.fetchone()
        if not row:
            # Fallback to general category if specific one not found
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, is_featured, created_at) VALUES ('Beauty & Wellness', 'الجمال والعافية', 'beauty-wellness', true, now()) RETURNING id"))
            parent_id = res.fetchone()[0]
        else:
            parent_id = row[0]
            
        # Get/Create Sub: Beauty & Wellness for Women
        res = await session.execute(text("SELECT id FROM categories WHERE slug = 'beauty-wellness-women' LIMIT 1"))
        row = res.fetchone()
        if not row:
            res = await session.execute(text("INSERT INTO categories (name_en, name_ar, slug, parent_id, created_at) VALUES ('Beauty & Wellness for Women', 'الجمال والعافية للنساء', 'beauty-wellness-women', :pid, now()) RETURNING id"), {"pid": parent_id})
            sub_id = res.fetchone()[0]
        else:
            sub_id = row[0]

        # Muscat Governorate
        res = await session.execute(text("SELECT id FROM governorates WHERE slug = 'muscat' LIMIT 1"))
        muscat_id = res.fetchone()[0]
        
        # Vendor User
        res = await session.execute(text("SELECT id FROM users LIMIT 1"))
        vendor_id = res.fetchone()[0]

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
                "rating": data.get("totalScore", 4.0) or 4.0, "rcount": data.get("reviewsCount", 0) or 0
            })

        print(f"Seeding {len(DATA)} businesses...")
        for b in DATA:
            await insert_biz(b, sub_id)
            
        await session.commit()
        print("Successfully seeded Beauty & Wellness for Women data!")

if __name__ == "__main__":
    asyncio.run(seed())
