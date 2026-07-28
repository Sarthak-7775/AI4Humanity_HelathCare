# backend/app/api/routes_appointments.py
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

# Assuming you have a get_db dependency set up
from app.core.database import get_db
from app.models import Appointment
from app.schemas import AppointmentCreate, AppointmentResponse
from app.services.notification_service import send_sms_notification

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/book", response_model=AppointmentResponse)
def book_appointment(
    appointment: AppointmentCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # 1. Start a database transaction with ROW-LEVEL LOCKING (FOR UPDATE)
    # This prevents concurrent double-booking of the exact same slot.
    check_slot_query = text("""
        SELECT is_booked FROM doctor_slots 
        WHERE doctor_id = :doctor_id AND slot_time = :appointment_time 
        FOR UPDATE
    """)
    
    slot = db.execute(check_slot_query, {
        "doctor_id": appointment.doctor_id,
        "appointment_time": appointment.appointment_time
    }).fetchone()

    # 2. Check if the slot exists and is available
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found.")
    if slot.is_booked:
        raise HTTPException(status_code=400, detail="This slot is already booked. Please choose another time.")

    # 3. If available, book the slot
    update_slot_query = text("""
        UPDATE doctor_slots 
        SET is_booked = TRUE, patient_id = :patient_id 
        WHERE doctor_id = :doctor_id AND slot_time = :appointment_time
    """)
    db.execute(update_slot_query, {
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "appointment_time": appointment.appointment_time
    })
    
    # 3.5 Create the Appointment Record
    new_appointment = Appointment(
        patient_id=appointment.patient_id,
        hospital_id=appointment.hospital_id,
        scheduled_time=appointment.appointment_time,
        status="scheduled"
    )
    db.add(new_appointment)
    
    # Commit the transaction, releasing the lock
    db.commit()
    db.refresh(new_appointment)

    # 4. Trigger the SMS Notification Asynchronously
    msg = f"Prescripto: Your appointment is confirmed for {appointment.appointment_time.strftime('%Y-%m-%d %H:%M')}."
    background_tasks.add_task(send_sms_notification, appointment.patient_phone, msg)

    return AppointmentResponse(
        appointment_id=new_appointment.id,
        status="Confirmed",
        message="Appointment booked successfully. SMS confirmation sent."
    )

@router.post("/elective-recommendation")
def get_elective_recommendations(user_budget: str, required_specialty: str, user_lat: float, user_lon: float, db: Session = Depends(get_db)):
    """
    Recommends hospitals for standard appointments.
    Prioritizes Budget Match and Specialty first, then sorts by distance.
    """
    # Assuming you are using pg_vector or PostGIS for distance calculation 
    # from Phase 3, we tweak the ORDER BY clause.
    
    query = text("""
        SELECT name, budget_tier, specialties, 
               (3959 * sqrt(
                   power(radians(longitude - :user_lon) * cos(radians((latitude + :user_lat) / 2.0)), 2) + 
                   power(radians(latitude - :user_lat), 2)
               )) as distance_miles
        FROM hospitals
        WHERE specialties::text ILIKE :specialty
        ORDER BY 
            CASE WHEN budget_tier = :budget THEN 0 ELSE 1 END, -- Exact budget match first
            distance_miles ASC -- Then nearest among budget matches
        LIMIT 5;
    """)
    
    results = db.execute(query, {
        "specialty": f"%{required_specialty}%", 
        "budget": user_budget,
        "user_lon": user_lon,
        "user_lat": user_lat
    }).fetchall()
    
    return {"recommended_hospitals": [dict(r._mapping) for r in results]}