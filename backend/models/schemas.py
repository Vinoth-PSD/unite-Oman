from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from models.models import BusinessStatus, PlanType, ListingType

# ── Governorate ──────────────────────────────────────────────
class GovernorateOut(BaseModel):
    id: int
    name_en: str
    name_ar: str
    slug: str
    emoji: Optional[str]
    business_count: int
    class Config: from_attributes = True

# ── Category ─────────────────────────────────────────────────
class CategoryOut(BaseModel):
    id: int
    name_en: str
    name_ar: str
    slug: str
    icon: Optional[str]
    cover_image_url: Optional[str]
    description: Optional[str]
    business_count: int
    is_featured: bool
    class Config: from_attributes = True

# ── Business ─────────────────────────────────────────────────
class BusinessCard(BaseModel):
    id: UUID
    name_en: str
    name_ar: Optional[str]
    slug: str
    short_description: Optional[str]
    category: Optional[CategoryOut]
    governorate: Optional[GovernorateOut]
    logo_url: Optional[str]
    cover_image_url: Optional[str]
    phone: Optional[str]
    whatsapp: Optional[str]
    status: BusinessStatus
    plan: PlanType
    listing_type: ListingType
    is_verified: bool
    is_featured: bool
    rating_avg: Optional[float]
    rating_count: int
    view_count: int
    created_at: datetime
    class Config: from_attributes = True

class BusinessDetail(BusinessCard):
    description: Optional[str]
    email: Optional[str]
    website: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    gallery_urls: List[str]
    tags: List[str]
    business_hours: Optional[Dict[str, Any]]

class BusinessCreate(BaseModel):
    name_en: str = Field(..., min_length=2, max_length=200)
    name_ar: Optional[str]
    description: Optional[str]
    short_description: Optional[str] = Field(None, max_length=300)
    category_id: int
    governorate_id: int
    tags: List[str] = []
    phone: Optional[str]
    whatsapp: Optional[str]
    email: Optional[EmailStr]
    website: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    business_hours: Optional[Dict[str, Any]] = {}

class BusinessUpdate(BaseModel):
    name_en: Optional[str]
    name_ar: Optional[str]
    description: Optional[str]
    short_description: Optional[str]
    category_id: Optional[int]
    governorate_id: Optional[int]
    tags: Optional[List[str]]
    phone: Optional[str]
    whatsapp: Optional[str]
    email: Optional[EmailStr]
    website: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    logo_url: Optional[str]
    cover_image_url: Optional[str]
    gallery_urls: Optional[List[str]]
    business_hours: Optional[Dict[str, Any]]

class AdminBusinessUpdate(BusinessUpdate):
    status: Optional[BusinessStatus]
    plan: Optional[PlanType]
    listing_type: Optional[ListingType]
    is_verified: Optional[bool]
    is_featured: Optional[bool]

# ── Review ───────────────────────────────────────────────────
class ReviewOut(BaseModel):
    id: UUID
    reviewer_name: Optional[str]
    rating: int
    comment: Optional[str]
    is_verified: bool
    created_at: datetime
    class Config: from_attributes = True

class ReviewCreate(BaseModel):
    business_id: UUID
    reviewer_name: str = Field(..., min_length=2)
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)

# ── Pagination ───────────────────────────────────────────────
class PaginatedBusinesses(BaseModel):
    items: List[BusinessCard]
    total: int
    page: int
    per_page: int
    pages: int

# ── Stats ────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_businesses: int
    active_businesses: int
    pending_businesses: int
    total_reviews: int
    total_categories: int
    total_governorates: int
    featured_businesses: int

# ── Auth ─────────────────────────────────────────────────────
class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
