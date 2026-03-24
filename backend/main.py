from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from core.database import engine, Base
from fastapi.staticfiles import StaticFiles
from routers import businesses, catalog, reviews, admin, auth, services, upload, contact, bookings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if not exist (PostgreSQL tables managed via local pgAdmin/psql)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="UniteOman API",
    description="Oman's Business Directory API",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(businesses.router)
app.include_router(catalog.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(upload.router)
app.include_router(contact.router)
app.include_router(bookings.router)

# Mount local storage as static directory
import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
