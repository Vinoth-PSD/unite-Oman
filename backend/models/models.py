from sqlalchemy import Column, String, Integer, Boolean, Text, DECIMAL, ARRAY, JSON, ForeignKey, Enum as SAEnum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import enum
from core.database import Base

class BusinessStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"
    rejected = "rejected"

class PlanType(str, enum.Enum):
    basic = "basic"
    professional = "professional"
    enterprise = "enterprise"

class ListingType(str, enum.Enum):
    standard = "standard"
    featured = "featured"
    sponsored = "sponsored"

class Governorate(Base):
    __tablename__ = "governorates"
    id             = Column(Integer, primary_key=True)
    name_en        = Column(String(100), nullable=False)
    name_ar        = Column(String(100), nullable=False)
    slug           = Column(String(100), unique=True, nullable=False)
    emoji          = Column(String(10))
    business_count = Column(Integer, default=0)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    businesses     = relationship("Business", back_populates="governorate")

class Category(Base):
    __tablename__ = "categories"
    id              = Column(Integer, primary_key=True)
    name_en         = Column(String(100), nullable=False)
    name_ar         = Column(String(100), nullable=False)
    slug            = Column(String(100), unique=True, nullable=False)
    icon            = Column(String(10))
    cover_image_url = Column(Text)
    description     = Column(Text)
    business_count  = Column(Integer, default=0)
    is_featured     = Column(Boolean, default=False)
    sort_order      = Column(Integer, default=0)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    businesses      = relationship("Business", back_populates="category")

class Business(Base):
    __tablename__ = "businesses"
    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name_en           = Column(String(200), nullable=False)
    name_ar           = Column(String(200))
    slug              = Column(String(200), unique=True, nullable=False)
    description       = Column(Text)
    short_description = Column(String(300))
    category_id       = Column(Integer, ForeignKey("categories.id"))
    governorate_id    = Column(Integer, ForeignKey("governorates.id"))
    tags              = Column(ARRAY(Text), default=[])
    phone             = Column(String(20))
    whatsapp          = Column(String(20))
    email             = Column(String(200))
    website           = Column(String(300))
    address           = Column(Text)
    latitude          = Column(DECIMAL(10, 8))
    longitude         = Column(DECIMAL(11, 8))
    logo_url          = Column(Text)
    cover_image_url   = Column(Text)
    gallery_urls      = Column(ARRAY(Text), default=[])
    status            = Column(SAEnum(BusinessStatus), default=BusinessStatus.pending)
    plan              = Column(SAEnum(PlanType), default=PlanType.basic)
    listing_type      = Column(SAEnum(ListingType), default=ListingType.standard)
    is_verified       = Column(Boolean, default=False)
    is_featured       = Column(Boolean, default=False)
    business_hours    = Column(JSONB, default={})
    view_count        = Column(Integer, default=0)
    rating_avg        = Column(DECIMAL(3, 2), default=0)
    rating_count      = Column(Integer, default=0)
    owner_id          = Column(UUID(as_uuid=True))
    created_at        = Column(DateTime(timezone=True), server_default=func.now())
    updated_at        = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    category          = relationship("Category", back_populates="businesses")
    governorate       = relationship("Governorate", back_populates="businesses")
    reviews           = relationship("Review", back_populates="business", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id   = Column(UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="CASCADE"))
    user_id       = Column(UUID(as_uuid=True))
    reviewer_name = Column(String(100))
    rating        = Column(Integer)
    comment       = Column(Text)
    is_verified   = Column(Boolean, default=False)
    is_approved   = Column(Boolean, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    business      = relationship("Business", back_populates="reviews")
