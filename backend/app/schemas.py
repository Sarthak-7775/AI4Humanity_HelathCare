# backend/app/schemas.py
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# --- Chatbot Schemas ---
class ChatbotRequest(BaseModel):
    patient_id: int = Field(..., description="The ID of the patient to fetch personal records for.")
    symptoms_input: str = Field(..., example="I have had a severe headache and blurred vision for 2 days.")

class ChatbotResponse(BaseModel):
    triage_advice: str = Field(..., description="Initial medical guidance based on symptoms and patient history.")
    probable_causes: list[str] = Field(..., description="List of possible medical conditions.")
    recommended_tests: list[str] = Field(..., description="Specific medical tests recommended.")
    urgency_level: str = Field(..., description="E.g., LOW, MEDIUM, HIGH, EMERGENCY")
    recommended_department: str = Field(..., description="The specific hospital department required (e.g., Cardiology, Neurology, General Physician).")

# --- User Schemas ---
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: str | None = None
    role: str = "patient" # 'patient' or 'doctor'

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    avatar_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Token Schema ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Emergency Routing Schemas ---
class EmergencyRequest(BaseModel):
    user_latitude: float
    user_longitude: float
    budget_tier: str  # E.g., 'Low', 'Medium', 'Premium'
    medical_condition: str  # E.g., 'Cardiology', 'General', 'Neurology'

class EmergencyResponse(BaseModel):
    hospital_name: str
    hospital_id: int
    distance_km: float
    estimated_time_mins: int
    available_beds: int
    uber_deep_link: str
    google_maps_link: str

# --- Appointment Schemas ---
class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    hospital_id: int
    appointment_time: datetime
    patient_phone: str # Needed for Twilio

class AppointmentResponse(BaseModel):
    appointment_id: int
    status: str
    message: str