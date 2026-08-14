import os
import uuid

import boto3
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import MedicalReport, User
from app.services.report_processor import (
    process_and_vectorize_report,
)

load_dotenv()

router = APIRouter(prefix="/reports", tags=["Medical Reports"])

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

@router.post("/upload")
async def upload_medical_report(
    patient_id: int | None = Form(None),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if patient_id is None:
        patient_id = current_user.id
    elif patient_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to upload a report for another patient.")

    if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs and Images are allowed.")

    patient = db.query(User).filter(User.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        file_bytes = await file.read()
        file.file.seek(0)

        file_extension = file.filename.split(".")[-1]
        unique_filename = f"reports/patient_{patient_id}/{uuid.uuid4()}.{file_extension}"

        s3_client.upload_fileobj(
            file.file,
            BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type},
        )

        # Generate a presigned URL so the frontend can securely fetch the object
        if not BUCKET_NAME:
            raise HTTPException(status_code=500, detail="Storage bucket is not configured.")

        try:
            report_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': unique_filename},
                ExpiresIn=3600,  # 1 hour
            )
        except Exception:
            # Fallback to the public URL pattern if presign fails
            region = os.getenv("AWS_REGION")
            report_url = f"https://{BUCKET_NAME}.s3.{region}.amazonaws.com/{unique_filename}"

        new_report = MedicalReport(
            patient_id=patient_id,
            report_url=report_url,
            document_type=document_type,
        )
        db.add(new_report)

        if file.content_type == "application/pdf":
            process_and_vectorize_report(
                file_bytes=file_bytes,
                file_name=file.filename,
                user_id=str(patient_id),
            )

        db.commit()
        db.refresh(new_report)

        return {
            "message": "Report uploaded and AI context generated successfully",
            "report_id": new_report.id,
            "url": report_url,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {e!s}")
