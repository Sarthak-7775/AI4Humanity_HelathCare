import os
import uuid
from datetime import timedelta

import boto3
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.models import User
from app.schemas import Token, UserCreate, UserResponse

load_dotenv()

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = get_password_hash(user.password)
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_pwd,
        phone_number=user.phone_number,
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role,
            "id": user.id,
            "name": user.full_name,
            "avatar_url": user.avatar_url,
        },
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/avatar")
async def upload_profile_avatar(
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not BUCKET_NAME:
        raise HTTPException(status_code=500, detail="Storage bucket is not configured.")

    if avatar.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG and WEBP images are accepted.")

    file_extension = avatar.filename.split(".")[-1]
    unique_filename = f"avatars/user_{current_user.id}/{uuid.uuid4()}.{file_extension}"

    try:
        s3_client.upload_fileobj(
            avatar.file,
            BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": avatar.content_type},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {e}")

    region = os.getenv("AWS_REGION")
    current_user.avatar_url = f"https://{BUCKET_NAME}.s3.{region}.amazonaws.com/{unique_filename}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {"message": "Profile photo updated successfully", "avatar_url": current_user.avatar_url}
