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
    emoji: Optional[str] = None
    business_count: int = 0
    class Config: from_attributes = True

# ── Category ─────────────────────────────────────────────────
class CategoryOut(BaseModel):
    id: int
    name_en: str
    name_ar: str
    slug: str
    icon: Optional[str] = None
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    business_count: int = 0
    is_featured: bool = False
    class Config: from_attributes = True

class CategoryCreate(BaseModel):
    name_en: str = Field(..., min_length=2, max_length=100)
    name_ar: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    icon: Optional[str] = None
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    is_featured: bool = False
    sort_order: Optional[int] = 0

class CategoryUpdate(BaseModel):
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    slug: Optional[str] = None
    icon: Optional[str] = None
    cover_image_url: Optional[str] = None
    description: Optional[str] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None

# ── Business ─────────────────────────────────────────────────
class BusinessCard(BaseModel):
    id: UUID
    name_en: str
    name_ar: Optional[str] = None
    slug: str
    short_description: Optional[str] = None
    category: Optional[CategoryOut] = None
    governorate: Optional[GovernorateOut] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    status: BusinessStatus = BusinessStatus.pending
    plan: PlanType = PlanType.basic
    listing_type: ListingType = ListingType.standard
    is_verified: bool = False
    is_featured: bool = False
    rating_avg: Optional[float] = 0
    rating_count: int = 0
    view_count: int = 0
    gallery_urls: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    owner_email: Optional[str] = None
    created_at: datetime
    class Config: from_attributes = True

class BusinessDetail(BusinessCard):
    description: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gallery_urls: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    business_hours: Optional[Dict[str, Any]] = {}
    services: Optional[List["ServiceOut"]] = []

class BusinessCreate(BaseModel):
    name_en: str = Field(..., min_length=2, max_length=200)
    name_ar: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=300)
    category_id: int
    governorate_id: int
    tags: List[str] = []
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    business_hours: Optional[Dict[str, Any]] = {}

class BusinessUpdate(BaseModel):
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[int] = None
    governorate_id: Optional[int] = None
    tags: Optional[List[str]] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    logo_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    gallery_urls: Optional[List[str]] = None
    business_hours: Optional[Dict[str, Any]] = None

class AdminBusinessUpdate(BusinessUpdate):
    status: Optional[BusinessStatus] = None
    plan: Optional[PlanType] = None
    listing_type: Optional[ListingType] = None
    is_verified: Optional[bool] = None
    is_featured: Optional[bool] = None

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

class VendorStats(BaseModel):
    total_reviews: int
    avg_rating: float
    total_services: int
    total_views: int


# ── Service ─────────────────────────────────────────────────
class ServiceOut(BaseModel):
    id: UUID
    business_id: UUID
    name: str
    description: Optional[str]
    price: Optional[str]
    created_at: datetime
    class Config: from_attributes = True

class ServiceCreate(BaseModel):
    business_id: UUID
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    price: Optional[str] = None

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None

# ── Auth ─────────────────────────────────────────────────────
class AdminLogin(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=6)

class VendorRegister(BaseModel):
    # User info
    email: str
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100) # Match frontend
    
    # Business info
    business_name: str = Field(..., min_length=2, max_length=200)
    category_id: int
    location_id: int # Match frontend
    address: Optional[str] = None
    phone: Optional[str] = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SearchSuggestion(BaseModel):
    id: str # UUID or int as string
    name: str
    type: str  # "business", "category"
    slug: str
    icon: Optional[str] = None

# ── Contact Message ───────────────────────────────────────────
class ContactMessageOut(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    is_read: bool
    created_at: datetime
    class Config: from_attributes = True

class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    subject: str = Field(..., min_length=2, max_length=300)
    message: str = Field(..., min_length=2)

# ── Booking ──────────────────────────────────────────────────
class BookingOut(BaseModel):
    id: UUID
    business_id: UUID
    name: str
    email: str
    phone: str
    service: Optional[str] = None
    date: str
    time: str
    status: str
    created_at: datetime
    
    # Nested business info can be useful for vendor view
    business_name: Optional[str] = None 

    class Config: from_attributes = True

class BookingCreate(BaseModel):
    business_id: UUID
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=8, max_length=20)
    service: Optional[str] = None
    date: str
    time: str

class BookingUpdateStatus(BaseModel):
    status: str # pending, confirmed, cancelled
