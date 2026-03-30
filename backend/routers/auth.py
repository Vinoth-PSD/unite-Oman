from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import bcrypt
import uuid
from slugify import slugify
from core.database import get_db
from core.auth import create_access_token, verify_password, get_password_hash
from models.models import User, Business, BusinessStatus
from models.schemas import UserLogin, UserRegister, VendorRegister, TokenOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenOut, status_code=201)
async def register_user(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(data.password)
    user = User(email=data.email, password_hash=hashed_password, role="vendor")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    })
    return TokenOut(access_token=token)

@router.post("/vendor-register", response_model=TokenOut, status_code=201)
async def vendor_register(data: VendorRegister, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Atomic transaction
        hashed_password = get_password_hash(data.password)
        user = User(
            email=data.email, 
            password_hash=hashed_password, 
            role="vendor",
            is_active=False
        )
        db.add(user)
        await db.flush() # Get user.id
        
        # Create Business
        slug = slugify(data.business_name.strip())
        # Ensure unique slug
        existing_slug = await db.execute(select(Business).where(Business.slug == slug))
        if existing_slug.scalar_one_or_none():
            unique_id = str(uuid.uuid4())[:8]
            slug = f"{slug}-{unique_id}"
            
        business = Business(
            name_en=data.business_name,
            slug=slug,
            category_id=data.category_id,
            governorate_id=data.location_id,
            address=data.address,
            phone=data.phone,
            owner_id=user.id,
            trade_license_url=data.trade_license_url,
            id_proof_url=data.id_proof_url,
            owner_photo_url=data.owner_photo_url,
            status=BusinessStatus.pending
        )
        db.add(business)
        await db.commit()
        await db.refresh(user)
        
        token = create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        })
        return TokenOut(access_token=token)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=TokenOut)
async def login_user(data: UserLogin, db: AsyncSession = Depends(get_db)):
    email = data.email.strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if user.role == "vendor" and not user.is_active:
        raise HTTPException(
            status_code=403, 
            detail="Your business is pending admin approval."
        )
        
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    })
    return TokenOut(access_token=token)
