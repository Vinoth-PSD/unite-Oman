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

from fastapi import Request
@app.middleware("http")
async def log_requests(request: Request, call_next):
    try:
        response = await call_next(request)
        response_body = b""
        async for chunk in response.body_iterator:
            response_body += chunk
        
        from fastapi.responses import Response
        new_response = Response(
            content=response_body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type
        )
        
        log_msg = f"{request.method} {request.url} -> {response.status_code} | Body: {response_body[:200].decode(errors='ignore')}\n"
        with open("/tmp/debug_requests.log", "a") as f:
            f.write(log_msg)
            
        return new_response
    except Exception as e:
        with open("/tmp/debug_requests.log", "a") as f:
            f.write(f"{request.method} {request.url} -> ERROR: {str(e)}\n")
        raise e

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
