# backend/app/api/routes_appointment.py
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Appointment, DoctorSlot
from app.schemas import AppointmentCreate, AppointmentResponse
from app.services.notification_service import send_sms_notification

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("")
def list_appointments(
    patient_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Appointment).order_by(Appointment.scheduled_time.desc())
    if patient_id is not None:
        query = query.filter(Appointment.patient_id == patient_id)

    appointments = query.all()
    return {
        "appointments": [
            {
                "id": apt.id,
                "doctor": apt.doctor_name or "Prescripto Doctor",
                "speciality": "Consultation",
                "address": "Prescripto Partner Hospital",
                "date": apt.scheduled_time.date().isoformat() if apt.scheduled_time else "",
                "time": apt.scheduled_time.strftime("%I:%M %p") if apt.scheduled_time else "",
                "status": apt.status.title() if apt.status else "Scheduled",
                "paid": False,
                "fee": "$80",
            }
            for apt in appointments
        ]
    }


@router.post("/book", response_model=AppointmentResponse)
def book_appointment(
    appointment: AppointmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    slot = (
        db.query(DoctorSlot)
        .filter(
            DoctorSlot.doctor_id == appointment.doctor_id,
            DoctorSlot.slot_time == appointment.appointment_time,
        )
        .first()
    )

    if slot is None:
        slot = DoctorSlot(
            doctor_id=appointment.doctor_id,
            patient_id=appointment.patient_id,
            slot_time=appointment.appointment_time,
            is_booked=False,
        )
        db.add(slot)
        db.flush()

    if slot.is_booked:
        raise HTTPException(status_code=400, detail="This slot is already booked. Please choose another time.")

    slot.is_booked = True
    slot.patient_id = appointment.patient_id

    new_appointment = Appointment(
        patient_id=appointment.patient_id,
        hospital_id=appointment.hospital_id,
        doctor_name="Prescripto Doctor",
        scheduled_time=appointment.appointment_time,
        status="scheduled",
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    msg = f"Prescripto: Your appointment is confirmed for {appointment.appointment_time.strftime('%Y-%m-%d %H:%M')}."
    background_tasks.add_task(send_sms_notification, appointment.patient_phone, msg)

    return AppointmentResponse(
        appointment_id=new_appointment.id,
        status="Confirmed",
        message="Appointment booked successfully. SMS confirmation sent.",
    )


@router.post("/elective-recommendation")
def get_elective_recommendations(user_budget: str, required_specialty: str, user_lat: float, user_lon: float, db: Session = Depends(get_db)):
    """
    Recommends hospitals for standard appointments.
    Prioritizes Budget Match and Specialty first, then sorts by distance.
    """
    query = """
        SELECT name, budget_tier, specialties,
               (3959 * sqrt(
                   power(radians(longitude - :user_lon) * cos(radians((latitude + :user_lat) / 2.0)), 2) +
                   power(radians(latitude - :user_lat), 2)
               )) as distance_miles
        FROM hospitals
        WHERE specialties::text ILIKE :specialty
        ORDER BY
            CASE WHEN budget_tier = :budget THEN 0 ELSE 1 END,
            distance_miles ASC
        LIMIT 5;
    """

    results = db.execute(query, {
        "specialty": f"%{required_specialty}%",
        "budget": user_budget,
        "user_lon": user_lon,
        "user_lat": user_lat,
    }).fetchall()

    return {"recommended_hospitals": [dict(r._mapping) for r in results]}