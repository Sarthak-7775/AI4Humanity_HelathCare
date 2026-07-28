# backend/app/api/routes_routing.py
import urllib.parse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Hospital
from app.schemas import EmergencyRequest, EmergencyResponse
from app.services.routing_engine import calculate_eta, calculate_haversine_distance

router = APIRouter(prefix="/emergency", tags=["Routing & Logistics"])

@router.post("/find-fastest-hospital", response_model=EmergencyResponse)
def find_fastest_hospital(request: EmergencyRequest, db: Session = Depends(get_db)):
    
    # 1. Filter Hospitals by Beds and Budget
    hospitals = db.query(Hospital).filter(
        Hospital.available_beds > 0,
        Hospital.budget_tier == request.budget_tier
    ).all()

    if not hospitals:
        raise HTTPException(status_code=404, detail="No hospitals found matching your criteria.")

    # 2. Filter by Specialty (Medical Condition) in Python
    # Since specialties is stored as JSON, we check if the required condition is in the list
    qualified_hospitals = []
    condition = request.medical_condition.lower()
    
    for hosp in hospitals:
        # Convert JSON list to lowercase for case-insensitive matching
        specialty_list = [s.lower() for s in hosp.specialties]
        if condition in specialty_list or "general" in specialty_list:
            qualified_hospitals.append(hosp)

    if not qualified_hospitals:
        raise HTTPException(status_code=404, detail=f"No hospitals found for condition: {request.medical_condition}")

    # 3. Calculate Distance & ETA for all qualified hospitals
    hospital_metrics = []
    for hosp in qualified_hospitals:
        dist = calculate_haversine_distance(
            request.user_latitude, request.user_longitude,
            hosp.latitude, hosp.longitude
        )
        eta = calculate_eta(dist)
        hospital_metrics.append({
            "hospital": hosp,
            "distance_km": round(dist, 2),
            "eta_mins": eta
        })

    # 4. Sort to find the absolute fastest hospital to reach
    hospital_metrics.sort(key=lambda x: x["eta_mins"])
    best_match = hospital_metrics[0]
    target_hospital = best_match["hospital"]

    # 5. Generate Dynamic Deep Links for Dispatch System
    encoded_name = urllib.parse.quote(target_hospital.name)
    
    # Universal Uber Deep Link (Opens app pre-filled with destination)
    uber_link = f"https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]={target_hospital.latitude}&dropoff[longitude]={target_hospital.longitude}&dropoff[nickname]={encoded_name}"
    
    # Google Maps Directions Link
    gmaps_link = f"https://www.google.com/maps/dir/?api=1&origin={request.user_latitude},{request.user_longitude}&destination={target_hospital.latitude},{target_hospital.longitude}&travelmode=driving"

    # 6. Return the ultimate emergency response
    return EmergencyResponse(
        hospital_name=target_hospital.name,
        hospital_id=target_hospital.id,
        distance_km=best_match["distance_km"],
        estimated_time_mins=best_match["eta_mins"],
        available_beds=target_hospital.available_beds,
        uber_deep_link=uber_link,
        google_maps_link=gmaps_link
    )