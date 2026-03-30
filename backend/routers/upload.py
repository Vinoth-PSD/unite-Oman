from fastapi import APIRouter, HTTPException, UploadFile, File
import uuid
import os
import shutil
from core.config import settings

router = APIRouter(prefix="/api/upload", tags=["upload"])

# Ensure upload directory exists
UPLOAD_PATH = os.path.join(os.getcwd(), settings.UPLOAD_DIR)
os.makedirs(UPLOAD_PATH, exist_ok=True)

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
):
    try:
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        filepath = os.path.join(UPLOAD_PATH, filename)
        
        # Save file locally
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return relative URL so frontend can prepend VITE_API_URL
        url = f"/{settings.UPLOAD_DIR}/{filename}"
        
        return {"url": url}
        
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
