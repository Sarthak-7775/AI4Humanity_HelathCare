# backend/app/models.py
from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    phone_number = Column(String)
    role = Column(String, default="patient")  # Roles: 'patient', 'doctor', 'admin'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    appointments = relationship("Appointment", back_populates="patient")
    reports = relationship("MedicalReport", back_populates="patient")


class Hospital(Base):
    __tablename__ = "hospitals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    budget_tier = Column(String)  # E.g., 'Low', 'Medium', 'Premium'
    specialties = Column(JSON)    # E.g., ["Cardiology", "Neurology", "General"]
    total_beds = Column(Integer, default=100)
    available_beds = Column(Integer, default=100)

    # Relationships
    appointments = relationship("Appointment", back_populates="hospital")


class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    doctor_name = Column(String)
    scheduled_time = Column(DateTime(timezone=True))
    status = Column(String, default="scheduled")  # 'scheduled', 'delayed', 'completed', 'cancelled'

    # Relationships
    patient = relationship("User", back_populates="appointments")
    hospital = relationship("Hospital", back_populates="appointments")


class DoctorSlot(Base):
    __tablename__ = "doctor_slots"
    __table_args__ = (
        UniqueConstraint("doctor_id", "slot_time", name="uq_doctor_slots_doctor_time"),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    slot_time = Column(DateTime(timezone=True))
    is_booked = Column(Boolean, default=False)


class MedicalReport(Base):
    __tablename__ = "medical_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    report_url = Column(String, nullable=False)   # URL from AWS S3 or Supabase Storage
    document_type = Column(String)                # E.g., 'Blood Test', 'X-Ray'
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    patient = relationship("User", back_populates="reports")


class KnowledgeDocument(Base):
    """
    This table stores the medical guidelines and documents for the RAG Triage Bot.
    """
    __tablename__ = "knowledge_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    
    # Vector column storing 1536 dimensions (Standard for OpenAI's text-embedding-ada-002)
    embedding = Column(Vector(1536))