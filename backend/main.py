from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from core.database import engine, Base
from fastapi.staticfiles import StaticFiles
from routers import businesses, catalog, reviews, admin, auth, services, upload, contact, bookings, ai_search

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
    allow_origins=settings.origins,
    allow_origin_regex="https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def manual_cors_middleware(request, call_next):
    if request.method == "OPTIONS":
        origin = request.headers.get("origin")
        if origin and ("localhost" in origin or "127.0.0.1" in origin):
            from fastapi import Response
            return Response(
                status_code=204,
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Credentials": "true",
                }
            )
    
    response = await call_next(request)
    origin = request.headers.get("origin")
    if origin and ("localhost" in origin or "127.0.0.1" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response

app.include_router(businesses.router)
app.include_router(catalog.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(upload.router)
app.include_router(contact.router)
app.include_router(bookings.router)
app.include_router(ai_search.router)

# Mount local storage as static directory
import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
