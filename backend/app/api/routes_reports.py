# backend/app/api/routes_reports.py
import os
import uuid

import boto3
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import MedicalReport, User
from app.services.report_processor import (
    process_and_vectorize_report,  # NEW: Import RAG processor
)

load_dotenv()

router = APIRouter(prefix="/reports", tags=["Medical Reports"])

# Initialize the S3 Client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

@router.post("/upload")
async def upload_medical_report(
    patient_id: int = Form(...), # In production, extract this from the JWT token
    document_type: str = Form(...), 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # 1. Validate the file type (Ensure it's a PDF or Image)
    if not file.content_type in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs and Images are allowed.")

    # 2. Verify the patient exists
    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        # NEW: Read file bytes for vectorization BEFORE the file cursor is moved by S3
        file_bytes = await file.read()
        file.file.seek(0) # Reset cursor so S3 can read it from the beginning

        # 3. Generate a secure, unique filename to prevent overwrites
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"reports/patient_{patient_id}/{uuid.uuid4()}.{file_extension}"

        # 4. Upload directly to AWS S3
        s3_client.upload_fileobj(
            file.file, 
            BUCKET_NAME, 
            unique_filename,
            ExtraArgs={"ContentType": file.content_type} # Ensures it displays correctly in browser
        )

        # 5. Construct the public/secure URL
        region = os.getenv("AWS_REGION")
        report_url = f"https://{BUCKET_NAME}.s3.{region}.amazonaws.com/{unique_filename}"

        # 6. Save the record in Neon Database
        new_report = MedicalReport(
            patient_id=patient_id,
            report_url=report_url,
            document_type=document_type
        )
        db.add(new_report)

        # 7. NEW: Process and Vectorize for RAG (Only if it's a PDF)
        if file.content_type == "application/pdf":
            process_and_vectorize_report(
                file_bytes=file_bytes, 
                file_name=file.filename, 
                user_id=str(patient_id)
            )

        # Commit to DB only if S3 upload and Vectorization succeed
        db.commit()
        db.refresh(new_report)

        return {
            "message": "Report uploaded and AI context generated successfully", 
            "report_id": new_report.id,
            "url": report_url
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {e!s}")