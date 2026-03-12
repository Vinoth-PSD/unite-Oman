from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from core.database import engine, Base
from routers import businesses, catalog, reviews, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if not exist (Supabase handles migrations, this is for local dev)
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
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(businesses.router)
app.include_router(catalog.router)
app.include_router(reviews.router)
app.include_router(admin.router)

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
